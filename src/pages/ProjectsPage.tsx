import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateProjects, type ProjectIdea } from '../services/api';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) {
      navigate('/profile');
      return;
    }
    if (projects.length === 0) {
      loadProjects();
    }
  }, []);

  const loadProjects = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateProjects(profile);
      setProjects(result.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to generate projects');
    } finally {
      setLoading(false);
    }
  };

  const selectProject = (project: ProjectIdea) => {
    setSelectedProject(project);
    navigate('/reality-check');
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Synthesizing Ideas</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing your profile to generate personalized architectures...</p>
        
        <div className="projects-grid" style={{ width: '100%', marginTop: 'var(--space-xl)', opacity: 0.5 }}>
          {[1, 2, 3].map(i => (
             <div key={i} className="card glass-panel" style={{ height: 300, animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="status-dot offline" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>Generation Failed</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadProjects}>Retry Generation</button>
      </div>
    );
  }

  const getDifficultyColor = (d: string) =>
    d === 'beginner' ? 'var(--success)' : d === 'intermediate' ? 'var(--warning)' : 'var(--danger)';

  const getResumeColor = (r: string) =>
    r === 'exceptional' ? 'var(--accent)' : r === 'high' ? 'var(--success)' : r === 'medium' ? 'var(--warning)' : 'var(--info)';

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title text-gradient">Generated Architectures</h1>
          <p className="page-subtitle">
            Curated ideas based on your expertise. Select a node to begin validation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/reality-check')}>
            Custom Input
          </button>
          <button className="btn btn-ghost" onClick={loadProjects}>
            Regenerate
          </button>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map((project, idx) => (
          <div
            key={idx}
            className="card card-hover glass-panel slide-in glow-on-hover"
            style={{ animationDelay: `${idx * 0.1}s`, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onClick={() => selectProject(project)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <div className="status-dot" style={{ backgroundColor: getDifficultyColor(project.difficulty) }} />
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{project.difficulty}</span>
              </div>
              <span className="chip" style={{ borderColor: getResumeColor(project.resumeValue), color: getResumeColor(project.resumeValue) }}>
                {project.resumeValue} impact
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>{project.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 'var(--space-lg)', flex: 1 }}>{project.description}</p>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-lg)' }}>
              {project.techStack.map((tech) => (
                <span key={tech} className="chip">{tech}</span>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-md)' }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{project.innovationScore}/10</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Innovation</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{project.feasibilityScore}/10</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feasibility</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{project.estimatedDuration}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
