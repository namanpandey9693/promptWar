import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

import { Rocket } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-layout-unified fade-in">
      {/* Ambient Glow */}
      <div className="auth-unified-bg-glow"></div>

      <div className="auth-unified-content">
        {/* Top Branding / Hero */}
        <div className="auth-unified-header slide-up">
          <Link to="/" className="auth-logo-centered" style={{ textDecoration: 'none' }}>
            <span className="auth-logo-icon"><Rocket size={24} /></span>
            <span>ProjectPilot AI</span>
            <span className="auth-logo-badge">AI PROJECT MENTOR</span>
          </Link>

          <h1 className="auth-hero-title-centered">
            Build smarter.<br />
            Defend with confidence.
          </h1>
          <p className="auth-hero-subtitle-centered">
            Your AI-powered companion for choosing, building and mastering your final-year project.
          </p>

          <ul className="auth-features-horizontal">
            <li><span className="feature-dot">✦</span> AI Project Recommendations</li>
            <li><span className="feature-dot">✦</span> Smart Feasibility Analysis</li>
            <li><span className="feature-dot">✦</span> Personalized Project Mentorship</li>
          </ul>
        </div>

        {/* Auth Card */}
        <div className="auth-card-container-centered slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="auth-card glass-panel">
            <div className="auth-card-header-centered">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
