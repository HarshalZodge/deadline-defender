import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './TaskDetail.css';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, axiosInstance } = useContext(AuthContext);
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
    const fetchTask = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/tasks/${id}`);
        setTask(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchTask();
  }, [id, user, navigate, axiosInstance]);

  const markComplete = async () => {
      try {
          await axiosInstance.put(`/api/tasks/${id}`, { status: 'Completed' });
          navigate('/dashboard');
      } catch (err) {
          console.error(err);
      }
  };

  const deleteTask = async () => {
      try {
          await axiosInstance.delete(`/api/tasks/${id}`);
          navigate('/dashboard');
      } catch (err) {
          console.error(err);
      }
  };

  if (!task) return <div style={{padding: '20px', color: 'var(--text)'}}>Loading...</div>;

  return (
    <div className="screen-container">
      <div className="detail-screen">
        <div className="form-screen-header" style={{ marginBottom: '14px' }}>
          <div className="back-btn" onClick={() => navigate(-1)}>←</div>
          <div className="screen-title">Task Detail</div>
        </div>
        
        <div className="detail-hero">
          <div className="detail-subject-row">
            <div className="subject-chip">{task.subject}</div>
            {task.priority === 'High' && <div className="priority-chip-high">🔴 HIGH</div>}
            {task.priority === 'Medium' && <div className="priority-chip-high" style={{borderColor: 'var(--yellow)', color: 'var(--yellow)', background: 'rgba(255,209,102,.12)'}}>🟡 MED</div>}
            {task.priority === 'Low' && <div className="priority-chip-high" style={{borderColor: 'var(--green)', color: 'var(--green)', background: 'rgba(77,255,180,.12)'}}>🟢 LOW</div>}
            {task.priority === 'Auto' && <div className="priority-chip-high" style={{borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(124,92,252,.12)'}}>🤖 AUTO</div>}
          </div>
          <div className="detail-title">{task.title}</div>
          <div className="countdown-box">
            <div className="countdown-icon">⚠️</div>
            <div>
              <div className="countdown-label">Status</div>
              <div className="countdown-value">{task.status}</div>
            </div>
          </div>
        </div>
        
        <div className="meta-grid">
          <div className="meta-card">
            <div className="meta-key">Due Date</div>
            <div className="meta-val">{new Date(task.dueDate).toLocaleDateString()}</div>
          </div>
          <div className="meta-card">
            <div className="meta-key">Due Time</div>
            <div className="meta-val">{new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="meta-card">
            <div className="meta-key">Weightage</div>
            <div className="meta-val">{task.weightage}%</div>
          </div>
        </div>
        
        {task.notes && (
             <div className="subtasks">
              <div className="section-title" style={{ marginBottom: '10px' }}>Notes</div>
              <p style={{fontSize: '13px', color: 'var(--muted)'}}>{task.notes}</p>
            </div>
        )}
        
        {task.status !== 'Completed' && <button className="btn-complete" onClick={markComplete}>✅ Mark as Complete</button>}
        <div className="btn-row">
          <button className="btn-outline">✏️ Edit</button>
          <button className="btn-outline" onClick={deleteTask}>🗑️ Delete</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default TaskDetail;
