import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Calendar.css';

const Calendar = () => {
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
    if (user) fetchTasks();
  }, [user, navigate, axiosInstance]);

  if (!user) return null;

  const today = new Date();
  
  const upcomingTasks = tasks.filter(t => new Date(t.dueDate) >= today && t.status !== 'Completed');
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < today && t.status !== 'Completed');

  return (
    <div className="screen-container">
      <div className="calendar-wrap">
        <div className="form-screen-header" style={{ marginBottom: '14px' }}>
          <div className="back-btn" onClick={() => navigate(-1)}>←</div>
          <div className="screen-title">Calendar</div>
        </div>
        
        <div className="cal-nav">
          <div className="cal-arrow">‹</div>
          <div className="cal-month">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
          <div className="cal-arrow">›</div>
        </div>
        
        <div className="cal-grid">
          <div className="cal-day-header">S</div><div className="cal-day-header">M</div><div className="cal-day-header">T</div><div className="cal-day-header">W</div><div className="cal-day-header">T</div><div className="cal-day-header">F</div><div className="cal-day-header">S</div>
          <div className="cal-day other-month">1</div><div className="cal-day other-month">2</div><div className="cal-day other-month">3</div><div className="cal-day other-month">4</div><div className="cal-day other-month">5</div><div className="cal-day other-month">6</div><div className="cal-day other-month">7</div>
          <div className="cal-day">8</div><div className="cal-day">9</div><div className="cal-day">10</div><div className="cal-day">11</div><div className="cal-day">12</div><div className="cal-day">13</div><div className="cal-day">14</div>
          <div className="cal-day">15</div><div className="cal-day">16</div><div className="cal-day">17</div><div className="cal-day">18</div>
          <div className="cal-day today">{today.getDate()}<div className="dot-row"><div className="tiny-dot" style={{background:'#fff'}}></div></div></div>
        </div>
        
        <div className="upcoming-head">
          <div className="section-title">Your Deadlines</div>
          <div className="date-chip">{upcomingTasks.length + overdueTasks.length} deadlines</div>
        </div>
        
        {overdueTasks.map(t => (
            <div key={t._id} className="task-item overdue" onClick={() => navigate(`/task/${t._id}`)}>
              <div className="task-dot dot-red"></div>
              <div className="task-info">
                <div className="task-subject">{t.subject}</div>
                <div className="task-title">{t.title}</div>
                <div className="task-due">Late</div>
              </div>
              <span className="task-badge badge-red">LATE</span>
            </div>
        ))}

        {upcomingTasks.map(t => (
            <div key={t._id} className="task-item" onClick={() => navigate(`/task/${t._id}`)}>
              <div className="task-dot dot-purple"></div>
              <div className="task-info">
                <div className="task-subject">{t.subject}</div>
                <div className="task-title">{t.title}</div>
                <div className="task-due">📅 {new Date(t.dueDate).toLocaleDateString()}</div>
              </div>
              <span className="task-badge badge-purple">{t.priority.toUpperCase()}</span>
            </div>
        ))}
        
      </div>
      <BottomNav />
    </div>
  );
};

export default Calendar;
