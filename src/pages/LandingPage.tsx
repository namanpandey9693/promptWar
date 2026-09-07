import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-badge slide-up" style={{ animationDelay: '0.1s' }}>
          ✨ AI-POWERED FINAL YEAR PROJECT MENTOR
        </div>

        <h1 className="landing-title slide-up" style={{ animationDelay: '0.2s' }}>
          From Project Idea <br/>to Final-Year Success.
        </h1>

        <p className="landing-subtitle slide-up" style={{ animationDelay: '0.3s' }}>
          Turn your skills, interests, and timeline into a project you can actually build, explain, and defend. ProjectPilot is the only copilot you need.
        </p>

        <div className="landing-actions slide-up" style={{ animationDelay: '0.4s' }}>
          <button
            className="btn btn-primary btn-lg btn-landing"
            onClick={() => navigate('/login')}
          >
            🚀 Build My Project
          </button>
          <button
            className="btn btn-secondary btn-lg btn-landing"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          >
            Explore How It Works
          </button>
        </div>

        <div className="landing-features">
          {[
            { icon: '🎯', title: 'Smart Recommendations', desc: 'AI generates project ideas matched to your skills, interests, and timeline.' },
            { icon: '🔍', title: 'Reality Check', desc: 'Know if your project is feasible before you start. Get a Health Score out of 100.' },
            { icon: '📊', title: 'Health Score', desc: 'Deep diagnostic analysis of technical, time, and budget feasibility.' },
            { icon: '🏗️', title: 'Architecture', desc: 'Auto-generate your project\'s technical architecture and module breakdown.' },
            { icon: '🗺️', title: 'Development Roadmap', desc: 'Get a practical development timeline with tasks, priorities, and progress tracking.' },
            { icon: '💬', title: 'AI Mentor & Viva Prep', desc: 'Ask specific questions and practice with AI-generated viva questions.' }
          ].map((feat, i) => (
            <div key={i} className="card glass-panel slide-up landing-feature-card" style={{ animationDelay: `${0.5 + (i * 0.1)}s` }}>
              <div className="landing-feature-icon">
                  {feat.icon}
              </div>
              <div className="landing-feature-title">
                  0{i+1}. {feat.title}
              </div>
              <div className="landing-feature-desc">
                  {feat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
