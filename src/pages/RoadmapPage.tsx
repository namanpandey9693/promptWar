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

  useEffect(() => {
    if (!profile || !projectTitle) {
      navigate('/reality-check');
      return;
    }
    if (!roadmap) {
      loadRoadmap();
    }
  }, []);

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
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Compiling Execution Plan</h2>
        <p style={{ color: 'var(--text-muted)' }}>Structuring phases, tasks, and optimal timeline...</p>
        <div style={{ marginTop: 'var(--space-2xl)', width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
           {[1, 2, 3].map(i => (
               <div key={i} className="glass-panel" style={{ height: 60, width: '100%', animation: `slideRight ${1 + i * 0.2}s infinite ease-in-out` }} />
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
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
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="page-title text-gradient">Execution Timeline</h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>{projectTitle}</p>
      </div>

      {/* Progress Bar */}
      <div className="card glass-panel" style={{ marginBottom: 'var(--space-3xl)', padding: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Project Velocity</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.25rem' }}>{progress}% <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({completedTasks}/{totalTasks} tasks)</span></span>
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
      <div style={{ position: 'relative', paddingLeft: 'var(--space-xl)' }}>
        {/* Vertical Timeline Line */}
        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--border-color)', zIndex: 0 }} />

        {roadmap.phases.map((phase, phaseIdx) => {
          const phaseCompleted = phase.tasks.filter((t) => t.completed).length;
          const phaseTotal = phase.tasks.length;
          const isExpanded = expandedPhases.has(phaseIdx);
          const isPhaseDone = phaseTotal > 0 && phaseCompleted === phaseTotal;

          return (
            <div key={phaseIdx} className="slide-in" style={{ animationDelay: `${phaseIdx * 0.1}s`, position: 'relative', marginBottom: 'var(--space-2xl)', zIndex: 1 }}>
              
              {/* Timeline Dot */}
              <div style={{ 
                  position: 'absolute', 
                  left: 'calc(-1 * var(--space-xl) + 8px)', 
                  top: 24,
                  transform: 'translate(-50%, -50%)',
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  background: isPhaseDone ? 'var(--success)' : 'var(--bg-secondary)', 
                  border: `2px solid ${isPhaseDone ? 'var(--success)' : 'var(--primary)'}`,
                  boxShadow: isPhaseDone ? '0 0 10px var(--success)' : '0 0 10px var(--primary)40',
                  zIndex: 2,
                  transition: 'all 0.3s ease'
              }} />

              <div className={`card glass-panel phase-card ${isExpanded ? 'expanded' : ''}`} style={{ padding: 0, overflow: 'hidden', border: isPhaseDone ? '1px solid rgba(16, 185, 129, 0.2)' : undefined }}>
                <div 
                    onClick={() => togglePhase(phaseIdx)}
                    style={{ 
                        padding: 'var(--space-lg) var(--space-xl)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: isPhaseDone ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                        transition: 'background 0.2s ease'
                    }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Phase {phaseIdx + 1}</span>
                        {isPhaseDone && <span className="chip" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>Complete</span>}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {phase.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{phase.duration}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{phaseCompleted}/{phaseTotal} tasks</div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                      ▾
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-light)', padding: 'var(--space-lg) var(--space-xl)', background: 'rgba(0,0,0,0.2)' }}>
                    {phase.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 'var(--space-md)', 
                          padding: 'var(--space-sm) 0',
                          opacity: task.completed ? 0.6 : 1,
                          transition: 'opacity 0.2s ease'
                      }}>
                        <button
                          onClick={() => toggleTask(phaseIdx, taskIdx)}
                          style={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 6, 
                              border: `2px solid ${task.completed ? 'var(--success)' : 'var(--text-muted)'}`,
                              background: task.completed ? 'var(--success)' : 'transparent',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.2s ease'
                          }}
                          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                        >
                          {task.completed ? '✓' : ''}
                        </button>
                        <span style={{ flex: 1, fontSize: '0.95rem', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                          {task.title}
                        </span>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <span className="chip" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                            {task.estimatedTime}
                          </span>
                          <span className="chip" style={{ fontSize: '0.75rem', borderColor: priorityBadge(task.priority), color: priorityBadge(task.priority) }}>
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
