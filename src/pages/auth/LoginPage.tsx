import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import AuthLayout from './AuthLayout';
import { useAppStore } from '../../store/useAppStore';
import { verifyGoogleToken } from '../../services/auth';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function GoogleLoginButton({ onSuccess, onError, disabled }: { onSuccess: (res: any) => void, onError: () => void, disabled: boolean }) {
  const login = useGoogleLogin({ onSuccess, onError });
  return (
    <button 
      type="button" 
      className="btn-auth-secondary"
      disabled={disabled}
      onClick={() => login()}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
        </g>
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const loginUser = useAppStore((state) => state.loginUser);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await res.json();
      
      loginUser({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        token: tokenResponse.access_token,
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to retrieve Google account details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication failed. Check your network or credentials.");
  };

  // Where to redirect after login
  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Mock authentication delay for email/password prototype
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'test@example.com' && password === 'wrong') {
        setError('Email or password is incorrect.');
      } else {
        // Successful mock login
        loginUser({ email, name: email.split('@')[0], token: 'mock-token' });
        navigate(from, { replace: true });
      }
    }, 1200);
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to continue your ProjectPilot journey."
    >
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

        <div className="auth-input-group">
          <label htmlFor="password">Password</label>
          <div className="auth-password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="auth-form-options">
          <label className="auth-checkbox-label">
            <input type="checkbox" className="auth-checkbox" disabled={isLoading} />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>

        <button 
          type="submit" 
          className={`btn-auth ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="auth-spinner"></span>
          ) : (
            <span>Continue →</span>
          )}
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {clientId ? (
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLoginButton 
              onSuccess={handleGoogleSuccess} 
              onError={handleGoogleError} 
              disabled={isLoading} 
            />
          </GoogleOAuthProvider>
        ) : (
          <button 
            type="button" 
            className="btn-auth-secondary"
            disabled={isLoading}
            onClick={() => setError('Google authentication is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env.local file.')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            <span>Continue with Google</span>
          </button>
        )}

        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Create account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
