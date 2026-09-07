import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateProjects, type ProjectIdea } from '../services/api';
import { RefreshCw, Edit3, ChevronRight, Activity, Clock, Lightbulb } from 'lucide-react';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!profile) {
      navigate('/profile');
      return;
    }
    if (projects.length === 0) {
      loadProjects();
    }
  }, [profile, projects.length, navigate]);

  const selectProject = (project: ProjectIdea) => {
    setSelectedProject(project);
    navigate('/reality-check');
  };

  if (loading) {
    return (
      <div className="fade-in loading-container">
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Synthesizing Ideas</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing your profile to generate personalized architectures...</p>
        
        <div className="projects-grid projects-skeleton-grid">
          {[1, 2, 3].map(i => (
             <div key={i} className="card glass-panel projects-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in loading-container">
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
      <div className="page-header projects-header">
        <div>
          <h1 className="page-title text-gradient">Generated Architectures</h1>
          <p className="page-subtitle">
            Curated ideas based on your expertise. Select a node to begin validation.
          </p>
        </div>
        <div className="projects-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/reality-check')}>
            <Edit3 size={16} /> Custom Input
          </button>
          <button className="btn btn-ghost" onClick={loadProjects}>
            <RefreshCw size={16} /> Regenerate
          </button>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map((project, idx) => (
          <div
            key={idx}
            className="card card-hover glass-panel slide-in glow-on-hover project-card"
            style={{ animationDelay: `${idx * 0.1}s` }}
            onClick={() => selectProject(project)}
          >
            <div className="project-card-header">
              <div className="project-difficulty-wrapper">
                <div className="status-dot" style={{ backgroundColor: getDifficultyColor(project.difficulty) }} />
                <span className="project-difficulty-text">{project.difficulty}</span>
              </div>
              <span className="chip" style={{ borderColor: getResumeColor(project.resumeValue), color: getResumeColor(project.resumeValue) }}>
                {project.resumeValue} impact
              </span>
            </div>

            <h3 className="project-card-title">{project.title}</h3>
            <p className="project-card-desc">{project.description}</p>

            <div className="project-tech-stack">
              {project.techStack.map((tech) => (
                <span key={tech} className="chip">{tech}</span>
              ))}
            </div>
            
            <div className="project-metrics-grid">
               <div className="project-metric">
                  <Lightbulb size={16} className="project-metric-icon" />
                  <div className="project-metric-value">{project.innovationScore}/10</div>
                  <div className="project-metric-label">Innovation</div>
               </div>
               <div className="project-metric">
                  <Activity size={16} className="project-metric-icon" />
                  <div className="project-metric-value">{project.feasibilityScore}/10</div>
                  <div className="project-metric-label">Feasibility</div>
               </div>
               <div className="project-metric">
                  <Clock size={16} className="project-metric-icon" />
                  <div className="project-metric-value">{project.estimatedDuration}</div>
                  <div className="project-metric-label">Time</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
