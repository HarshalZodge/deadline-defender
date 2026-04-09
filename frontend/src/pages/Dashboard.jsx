import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, axiosInstance } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchTasks = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/tasks`);
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, [user, navigate, axiosInstance]);

  if (!user) return null;

  const now = new Date();
  
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'Completed');
  const upcomingTasks = tasks.filter(t => new Date(t.dueDate) >= now && t.status !== 'Completed');
  
  const dueTodayCount = upcomingTasks.filter(t => new Date(t.dueDate).toDateString() === now.toDateString()).length;
  const thisWeekCount = upcomingTasks.filter(t => {
      const diff = new Date(t.dueDate) - now;
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const overdueCount = overdueTasks.length;

  return (
    <div className="screen-container">
      <div className="dash-header">
        <div>
          <div className="dash-greeting">Good morning 👋</div>
          <div className="dash-name">{user.name}</div>
        </div>
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
      </div>
      
      <div className="stats-row">
        <div className="stat-card danger">
          <div className="stat-num">{dueTodayCount}</div>
          <div className="stat-label">Due Today</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-num">{thisWeekCount}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-num">{overdueCount}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>
      
      {overdueTasks.length > 0 && (
        <>
          <div className="section-head">
            <div className="section-title">⚠️ Overdue Tasks</div>
          </div>
          {overdueTasks.map(t => (
            <div key={t._id} className="task-item overdue" onClick={() => navigate(`/task/${t._id}`)}>
              <div className="task-dot dot-red"></div>
              <div className="task-info">
                <div className="task-subject">{t.subject}</div>
                <div className="task-title">{t.title}</div>
                <div className="task-due">Overdue</div>
              </div>
              <span className="task-badge badge-red">LATE</span>
            </div>
          ))}
        </>
      )}

      <div className="section-head" style={{ marginTop: '6px' }}>
        <div className="section-title">📋 Upcoming Tasks</div>
      </div>
      
      {upcomingTasks.map(t => {
          let dotClass = "dot-purple";
          let badgeClass = "badge-purple";
          if (t.priority === 'High') { dotClass = "dot-red"; badgeClass = "badge-red"; }
          else if (t.priority === 'Medium') { dotClass = "dot-yellow"; badgeClass = "badge-yellow"; }
          else if (t.priority === 'Low') { dotClass = "dot-green"; badgeClass = "badge-green"; }
          
          return (
            <div key={t._id} className="task-item" onClick={() => navigate(`/task/${t._id}`)}>
              <div className={`task-dot ${dotClass}`}></div>
              <div className="task-info">
                <div className="task-subject">{t.subject}</div>
                <div className="task-title">{t.title}</div>
                <div className="task-due">📅 {new Date(t.dueDate).toLocaleDateString()}</div>
              </div>
              <span className={`task-badge ${badgeClass}`}>{t.priority.toUpperCase()}</span>
            </div>
          );
      })}
      {upcomingTasks.length === 0 && <div style={{padding: '20px', textAlign: 'center', color: 'var(--muted)'}}>No upcoming tasks! 🎉</div>}
      
      <button className="fab" onClick={() => navigate('/add')}>＋</button>
      
      <BottomNav />
    </div>
  );
};

export default Dashboard;
