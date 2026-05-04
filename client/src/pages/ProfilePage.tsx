import React from 'react';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-title">Your Profile</h2>
        <div className="profile-field">
          <span className="profile-label">Name</span>
          <span className="profile-value">{user.name}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Email</span>
          <span className="profile-value">{user.email}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Role</span>
          <span className="profile-value">{user.role}</span>
        </div>
        <button type="button" className="profile-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
