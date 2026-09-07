import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateRoadmap } from '../services/api';

export default function RoadmapPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const roadmap = useAppStore((s) => s.roadmap);
  const setRoadmap = useAppStore((s) => s.setRoadmap);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const projectTitle = useAppStore((s) => s.getActiveProjectTitle)();
  const projectDesc = useAppStore((s) => s.getActiveProjectDescription)();
  const techStack = useAppStore((s) => s.getActiveProjectTechStack)();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));

  const loadRoadmap = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateRoadmap(profile, projectTitle, projectDesc, techStack);
      setRoadmap(result);
      // Expand all phases
      setExpandedPhases(new Set(result.phases.map((_: unknown, i: number) => i)));
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile || !projectTitle) {
      navigate('/reality-check');
      return;
    }
    if (!roadmap) {
      loadRoadmap();
    }
  }, [profile, projectTitle, roadmap, navigate]);

  const togglePhase = (idx: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="fade-in loading-container">
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Compiling Execution Plan</h2>
        <p style={{ color: 'var(--text-muted)' }}>Structuring phases, tasks, and optimal timeline...</p>
        <div className="roadmap-skeleton-list">
           {[1, 2, 3].map(i => (
               <div key={i} className="glass-panel roadmap-skeleton-item" style={{ animationDelay: `${i * 0.2}s` }} />
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in loading-container">
        <div className="status-dot offline" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>Timeline Generation Failed</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadRoadmap}>Retry Generation</button>
      </div>
    );
  }

  if (!roadmap) return null;

  const totalTasks = roadmap.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce((sum, p) => sum + p.tasks.filter((t) => t.completed).length, 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityBadge = (p: string) =>
    p === 'high' ? 'var(--danger)' : p === 'medium' ? 'var(--warning)' : 'var(--info)';

  return (
    <div className="fade-in roadmap-container">
      <div className="page-header roadmap-header">
        <h1 className="page-title text-gradient">Execution Timeline</h1>
        <p className="page-subtitle">{projectTitle}</p>
      </div>

      {/* Progress Bar */}
      <div className="card glass-panel roadmap-progress-card">
        <div className="roadmap-progress-header">
          <span className="roadmap-progress-label">Project Velocity</span>
          <span className="roadmap-progress-value">{progress}% <span className="roadmap-progress-tasks">({completedTasks}/{totalTasks} tasks)</span></span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: progress >= 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), var(--accent))',
              boxShadow: `0 0 12px ${progress >= 100 ? 'var(--success)' : 'var(--primary)'}80`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </div>

      {/* Phases */}
      <div className="roadmap-timeline">
        {/* Vertical Timeline Line */}
        <div className="roadmap-timeline-line" />

        {roadmap.phases.map((phase, phaseIdx) => {
          const phaseCompleted = phase.tasks.filter((t) => t.completed).length;
          const phaseTotal = phase.tasks.length;
          const isExpanded = expandedPhases.has(phaseIdx);
          const isPhaseDone = phaseTotal > 0 && phaseCompleted === phaseTotal;

          return (
            <div key={phaseIdx} className="slide-in roadmap-phase-wrapper" style={{ animationDelay: `${phaseIdx * 0.1}s` }}>
              
              {/* Timeline Dot */}
              <div className={`roadmap-timeline-dot ${isPhaseDone ? 'done' : ''}`} />

              <div className={`card glass-panel phase-card ${isExpanded ? 'expanded' : ''} ${isPhaseDone ? 'done' : ''}`}>
                <div 
                    className="phase-header"
                    onClick={() => togglePhase(phaseIdx)}
                >
                  <div className="phase-header-left">
                    <div className="phase-header-eyebrow">
                        <span>Phase {phaseIdx + 1}</span>
                        {isPhaseDone && <span className="chip chip-success">Complete</span>}
                    </div>
                    <div className="phase-title">
                      {phase.name}
                    </div>
                  </div>
                  <div className="phase-meta">
                    <div className="phase-stats">
                        <div className="phase-duration">{phase.duration}</div>
                        <div className="phase-tasks-count">{phaseCompleted}/{phaseTotal} tasks</div>
                    </div>
                    <span className={`phase-chevron ${isExpanded ? 'open' : ''}`}>
                      ▾
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="phase-tasks-list">
                    {phase.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className={`task-item ${task.completed ? 'completed' : ''}`}>
                        <button
                          onClick={() => toggleTask(phaseIdx, taskIdx)}
                          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                        >
                          {task.completed ? '✓' : ''}
                        </button>
                        <span className="task-title">
                          {task.title}
                        </span>
                        <div className="task-chips">
                          <span className="chip time-chip">
                            {task.estimatedTime}
                          </span>
                          <span className="chip" style={{ borderColor: priorityBadge(task.priority), color: priorityBadge(task.priority) }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
