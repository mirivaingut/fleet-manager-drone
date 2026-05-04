import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DronesPage from './pages/DronesPage';
import DroneDetailPage from './pages/DroneDetailPage';
import DroneMap from './pages/DroneMap';
import { AuthProvider } from './auth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
              <DroneMap droneId={undefined} />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
