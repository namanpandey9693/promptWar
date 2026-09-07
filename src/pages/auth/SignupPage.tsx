import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAppStore } from '../../store/useAppStore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const loginUser = useAppStore((state) => state.loginUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      setIsLoading(false);
      loginUser({ email, name, token: 'mock-token' });
      navigate('/profile', { replace: true });
    }, 1200);
  };

  return (
    <AuthLayout 
      title="Create your ProjectPilot account" 
      subtitle="Start building your final-year project with an AI mentor by your side."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error-message fade-in">{error}</div>}
        
        <div className="auth-input-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="auth-input"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="auth-input"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className="auth-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button 
          type="submit" 
          className={`btn-auth ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="auth-spinner"></span>
          ) : (
            <span>Create Account →</span>
          )}
        </button>

        <div className="auth-footer" style={{ marginTop: 'var(--space-xl)' }}>
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
