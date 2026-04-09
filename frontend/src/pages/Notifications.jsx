import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const { axiosInstance } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axiosInstance.get('/api/tasks/notifications');
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [axiosInstance]);

  const getStyleForType = (type) => {
    switch(type) {
      case 'Critical': return { color: 'var(--red)', icon: '⚠️', itemClass: 'critical' };
      case 'Warning': return { color: 'var(--yellow)', icon: '⏰', itemClass: 'warn-notif' };
      case 'Info': return { color: 'var(--accent)', icon: '📅', itemClass: 'info' };
      case 'Completed': return { color: 'var(--green)', icon: '✅', itemClass: 'info', borderStyle: { borderLeftColor: 'var(--green)' } };
      default: return { color: 'var(--accent)', icon: '🔔', itemClass: 'info' };
    }
  };

  return (
    <div className="screen-container">
      <div className="notif-screen">
        <div className="form-screen-header" style={{ marginBottom: '14px' }}>
          <div className="back-btn" onClick={() => navigate(-1)}>←</div>
          <div className="screen-title">Notifications</div>
        </div>
        
        {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#777' }}>You have no notifications! 🎉</div>
        ) : (
            notifications.map(notif => {
                const style = getStyleForType(notif.type);
                return (
                    <div key={notif._id} className={`notif-item ${style.itemClass}`} style={style.borderStyle || {}}>
                        <div className="notif-header">
                            <div className="notif-type" style={{ color: style.color }}>{style.icon} {notif.type === 'Completed' ? 'Completed' : notif.type === 'Info' ? 'Reminder' : notif.type === 'Warning' ? 'Upcoming' : 'Critical Alert'}</div>
                            <div className="notif-time">{notif.time}</div>
                        </div>
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-body">{notif.body}</div>
                        {notif.type !== 'Completed' && (
                            <div className="notif-actions">
                                <button className="notif-action na-primary" onClick={() => navigate(`/task/${notif.taskId}`)}>View Task</button>
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Notifications;
