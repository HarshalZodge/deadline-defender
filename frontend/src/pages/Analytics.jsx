import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, axiosInstance } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [period, setPeriod] = useState('Month');
  const [coachMsg, setCoachMsg] = useState('');
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

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

  const getCoachMsg = async () => {
    try {
      setIsLoadingCoach(true);
      setCoachMsg('');
      const { data } = await axiosInstance.get('/api/tasks/ai-coach');
      setCoachMsg(data.message);
      setIsLoadingCoach(false);
    } catch (err) {
      console.error(err);
      setIsLoadingCoach(false);
      setCoachMsg('Failed to connect to AI Coach. Check Gemini API key.');
    }
  };

  if (!user) return null;

  const now = new Date();
  const filteredTasks = tasks.filter(t => {
      if (!t.dueDate) return true;
      const tDate = new Date(t.dueDate);
      const diffDays = (tDate - now) / (1000 * 60 * 60 * 24);
      if (period === 'Week') return diffDays >= -7 && diffDays <= 7;
      if (period === 'Month') return diffDays >= -30 && diffDays <= 30;
      return true;
  });

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;
  const onTimeRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  let highP = 0, medP = 0, lowP = 0;
  let totalWeight = 0, earnedWeight = 0;
  
  const subjectMap = {};
  
  filteredTasks.forEach(task => {
      // Priorities
      if (task.priority === 'High') highP++;
      else if (task.priority === 'Medium') medP++;
      else if (task.priority === 'Low' || task.priority === 'Auto') lowP++;
      
      // Weightage
      let w = Number(task.weightage) || 0;
      totalWeight += w;
      if (task.status === 'Completed') earnedWeight += w;
      
      // Subjects
      if (!task.subject) return;
      if (!subjectMap[task.subject]) {
          subjectMap[task.subject] = { total: 0, comp: 0 };
      }
      subjectMap[task.subject].total += 1;
      if (task.status === 'Completed') subjectMap[task.subject].comp += 1;
  });

  const subjectArray = Object.keys(subjectMap).map(sub => {
      const rate = Math.round((subjectMap[sub].comp / subjectMap[sub].total) * 100);
      let color = 'var(--red)';
      if (rate >= 80) color = 'var(--green)';
      else if (rate >= 50) color = 'var(--yellow)';
      return { subject: sub, rate, color };
  }).sort((a,b) => b.rate - a.rate);

  const offset = 201 - (201 * onTimeRate) / 100;

  return (
    <div className="screen-container">
      <div className="analytics-wrap">
        <div className="form-screen-header" style={{ marginBottom: '14px' }}>
          <div className="back-btn" onClick={() => navigate(-1)}>←</div>
          <div className="screen-title">Analytics</div>
        </div>
        
        <div className="period-toggle">
          <button className={`period-btn ${period === 'Week' ? 'active' : ''}`} onClick={() => setPeriod('Week')}>Week</button>
          <button className={`period-btn ${period === 'Month' ? 'active' : ''}`} onClick={() => setPeriod('Month')}>Month</button>
          <button className={`period-btn ${period === 'Semester' ? 'active' : ''}`} onClick={() => setPeriod('Semester')}>Semester</button>
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
             <div style={{fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: 'rgba(255, 77, 109, 0.1)', color: 'var(--red)'}}>● {highP} High</div>
             <div style={{fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: 'rgba(255, 209, 102, 0.1)', color: 'var(--yellow)'}}>● {medP} Med</div>
             <div style={{fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: 'rgba(77, 255, 180, 0.1)', color: 'var(--green)'}}>● {lowP} Low</div>
          </div>
        </div>

        <div className="streak-card" style={{ marginBottom: '12px' }}>
           <div className="streak-icon">🎯</div>
           <div>
             <div className="streak-num">{earnedWeight} / {totalWeight}</div>
             <div className="streak-label">Grade Weightage Completed</div>
           </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <button onClick={getCoachMsg} disabled={isLoadingCoach} style={{ width: '100%', background: 'var(--card)', color: 'var(--accent)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isLoadingCoach ? 'Consulting Coach...' : '🤖 Ask AI Coach for Advice'}
            </button>
            {coachMsg && (
                <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(124,92,252,.1)', borderLeft: '4px solid var(--accent)', borderRadius: '0 8px 8px 0', fontSize: '13px', color: 'var(--text)', lineHeight: '1.5' }}>
                    <b>Coach:</b> {coachMsg}
                </div>
            )}
        </div>
        
        <div className="subject-breakdown">
          <div className="section-title" style={{ marginBottom: '12px' }}>By Subject</div>
          {subjectArray.length === 0 && <div style={{color: 'var(--muted)', fontSize: '12px'}}>No subjects logged yet!</div>}
          
          {subjectArray.map((s, idx) => (
            <div className="sub-row" key={idx}>
              <div className="sub-name">{s.subject}</div>
              <div className="sub-bar-bg"><div className="sub-bar-fill" style={{ width: `${s.rate}%`, background: s.color }}></div></div>
              <div className="sub-pct">{s.rate}%</div>
            </div>
          ))}
        </div>
        
      </div>
      <BottomNav />
    </div>
  );
};

export default Analytics;
