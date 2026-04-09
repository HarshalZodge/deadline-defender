const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, async (req, res) => {
        try {
            const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 });
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, async (req, res) => {
        try {
            const { generateSubtasks, ...taskData } = req.body;
            let subtasks = [];
            
            if (generateSubtasks && process.env.GEMINI_API_KEY) {
                try {
                    const { GoogleGenAI } = require('@google/genai');
                    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                    const prompt = `Break down the following academic task into 3 to 5 actionable subtasks. Return ONLY a JSON array of strings, nothing else. Task Title: ${taskData.title}. Subject: ${taskData.subject}.`;
                    
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                    });
                    
                    let textResp = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                    let aiSubtasks = JSON.parse(textResp);
                    if (Array.isArray(aiSubtasks)) {
                        subtasks = aiSubtasks.map(title => ({ title, completed: false }));
                    }
                } catch (aiErr) {
                    console.error('AI Breakdown failed:', aiErr.message);
                }
            }

            const task = await Task.create({ ...taskData, subtasks, user: req.user._id });
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.get('/notifications', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 });
        const notifications = [];
        const now = new Date();

        tasks.forEach(task => {
            if (!task.dueDate) return;
            const dueDate = new Date(task.dueDate);
            const diffTime = dueDate - now;
            const diffHours = diffTime / (1000 * 60 * 60);

            if (task.status === 'Completed') {
                if (diffHours > -72) { 
                    notifications.push({
                        _id: task._id + '_comp',
                        taskId: task._id,
                        type: 'Completed',
                        title: `${task.subject} Completed!`,
                        body: `Great work! You finished ${task.title}. 🎉`,
                        time: 'Recently'
                    });
                }
                return; 
            }

            if (diffHours < 0) {
                notifications.push({
                    _id: task._id + '_crit1',
                    taskId: task._id,
                    type: 'Critical',
                    title: `Overdue: ${task.title}`,
                    body: `${task.subject} was due ${Math.abs(Math.round(diffHours))} hours ago.`,
                    time: 'Overdue'
                });
            } else if (diffHours <= 24) {
                notifications.push({
                    _id: task._id + '_crit2',
                    taskId: task._id,
                    type: 'Critical',
                    title: `${task.title} — Due soon!`,
                    body: `${task.subject} is due in ${Math.round(diffHours)} hours.`,
                    time: 'Soon'
                });
            } else if (diffHours <= 72) {
                notifications.push({
                    _id: task._id + '_warn',
                    taskId: task._id,
                    type: 'Warning',
                    title: `${task.title} — Upcoming`,
                    body: `${task.subject} is due in ${Math.round(diffHours / 24)} days.`,
                    time: 'Upcoming'
                });
            } else if (diffHours <= 168) {
                notifications.push({
                    _id: task._id + '_info',
                    taskId: task._id,
                    type: 'Info',
                    title: `${task.title} — Reminder`,
                    body: `${task.subject} is due next week.`,
                    time: 'Reminder'
                });
            }
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.route('/:id')
    .put(protect, async (req, res) => {
        try {
            const task = await Task.findById(req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });
            if (task.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedTask);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .delete(protect, async (req, res) => {
        try {
            const task = await Task.findById(req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });
            if (task.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await Task.findByIdAndDelete(req.params.id);
            res.json({ message: 'Task removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .get(protect, async (req, res) => {
        try {
            const task = await Task.findById(req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });
            if (task.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            res.json(task);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;
