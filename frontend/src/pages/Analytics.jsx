import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, axiosInstance } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
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

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const onTimeRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const offset = 201 - (201 * onTimeRate) / 100;

  return (
    <div className="screen-container">
      <div className="analytics-wrap">
        <div className="form-screen-header" style={{ marginBottom: '14px' }}>
          <div className="back-btn" onClick={() => navigate(-1)}>←</div>
          <div className="screen-title">Analytics</div>
        </div>
        
        <div className="period-toggle">
          <button className="period-btn">Week</button>
          <button className="period-btn active">Month</button>
          <button className="period-btn">Semester</button>
        </div>
        
        <div className="big-stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <div>
              <div className="big-stat-num">{onTimeRate}%</div>
              <div className="big-stat-label">Completion Rate</div>
            </div>
            <svg className="donut" width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#2a2a3a" strokeWidth="10"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke="#7c5cfc" strokeWidth="10"
                strokeDasharray="201 201" strokeDashoffset={offset} strokeLinecap="round" style={{transition: 'stroke-dashoffset 1s ease-in-out'}}/>
              <text x="40" y="45" textAnchor="middle" fill="#eeeef5" fontSize="14" fontWeight="800" fontFamily="Syne">{onTimeRate}%</text>
            </svg>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
            <div style={{ textAlign: 'center', padding: '10px', background: 'var(--card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: '800', color: 'var(--green)' }}>{completedTasks}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Tasks Completed</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: 'var(--card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: '800', color: 'var(--accent)' }}>{totalTasks}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Total Tasks</div>
            </div>
          </div>
        </div>
        
        <div className="subject-breakdown">
          <div className="section-title" style={{ marginBottom: '12px' }}>By Subject</div>
          <div className="sub-row">
            <div className="sub-name">Data Structures</div>
            <div className="sub-bar-bg"><div className="sub-bar-fill" style={{ width: '70%', background: 'var(--red)' }}></div></div>
            <div className="sub-pct">70%</div>
          </div>
          <div className="sub-row">
            <div className="sub-name">Engg Maths</div>
            <div className="sub-bar-bg"><div className="sub-bar-fill" style={{ width: '90%', background: 'var(--green)' }}></div></div>
            <div className="sub-pct">90%</div>
          </div>
        </div>
        
      </div>
      <BottomNav />
    </div>
  );
};

export default Analytics;
