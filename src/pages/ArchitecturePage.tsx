import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateArchitecture } from '../services/api';

const LAYER_ICONS: Record<string, string> = {
  frontend: '🖥️',
  backend: '⚙️',
  aiLayer: '🧠',
  database: '🗄️',
};

export default function ArchitecturePage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const architecture = useAppStore((s) => s.architecture);
  const setArchitecture = useAppStore((s) => s.setArchitecture);
  const projectTitle = useAppStore((s) => s.getActiveProjectTitle)();
  const projectDesc = useAppStore((s) => s.getActiveProjectDescription)();
  const techStack = useAppStore((s) => s.getActiveProjectTechStack)();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadArchitecture = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateArchitecture(profile, projectTitle, projectDesc, techStack);
      setArchitecture(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate architecture');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile || !projectTitle) {
      navigate('/reality-check');
      return;
    }
    if (!architecture) {
      loadArchitecture();
    }
  }, [profile, projectTitle, architecture, navigate]);

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Drafting Architecture</h2>
        <p style={{ color: 'var(--text-muted)' }}>Synthesizing optimal system topology and data flows...</p>
        <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-2xl)' }}>
           {[1, 2, 3].map(i => (
               <div key={i} className="glass-panel" style={{ width: 60, height: 60, borderRadius: '50%', animation: `pulse ${1.5 + i * 0.2}s infinite` }} />
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="status-dot offline" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>Topology Generation Failed</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadArchitecture}>Retry Generation</button>
      </div>
    );
  }

  if (!architecture) return null;

  const layers = [
    { key: 'frontend', ...architecture.frontend },
    { key: 'backend', ...architecture.backend },
    { key: 'aiLayer', ...architecture.aiLayer },
    { key: 'database', ...architecture.database },
  ];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="page-title text-gradient">System Topology</h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>{projectTitle}</p>
      </div>

      {/* Architecture Flow */}
      <div style={{ marginBottom: 'var(--space-3xl)' }}>
        <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
          Data Flow Architecture
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          
          <div className="arch-node slide-in card glass-panel glow-on-hover" style={{ width: 300, textAlign: 'center', zIndex: 2 }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-xs)' }}>👤</div>
            <div style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Client Request</div>
          </div>

          {layers.map((layer, idx) => (
            <div key={layer.key} className="slide-in" style={{ animationDelay: `${(idx + 1) * 0.15}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
              <div style={{ height: 40, width: 2, background: 'linear-gradient(to bottom, var(--primary), var(--accent))', opacity: 0.5 }} />
              
              <div className="card glass-panel card-hover" style={{ width: '100%', maxWidth: 500, display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', zIndex: 2, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--primary)' }} />
                <div style={{ fontSize: '2.5rem', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                    {LAYER_ICONS[layer.key]}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                        <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{layer.key === 'aiLayer' ? 'AI Engine' : layer.key}</h3>
                        <span className="chip" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>{layer.tech}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{layer.description}</p>
                </div>
              </div>
            </div>
          ))}

          <div style={{ height: 40, width: 2, background: 'linear-gradient(to bottom, var(--accent), var(--success))', opacity: 0.5 }} />
          
          <div className="arch-node slide-in card glass-panel glow-on-hover" style={{ width: 300, textAlign: 'center', zIndex: 2, animationDelay: '0.8s' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-xs)' }}>✨</div>
            <div style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--success)' }}>Response Delivered</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-3xl)' }}>
        {/* APIs */}
        <div className="card glass-panel">
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', color: 'var(--text-muted)' }}><span style={{ marginRight: '8px' }}>🔗</span> Integration Points</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                {architecture.apis.map((api, idx) => (
                <span key={idx} className="chip" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>{api}</span>
                ))}
            </div>
        </div>

        {/* Auth */}
        <div className="card glass-panel">
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', color: 'var(--text-muted)' }}><span style={{ marginRight: '8px' }}>🔐</span> Security & Auth</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{architecture.authentication}</p>
        </div>
        
        {/* Deployment */}
        <div className="card glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', color: 'var(--text-muted)' }}><span style={{ marginRight: '8px' }}>🚀</span> Infrastructure & Deployment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{architecture.deployment}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          {/* Main Modules */}
          <div>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', color: 'var(--text-muted)' }}>Core Modules</h3>
            <div className="modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                {architecture.mainModules.map((mod, idx) => (
                <div key={idx} className="card glass-panel card-hover slide-in" style={{ animationDelay: `${idx * 0.1}s`, borderTop: '2px solid var(--primary)' }}>
                    <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: '1rem', color: 'var(--text-primary)' }}>{mod.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{mod.description}</p>
                </div>
                ))}
            </div>
          </div>

          {/* Data Flow */}
          <div>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-lg)', color: 'var(--text-muted)' }}>Execution Sequence</h3>
            <div className="card glass-panel" style={{ padding: 'var(--space-xl)' }}>
                <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {architecture.dataFlow.map((step, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                        <div style={{ 
                            minWidth: 28, height: 28, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', 
                            color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 600, fontSize: '0.9rem', border: '1px solid rgba(59, 130, 246, 0.3)' 
                        }}>
                            {idx + 1}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, paddingTop: 2 }}>
                            {step}
                        </div>
                    </li>
                ))}
                </ol>
            </div>
          </div>
      </div>

    </div>
  );
}
