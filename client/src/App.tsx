import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DronesPage from './pages/DronesPage';
import DroneDetailPage from './pages/DroneDetailPage';
import DroneMap from './pages/DroneMap';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import { AuthProvider, useAuth } from './auth';
import { ThemeProvider, useTheme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppContent: React.FC = () => {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const initials = user
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  const handleSignOut = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = () => setMenuOpen(false);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [menuOpen]);

  return (
    <>
      {token && (
        <header className="app-header">
          <div className="app-header-title">Fleet Manager</div>
          <div className="app-header-controls">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className="user-menu-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="user-avatar-btn" type="button" onClick={() => setMenuOpen((prev) => !prev)}>
              {initials || 'U'}
            </button>
            {menuOpen && (
              <div className="user-menu">
                <button
                  type="button"
                  className="user-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                >
                  View Profile
                </button>
                <button type="button" className="user-menu-item user-menu-signout" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}            </div>          </div>
        </header>
      )}
      <div className={token ? 'app-content' : undefined}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drones"
            element={
              <ProtectedRoute>
                <DronesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drones/:id"
            element={
              <ProtectedRoute>
                <DroneDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drones/:id/map"
            element={
              <ProtectedRoute>
                <DroneMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
