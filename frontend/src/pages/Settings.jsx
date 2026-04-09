import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="screen-container">
      <div className="settings-screen">
        <div className="settings-header">
          <div className="screen-title">Settings</div>
        </div>

        <div className="profile-section">
          <div className="profile-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <div className="settings-options">
          <div className="settings-item">
            <div className="settings-icon">👤</div>
            <div className="settings-text">Edit Profile</div>
            <div className="settings-arrow">→</div>
          </div>
          <div className="settings-item">
            <div className="settings-icon">🔔</div>
            <div className="settings-text">Notification Preferences</div>
            <div className="settings-arrow">→</div>
          </div>
          <div className="settings-item">
            <div className="settings-icon">🌙</div>
            <div className="settings-text">Dark Mode</div>
            <div className="settings-toggle">
              <input type="checkbox" id="dark-mode" />
              <label htmlFor="dark-mode"></label>
            </div>
          </div>
          <div className="settings-item">
            <div className="settings-icon">🔒</div>
            <div className="settings-text">Privacy & Security</div>
            <div className="settings-arrow">→</div>
          </div>
          <div className="settings-item">
            <div className="settings-icon">ℹ️</div>
            <div className="settings-text">Help & Support</div>
            <div className="settings-arrow">→</div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
