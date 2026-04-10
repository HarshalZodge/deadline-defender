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
  const [aiStartTip, setAiStartTip] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  const getAiStart = async () => {
    try {
      setAiStartTip('AI is thinking...');
      const { data } = await axiosInstance.get(`/api/tasks/${id}/ai-start`);
      setAiStartTip(data.message);
    } catch (err) {
      setAiStartTip('Failed to get suggestion. Is Gemini API configured?');
    }
  };

  const summarizeNotes = async () => {
    try {
      setIsSummarizing(true);
      const { data } = await axiosInstance.post(`/api/tasks/${id}/ai-summarize`);
      setTask(data);
      setIsSummarizing(false);
    } catch (err) {
      console.error(err);
      setIsSummarizing(false);
      alert('Must be >10 characters to summarize!');
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
              <div className="section-title" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Notes
                <button onClick={summarizeNotes} disabled={isSummarizing || task.notes.length < 10} style={{ background: 'var(--card)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>
                  {isSummarizing ? "Working..." : "✨ Summarize"}
                </button>
              </div>
              <p style={{fontSize: '13px', color: 'var(--muted)', whiteSpace: 'pre-line'}}>{task.notes}</p>
            </div>
        )}

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <button onClick={getAiStart} style={{ width: '100%', background: 'linear-gradient(90deg, var(--accent), #9b72ff)', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Inter' }}>
              ✨ How Do I Start?
            </button>
            {aiStartTip && (
                <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(124,92,252,.1)', borderLeft: '4px solid var(--accent)', borderRadius: '0 8px 8px 0', fontSize: '14px', color: 'var(--text)' }}>
                    <b>AI Suggestion:</b> {aiStartTip}
                </div>
            )}
        </div>
        
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
