const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const User = require('../models/User');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/classroom/callback'
);

// 1. Initiate OAuth Flow
router.get('/auth', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.me.readonly'
      ],
      state: userId // pass user ID so we know who they are on callback
    });
    
    res.redirect(url);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// 2. OAuth Callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.send('Authorization failed. No code provided.');
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to the user
    await User.findByIdAndUpdate(state, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token
    });
    
    // Redirect back to frontend settings page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/settings?google_sync=success`);
  } catch (error) {
    console.error('Callback error:', error);
    res.send('Error saving Google tokens. Please try again.');
  }
});

// 3. Sync Coursework
router.get('/sync', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.googleAccessToken) {
    return res.status(400).json({ message: 'Google Classroom is not connected.' });
  }
  
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken
  });
  
  try {
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    
    // Fetch user's courses
    const { data } = await classroom.courses.list({ studentId: 'me', courseStates: ['ACTIVE'] });
    const courses = data.courses;
    
    let syncedCount = 0;
    
    if (courses && courses.length > 0) {
      for (const course of courses) {
        // Fetch coursework for each course
        const resWork = await classroom.courses.courseWork.list({ courseId: course.id });
        const courseworkList = resWork.data.courseWork;
        
        if (courseworkList && courseworkList.length > 0) {
          for (const work of courseworkList) {
            if (work.dueDate) {
              // Convert Google Date/Time to JS Date
              const year = work.dueDate.year;
              const month = work.dueDate.month - 1; // 0-indexed
              const day = work.dueDate.day;
              const hours = work.dueTime?.hours !== undefined ? work.dueTime.hours : 23;
              const minutes = work.dueTime?.minutes !== undefined ? work.dueTime.minutes : 59;
              
              const dueDate = new Date(Date.UTC(year, month, day, hours, minutes));
              
              // Prevent duplicates based on title and user
              const existingTask = await Task.findOne({ title: work.title, user: user._id });
              
              if (!existingTask) {
                await Task.create({
                  title: work.title,
                  subject: course.name,
                  dueDate: dueDate,
                  notes: work.description || 'Imported from Google Classroom',
                  priority: 'Medium',
                  status: 'Pending',
                  user: user._id
                });
                syncedCount++;
              }
            }
          }
        }
      }
    }
    
    res.json({ message: `Successfully synced ${syncedCount} new assignments from Google Classroom!` });
  } catch (error) {
    console.error('Classroom Sync Error:', error.message);
    res.status(500).json({ message: 'Failed to sync. Tokens might be expired or permissions revoked.' });
  }
});

module.exports = router;
