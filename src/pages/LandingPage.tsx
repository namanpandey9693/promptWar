import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        padding: 'var(--space-2xl) 0'
    }}>
      <div className="landing-content" style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 var(--space-xl)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center'
      }}>
        <div className="landing-badge slide-up" style={{ 
            animationDelay: '0.1s',
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '100px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'var(--accent-primary-hover)',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-lg)'
        }}>
          ✨ AI-POWERED FINAL YEAR PROJECT MENTOR
        </div>

        <h1 className="landing-title slide-up" style={{ 
            animationDelay: '0.2s',
            fontSize: 'clamp(3rem, 5vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            marginBottom: 'var(--space-xl)',
            background: 'linear-gradient(to right, #ffffff, #a1a1aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
          From Project Idea <br/>to Final-Year Success.
        </h1>

        <p className="landing-subtitle slide-up" style={{ 
            animationDelay: '0.3s',
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: 700,
            margin: '0 auto var(--space-2xl)',
            lineHeight: 1.6
        }}>
          Turn your skills, interests, and timeline into a project you can actually build, explain, and defend. ProjectPilot is the only copilot you need.
        </p>

        <div className="slide-up" style={{ animationDelay: '0.4s', display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/profile')}
            style={{ padding: '16px 36px', fontSize: '1.1rem' }}
          >
            🚀 Build My Project
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          >
            Explore How It Works
          </button>
        </div>

        <div className="landing-features" style={{ 
            marginTop: '100px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-xl)',
            textAlign: 'left'
        }}>
          {[
            { icon: '🎯', title: 'Smart Recommendations', desc: 'AI generates project ideas matched to your skills, interests, and timeline.' },
            { icon: '🔍', title: 'Reality Check', desc: 'Know if your project is feasible before you start. Get a Health Score out of 100.' },
            { icon: '📊', title: 'Health Score', desc: 'Deep diagnostic analysis of technical, time, and budget feasibility.' },
            { icon: '🏗️', title: 'Architecture', desc: 'Auto-generate your project\'s technical architecture and module breakdown.' },
            { icon: '🗺️', title: 'Development Roadmap', desc: 'Get a practical development timeline with tasks, priorities, and progress tracking.' },
            { icon: '💬', title: 'AI Mentor & Viva Prep', desc: 'Ask specific questions and practice with AI-generated viva questions.' }
          ].map((feat, i) => (
            <div key={i} className="card glass-panel slide-up" style={{ 
                animationDelay: `${0.5 + (i * 0.1)}s`, 
                padding: 'var(--space-xl)'
            }}>
              <div className="landing-feature-icon" style={{ 
                  fontSize: '2rem', 
                  marginBottom: 'var(--space-md)',
                  filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.5))' 
              }}>
                  {feat.icon}
              </div>
              <div className="landing-feature-title" style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  marginBottom: 'var(--space-sm)'
              }}>
                  0{i+1}. {feat.title}
              </div>
              <div className="landing-feature-desc" style={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
              }}>
                  {feat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
