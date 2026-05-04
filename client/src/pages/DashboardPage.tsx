import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-icon">[DRONE]</div>

        <h1 className="dashboard-title">Welcome to Fleet Manager</h1>

        <p className="dashboard-subtitle">
          Manage your drone fleet with ease and style.
        </p>

        <p className="dashboard-description">
          Monitor telemetry, track location, and control your drones in real-time.
        </p>

        <div className="dashboard-buttons">
          <button
            onClick={() => navigate('/drones')}
            className="btn-primary"
          >
            View My Drones
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="btn-secondary"
          >
            View Analytics
          </button>

          <a
            href="https://github.com/mirivaingut/fleet-manager-drone/blob/develop/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Learn More
          </a>
        </div>

        <div className="dashboard-features">
          <div className="feature-item">
            <div className="feature-icon">LIVE</div>
            <p className="feature-text">Real-time Updates</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">SECURE</div>
            <p className="feature-text">Secure Access</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">FAST</div>
            <p className="feature-text">Lightning Fast</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
