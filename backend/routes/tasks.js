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
            let { generateSubtasks, ...taskData } = req.body;
            let subtasks = [];
            
            if (process.env.GEMINI_API_KEY) {
                try {
                    const { GoogleGenAI } = require('@google/genai');
                    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                    
                    if (taskData.priority === 'Auto' || !taskData.priority) {
                        const prioPrompt = `Evaluate the priority (High, Medium, Low) for this academic task: Title: ${taskData.title}, Subject: ${taskData.subject}, Weightage: ${taskData.weightage}%. Return ONLY the word High, Medium, or Low.`;
                        const prioResp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prioPrompt });
                        const rawPrio = prioResp.text.trim();
                        if (['High', 'Medium', 'Low'].includes(rawPrio)) {
                            taskData.priority = rawPrio;
                        } else {
                            taskData.priority = 'Medium';
                        }
                    }

                    if (generateSubtasks) {
                        const prompt = `Break down the following academic task into 3 to 5 actionable subtasks. Return ONLY a JSON array of strings, nothing else. Task Title: ${taskData.title}. Subject: ${taskData.subject}.`;
                        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                        
                        let textResp = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                        let aiSubtasks = JSON.parse(textResp);
                        if (Array.isArray(aiSubtasks)) {
                            subtasks = aiSubtasks.map(title => ({ title, completed: false }));
                        }
                    }
                } catch (aiErr) {
                    console.error('AI Processing failed:', aiErr.message);
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

router.get('/ai-coach', protect, async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) return res.json({ message: "Provide a Gemini API key in your .env to unlock AI insights!" });
        const tasks = await Task.find({ user: req.user._id });
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        let completed = tasks.filter(t => t.status === 'Completed').length;
        let total = tasks.length;
        let subjects = {};
        tasks.forEach(t => { if (t.subject) subjects[t.subject] = (subjects[t.subject] || 0) + 1; });
        
        const prompt = `Act as an encouraging academic coach. The student has completed ${completed} out of ${total} total tasks. Their subjects include: ${Object.keys(subjects).join(', ')}. Give a 3-sentence motivational evaluation of their progress and strict advice on prioritizing deadlines. No markdown.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ message: response.text.trim() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/ai-start', protect, async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) return res.json({ message: "Provide a Gemini key to unlock AI!" });
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not auth' });
        
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `The student is procrastinating on an academic task called "${task.title}" for the subject "${task.subject}". Suggest a hyper-specific, extremely easy 5-minute micro-task they can do RIGHT NOW to break their mental block and start working. Return only the instruction string (1 short sentence).`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ message: response.text.replace(/"/g, '').trim() });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/ai-summarize', protect, async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) return res.status(400).json({ message: "Missing Gemini API key." });
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not auth' });
        if (!task.notes || task.notes.length < 10) return res.status(400).json({ message: 'Notes too short to summarize.' });

        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Summarize the following syllabus or assignment notes into 3 strictly actionable bullet points focused on deliverables. Notes: ${task.notes}`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        task.notes = response.text.trim();
        await task.save();
        res.json(task);
    } catch(err) {
        res.status(500).json({ message: err.message });
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
