import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="onboarding-screen">
      <div className="onboarding-bg"></div>
      <div className="onboarding-content">
        <div className="app-logo">🛡️</div>
        <div className="app-name">DeadlineDefender</div>
        <div className="app-tagline">Your Smart Academic Sidekick — never miss a deadline again.</div>
        <div className="onboarding-illustration">📚✅📅</div>
        <div className="feature-pills">
          <span className="fpill">Smart Reminders</span>
          <span className="fpill">Auto-Priority</span>
          <span className="fpill">Analytics</span>
          <span className="fpill">Calendar Sync</span>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Get Started 🚀</button>
        <button className="btn-ghost">Already have an account? Sign In</button>
      </div>
    </div>
  );
};

export default Onboarding;
