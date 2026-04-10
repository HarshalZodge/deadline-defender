import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Settings.css';

const Settings = () => {
  const { user, logout, updateLocalUser, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeMenu, setActiveMenu] = useState('main');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');
  const [notificationsMuted, setNotificationsMuted] = useState(localStorage.getItem('notificationsMuted') === 'true');
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleNotifications = () => {
    const newVal = !notificationsMuted;
    setNotificationsMuted(newVal);
    localStorage.setItem('notificationsMuted', newVal.toString());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const updateProfile = async () => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const { data } = await axiosInstance.put('/api/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateLocalUser(data);
      alert('Profile updated successfully!');
      setActiveMenu('main');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsUploading(false);
    }
  };

  const updatePassword = async () => {
    try {
      await axiosInstance.put('/api/users/password', { oldPassword, newPassword });
      alert('Password updated safely!');
      setOldPassword('');
      setNewPassword('');
      setActiveMenu('main');
    } catch (err) {
      alert('Failed to update password. Incorrect current password.');
    }
  };

  const renderHeader = (title) => (
    <div className="settings-header" style={{ display: 'flex', alignItems: 'center' }}>
      {activeMenu !== 'main' && (
        <div className="back-btn" onClick={() => setActiveMenu('main')} style={{marginRight: '15px'}} >←</div>
      )}
      <div className="screen-title">{title}</div>
    </div>
  );

  return (
    <div className="screen-container">
      <div className="settings-screen">
        {activeMenu === 'main' && (
          <>
            {renderHeader('Settings')}
            <div className="profile-section">
              <div className="profile-avatar" style={{ backgroundImage: `url(${user?.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center', color: user?.avatar ? 'transparent' : 'white' }}>
                {!user?.avatar && (user?.name?.charAt(0) || 'U')}
              </div>
              <div className="profile-info">
                <h3>{user?.name || 'User'}</h3>
                <p>{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            <div className="settings-options">
              <div className="settings-item" onClick={() => setActiveMenu('profile')}>
                <div className="settings-icon">👤</div>
                <div className="settings-text">Edit Profile</div>
                <div className="settings-arrow">→</div>
              </div>
              <div className="settings-item" onClick={() => setActiveMenu('prefs')}>
                <div className="settings-icon">🔔</div>
                <div className="settings-text">Notification Preferences</div>
                <div className="settings-arrow">→</div>
              </div>
              <div className="settings-item">
                <div className="settings-icon">🌙</div>
                <div className="settings-text">Dark Mode</div>
                <div className="settings-toggle">
                  <input type="checkbox" id="dark-mode" checked={isDarkMode} onChange={toggleTheme} />
                  <label htmlFor="dark-mode"></label>
                </div>
              </div>
              <div className="settings-item" onClick={() => setActiveMenu('security')}>
                <div className="settings-icon">🔒</div>
                <div className="settings-text">Privacy & Security</div>
                <div className="settings-arrow">→</div>
              </div>
              <div className="settings-item" onClick={() => setActiveMenu('help')}>
                <div className="settings-icon">ℹ️</div>
                <div className="settings-text">Help & Support</div>
                <div className="settings-arrow">→</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </>
        )}

        {activeMenu === 'profile' && (
          <>
            {renderHeader('Edit Profile')}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <label htmlFor="avatar-upload" style={{ cursor: 'pointer', display: 'block', position: 'relative' }}>
                <div className="profile-avatar" style={{ width: '80px', height: '80px', margin: '0 auto', fontSize: '32px', backgroundImage: `url(${avatarPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', color: avatarPreview ? 'transparent' : 'white' }}>
                   {!avatarPreview && (user?.name?.charAt(0) || 'U')}
                </div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>📷</div>
              </label>
              <input type="file" id="avatar-upload" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
            </div>

            <div className="form-group" style={{marginTop: '20px'}}>
               <label className="form-label">Full Name</label>
               <input className="form-input" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div className="form-group">
               <label className="form-label">Email Address</label>
               <input className="form-input" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={updateProfile} disabled={isUploading}>
              {isUploading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}

        {activeMenu === 'security' && (
          <>
            {renderHeader('Change Password')}
            <div className="form-group" style={{marginTop: '20px'}}>
               <label className="form-label">Current Password</label>
               <input className="form-input" type="password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} />
            </div>
            <div className="form-group">
               <label className="form-label">New Password</label>
               <input className="form-input" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={updatePassword} style={{background: 'var(--red)', boxShadow: '0 8px 24px rgba(255, 77, 109, 0.35)'}}>Update Securely</button>
          </>
        )}

        {activeMenu === 'prefs' && (
          <>
            {renderHeader('Notifications')}
            <div className="settings-options" style={{marginTop: '20px'}}>
              <div className="settings-item">
                <div className="settings-icon">🔕</div>
                <div className="settings-text">Mute All Notifications</div>
                <div className="settings-toggle">
                  <input type="checkbox" id="mute-notif" checked={notificationsMuted} onChange={toggleNotifications} />
                  <label htmlFor="mute-notif"></label>
                </div>
              </div>
            </div>
            <p style={{color: 'var(--muted)', fontSize: '13px', padding: '10px'}}>When muted, you will only see task deadlines locally inside your Dashboard. Push notifications and urgency alerts will be disabled.</p>
          </>
        )}

        {activeMenu === 'help' && (
          <>
            {renderHeader('Help & Support')}
            <div style={{background: 'var(--card)', padding: '20px', borderRadius: '14px', marginTop: '20px'}}>
               <h3 style={{color: 'var(--text)', marginBottom: '10px'}}>DeadlineDefender v1.2</h3>
               <p style={{color: 'var(--muted)', fontSize: '14px', marginBottom: '20px'}}>Your smart academic sidekick. Powered by Google Gemini AI.</p>
               <a href="mailto:support@deadlinedefender.local" style={{color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold'}}>✉️ Contact Support</a>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
