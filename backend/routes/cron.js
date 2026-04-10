const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const sendEmail = require('../utils/sendEmail');

// Endpoint: GET /api/cron/reminders?secret=YOUR_SECRET
router.get('/reminders', async (req, res) => {
    try {
        // 1. Security Check
        const secret = req.query.secret;
        if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
            return res.status(401).json({ message: 'Unauthorized cron request. Invalid or missing secret.' });
        }

        // 2. Calculate the 24-hour window
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // 3. Find impending tasks and populate the user (to get their email)
        const upcomingTasks = await Task.find({
            dueDate: { $gte: now, $lte: tomorrow },
            status: { $ne: 'Completed' }
        }).populate('user', 'name email');

        // 4. Group tasks by User Email (batch sending)
        const userTasks = {};
        upcomingTasks.forEach(task => {
            if (!task.user || !task.user.email) return;
            const email = task.user.email;
            if (!userTasks[email]) {
                userTasks[email] = { name: task.user.name, tasks: [] };
            }
            userTasks[email].tasks.push(task);
        });

        // 5. Fire off the emails
        const emailsSent = [];
        for (const [email, data] of Object.entries(userTasks)) {
            let tasksHtml = data.tasks.map(t => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${t.subject}</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.title}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #ff4d6d; font-weight: bold;">
                        ${new Date(t.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                </tr>
            `).join('');

            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e0e0e8; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h2 style="color: #7c5cfc; margin-top: 0;">Hello, ${data.name}! 👋</h2>
                    <p style="color: #555; font-size: 15px; line-height: 1.5;">This is your DeadlineDefender automated warning. You have <strong style="color: #ff4d6d;">${data.tasks.length}</strong> tasks due within the next 24 hours.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; background: #fdfdfd;">
                        <thead>
                            <tr style="background: #f4f6f9;">
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Subject</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Task</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Due By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasksHtml}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #8888a0; font-size: 13px; margin: 0;">Go crush it! Break big tasks down using your AI tools if you are stuck.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: `🚨 Deadline Warning: ${data.tasks.length} Tasks Due Tomorrow!`,
                html
            });
            emailsSent.push(email);
        }

        res.json({ message: 'Cron job executed successfully', usersNotified: emailsSent.length, emailsSent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
