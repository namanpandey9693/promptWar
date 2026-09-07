import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setIsLoading(true);

    // Mock delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <AuthLayout 
      title="Reset your password" 
      subtitle="Enter your email and we'll help you get back into your account."
    >
      {!isSuccess ? (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error-message fade-in">{error}</div>}
          
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

          <button 
            type="submit" 
            className={`btn-auth ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-spinner"></span>
            ) : (
              <span>Send Reset Link →</span>
            )}
          </button>

          <div className="auth-footer" style={{ marginTop: 'var(--space-xl)' }}>
            <Link to="/login" className="auth-link">Back to Sign In</Link>
          </div>
        </form>
      ) : (
        <div className="auth-success-state fade-in">
          <div className="auth-success-icon">✨</div>
          <h3>Check your email</h3>
          <p>We've sent a password reset link to <strong>{email}</strong>.</p>
          <div className="auth-footer" style={{ marginTop: 'var(--space-xl)' }}>
            <Link to="/login" className="auth-link">Return to Sign In</Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
