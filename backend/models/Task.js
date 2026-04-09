const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    weightage: { type: Number, default: 0 },
    priority: { type: String, enum: ['Auto', 'High', 'Medium', 'Low'], default: 'Auto' },
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    subtasks: [{
        title: { type: String },
        completed: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
