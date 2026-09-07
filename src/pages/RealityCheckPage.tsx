import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { realityCheck as realityCheckApi } from '../services/api';
import { Zap, Server, Edit3 } from 'lucide-react';

export default function RealityCheckPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const selectedProject = useAppStore((s) => s.selectedProject);
  const setRealityCheck = useAppStore((s) => s.setRealityCheck);
  const setCustomProject = useAppStore((s) => s.setCustomProject);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const existingResult = useAppStore((s) => s.realityCheck);

  const [mode, setMode] = useState<'selected' | 'custom'>(selectedProject ? 'selected' : 'custom');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) {
      navigate('/profile');
    }
  }, [profile, navigate]);

  const handleAnalyze = async () => {
    if (!profile) return;

    let title = '';
    let description = '';

    if (mode === 'selected' && selectedProject) {
      title = selectedProject.title;
      description = `${selectedProject.description}. Problem: ${selectedProject.problemSolved}. AI Component: ${selectedProject.aimlComponent}. Tech Stack: ${selectedProject.techStack.join(', ')}`;
    } else {
      if (!customTitle || !customDesc) {
        alert('Please enter both a project title and description.');
        return;
      }
      title = customTitle;
      description = customDesc;
      setCustomProject(customTitle, customDesc);
    }

    setLoading(true);
    setError('');
    try {
      const result = await realityCheckApi(profile, title, description);
      setRealityCheck(result);
      navigate('/health-score');
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Running Diagnostic Validation</h2>
        <p style={{ color: 'var(--text-muted)' }}>Assessing feasibility, risk factors, and innovation vectors...</p>
        <div style={{ marginTop: 'var(--space-xl)', width: '100%', maxWidth: 400 }}>
           <div className="glass-panel" style={{ height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', width: '50%', animation: 'slideRight 2s infinite ease-in-out' }} />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title text-gradient">Reality Check</h1>
        <p className="page-subtitle">
          Submit your project architecture for AI validation and risk assessment.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', justifyContent: 'center' }}>
        {selectedProject && (
          <button
            className={`btn ${mode === 'selected' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('selected')}
          >
            <Server size={16} /> Generated Project
          </button>
        )}
        <button
          className={`btn ${mode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('custom')}
        >
          <Edit3 size={16} /> Custom Input
        </button>
      </div>

      <div className="card glass-panel" style={{ padding: 'var(--space-xl)' }}>
        {mode === 'selected' && selectedProject ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <div className="status-dot" style={{ backgroundColor: 'var(--success)' }} />
                <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Active Selection</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>{selectedProject.title}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-lg)' }}>
              {selectedProject.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {selectedProject.techStack.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input
                className="form-input"
                placeholder="e.g., Federated Learning on Edge Devices"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                id="custom-project-title"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Architecture & Problem Statement</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the system architecture, core problem, and the machine learning / AI components involved."
                rows={6}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                id="custom-project-desc"
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            Error: {error}
          </div>
        )}

        <div style={{ marginTop: 'var(--space-xl)' }}>
            <button
            className="btn btn-primary btn-lg glow-on-hover"
            onClick={handleAnalyze}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-sm)' }}
            id="analyze-project-btn"
            >
            <Zap size={20} /> Execute Diagnostic
            </button>
        </div>
      </div>
    </div>
  );
}
