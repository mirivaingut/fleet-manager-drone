import React, { useState } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegisterMode) {
        const resp = await axios.post('/auth/register', { name: name.trim(), email: email.trim(), password });
        if (resp.data.accessToken && resp.data.refreshToken && resp.data.user) {
          login(resp.data.accessToken, resp.data.refreshToken, resp.data.user);
          toast.success('Account created and signed in successfully.');
          navigate('/dashboard');
          return;
        }
        toast.success('Account created successfully. Please sign in.');
        setIsRegisterMode(false);
        setName('');
        setEmail('');
        setPassword('');
        return;
      }

      const resp = await axios.post('/auth/login', { email: email.trim(), password });
      if (resp.data.user) {
        login(resp.data.accessToken, resp.data.refreshToken, resp.data.user);
      } else {
        login(resp.data.accessToken, resp.data.refreshToken, { id: '', name: email.trim(), email: email.trim(), role: 'operator' });
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Authentication error', err);
      const response = err.response?.data;
      if (err.request && !err.response) {
        setError('Server is not reachable. Make sure the backend is running and try again.');
      } else if (response?.message === 'Validation error' && Array.isArray(response.details)) {
        setError(response.details.map((detail: any) => detail.message).join(', '));
      } else if (response?.message) {
        setError(response.message === 'Invalid credentials' ? 'Invalid email or password' : response.message);
      } else if (response) {
        setError(JSON.stringify(response));
      } else {
        setError(isRegisterMode ? 'Unable to sign up. Please try again.' : 'Unable to sign in. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">{isRegisterMode ? 'Create Account' : 'Sign In'}</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
            {isRegisterMode && <p className="form-note">Password must be at least 8 characters.</p>}
          </div>
          <button type="submit" className="btn-login">
            {isRegisterMode ? 'Create account' : 'Sign In'}
          </button>
        </form>
        <div className="login-toggle">
          {isRegisterMode ? (
            <>
              Already have an account?{' '}
              <button type="button" className="toggle-link" onClick={() => { setIsRegisterMode(false); setError(''); }}>
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button type="button" className="toggle-link" onClick={() => { setIsRegisterMode(true); setError(''); }}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
