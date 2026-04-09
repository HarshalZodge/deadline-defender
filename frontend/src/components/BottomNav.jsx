import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPath = (path) => location.pathname === path;

  return (
    <div className="bottom-nav">
      <div className={`nav-item ${getPath('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
        <span className="nav-icon">🏠</span>Home
      </div>
      <div className={`nav-item ${getPath('/calendar') ? 'active' : ''}`} onClick={() => navigate('/calendar')}>
        <span className="nav-icon">📅</span>Calendar
      </div>
      <div className={`nav-item ${getPath('/analytics') ? 'active' : ''}`} onClick={() => navigate('/analytics')}>
        <span className="nav-icon">📊</span>Analytics
      </div>
      <div className={`nav-item ${getPath('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')}>
        <span className="nav-icon">⚙️</span>Settings
      </div>
    </div>
  );
};

export default BottomNav;
