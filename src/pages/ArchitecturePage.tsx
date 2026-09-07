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
      <div className="fade-in loading-container">
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Drafting Architecture</h2>
        <p style={{ color: 'var(--text-muted)' }}>Synthesizing optimal system topology and data flows...</p>
        <div className="arch-skeleton-list">
           {[1, 2, 3].map(i => (
               <div key={i} className="glass-panel arch-skeleton-item" style={{ animationDelay: `${i * 0.2}s` }} />
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in loading-container">
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
    <div className="fade-in arch-container">
      <div className="page-header arch-header">
        <h1 className="page-title text-gradient">System Topology</h1>
        <p className="page-subtitle">{projectTitle}</p>
      </div>

      {/* Architecture Flow */}
      <div className="arch-flow-section">
        <h2 className="section-title text-center">
          Data Flow Architecture
        </h2>

        <div className="arch-flow-container">
          
          <div className="arch-node slide-in card glass-panel glow-on-hover arch-flow-node">
            <div className="arch-node-icon">👤</div>
            <div className="arch-node-label">Client Request</div>
          </div>

          {layers.map((layer, idx) => (
            <div key={layer.key} className="slide-in arch-flow-step" style={{ animationDelay: `${(idx + 1) * 0.15}s` }}>
              <div className="arch-flow-line" />
              
              <div className="card glass-panel card-hover arch-layer-card">
                <div className="arch-layer-accent" />
                <div className="arch-layer-icon">
                    {LAYER_ICONS[layer.key]}
                </div>
                <div className="arch-layer-content">
                    <div className="arch-layer-header">
                        <h3 className="arch-layer-title">{layer.key === 'aiLayer' ? 'AI Engine' : layer.key}</h3>
                        <span className="chip chip-primary-light">{layer.tech}</span>
                    </div>
                    <p className="arch-layer-desc">{layer.description}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="arch-flow-line-success" />
          
          <div className="arch-node slide-in card glass-panel glow-on-hover arch-flow-node" style={{ animationDelay: '0.8s' }}>
            <div className="arch-node-icon">✨</div>
            <div className="arch-node-label success-text">Response Delivered</div>
          </div>
        </div>
      </div>

      <div className="arch-details-grid">
        {/* APIs */}
        <div className="card glass-panel">
            <h3 className="arch-detail-title"><span>🔗</span> Integration Points</h3>
            <div className="arch-chip-list">
                {architecture.apis.map((api, idx) => (
                <span key={idx} className="chip chip-success-light">{api}</span>
                ))}
            </div>
        </div>

        {/* Auth */}
        <div className="card glass-panel">
            <h3 className="arch-detail-title"><span>🔐</span> Security & Auth</h3>
            <p className="arch-detail-text">{architecture.authentication}</p>
        </div>
        
        {/* Deployment */}
        <div className="card glass-panel full-width">
            <h3 className="arch-detail-title"><span>🚀</span> Infrastructure & Deployment</h3>
            <p className="arch-detail-text">{architecture.deployment}</p>
        </div>
      </div>

      <div className="arch-bottom-grid">
          {/* Main Modules */}
          <div>
            <h3 className="arch-detail-title">Core Modules</h3>
            <div className="modules-grid">
                {architecture.mainModules.map((mod, idx) => (
                <div key={idx} className="card glass-panel card-hover slide-in arch-module-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <h4 className="arch-module-title">{mod.name}</h4>
                    <p className="arch-module-desc">{mod.description}</p>
                </div>
                ))}
            </div>
          </div>

          {/* Data Flow */}
          <div>
            <h3 className="arch-detail-title">Execution Sequence</h3>
            <div className="card glass-panel sequence-card">
                <ol className="arch-sequence-list">
                {architecture.dataFlow.map((step, idx) => (
                    <li key={idx} className="arch-sequence-item">
                        <div className="arch-sequence-number">
                            {idx + 1}
                        </div>
                        <div className="arch-sequence-text">
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
