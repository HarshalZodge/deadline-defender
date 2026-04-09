import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './AddDeadline.css';

const AddDeadline = () => {
  const navigate = useNavigate();
  const { user, axiosInstance } = useContext(AuthContext);
  
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weightage, setWeightage] = useState('');
  const [priority, setPriority] = useState('Auto');
  const [notes, setNotes] = useState('');
  const [generateSubtasks, setGenerateSubtasks] = useState(false);

  useEffect(() => {
      if (!user) navigate('/login');
  }, [user, navigate]);

  const saveTask = async () => {
      try {
          await axiosInstance.post('/api/tasks', {
              subject,
              title,
              dueDate: new Date(dueDate),
              weightage: Number(weightage) || 0,
              priority,
              notes,
              generateSubtasks,
          });
          navigate('/dashboard');
      } catch (err) {
          console.error(err);
          alert('Error saving task');
      }
  };

  return (
    <div className="screen-container">
      <div className="form-screen">
        <div className="form-screen-header">
          <div className="back-btn" onClick={() => navigate(-1)}>←</div>
          <div className="screen-title">Add Deadline</div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="form-input" type="text" placeholder="e.g. Data Structures" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Assignment Title</label>
          <input className="form-input" type="text" placeholder="e.g. Lab Report 3" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Due Date & Time</label>
          <input className="form-input" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Weightage (%)</label>
          <input className="form-input" type="number" placeholder="e.g. 20" value={weightage} onChange={(e) => setWeightage(e.target.value)} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Priority</label>
          <div className="priority-grid">
            <div className={`priority-opt ${priority === 'Auto' ? 'selected-auto' : ''}`} onClick={() => setPriority('Auto')}>
              <span className="p-icon">🤖</span>Auto
            </div>
            <div className={`priority-opt ${priority === 'High' ? 'selected-high' : ''}`} onClick={() => setPriority('High')}>
              <span className="p-icon">🔴</span>High
            </div>
            <div className={`priority-opt ${priority === 'Medium' ? 'selected-med' : ''}`} onClick={() => setPriority('Medium')}>
              <span className="p-icon">🟡</span>Medium
            </div>
            <div className={`priority-opt ${priority === 'Low' ? 'selected-low' : ''}`} onClick={() => setPriority('Low')}>
              <span className="p-icon">🟢</span>Low
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <textarea className="form-input" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
        </div>

        <div className="form-group ai-toggle-container">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#eef2ff', padding: '12px', borderRadius: '8px', border: '1px solid #d0d7ff', color: '#4361ee' }}>
            <input 
              type="checkbox" 
              checked={generateSubtasks} 
              onChange={(e) => setGenerateSubtasks(e.target.checked)} 
              style={{ marginRight: '10px', width: '20px', height: '20px', cursor: 'pointer', accentColor: '#4361ee' }}
            />
            ✨ Auto-generate Subtasks with AI
          </label>
        </div>
        
        <button className="btn-primary" onClick={saveTask}>Save Deadline ✓</button>
      </div>
      <BottomNav />
    </div>
  );
};

export default AddDeadline;
