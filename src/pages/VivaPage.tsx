import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateVivaQuestions, evaluateVivaAnswer, type VivaQuestion, type VivaEvaluation } from '../services/api';

const CATEGORIES = ['basic', 'technical', 'architecture', 'aiml', 'database', 'security', 'difficult'];
const CATEGORY_LABELS: Record<string, string> = {
  basic: '📚 Core',
  technical: '⚙️ Tech Stack',
  architecture: '🏗️ Systems',
  aiml: '🧠 ML/AI',
  database: '🗄️ Data',
  security: '🔐 SecOps',
  difficult: '🔥 Stress Test',
};

export default function VivaPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const vivaQuestions = useAppStore((s) => s.vivaQuestions);
  const setVivaQuestions = useAppStore((s) => s.setVivaQuestions);
  const projectTitle = useAppStore((s) => s.getActiveProjectTitle)();
  const projectDesc = useAppStore((s) => s.getActiveProjectDescription)();
  const techStack = useAppStore((s) => s.getActiveProjectTechStack)();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('basic');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<Record<number, VivaEvaluation>>({});
  const [evaluating, setEvaluating] = useState<number | null>(null);

  const loadQuestions = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateVivaQuestions(profile, projectTitle, projectDesc, techStack);
      setVivaQuestions(result.questions);
    } catch (err: any) {
      setError(err.message || 'Failed to generate viva questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile || !projectTitle) {
      navigate('/reality-check');
      return;
    }
    if (vivaQuestions.length === 0) {
      loadQuestions();
    }
  }, [profile, projectTitle, vivaQuestions.length, navigate]);

  const handleEvaluate = async (qIdx: number, question: VivaQuestion) => {
    const answer = answers[qIdx];
    if (!answer?.trim()) return;

    setEvaluating(qIdx);
    try {
      const result = await evaluateVivaAnswer(
        question.question,
        question.expectedPoints,
        answer,
        projectTitle
      );
      setEvaluations((prev) => ({ ...prev, [qIdx]: result }));
    } catch (err: any) {
      alert('Evaluation failed: ' + err.message);
    } finally {
      setEvaluating(null);
    }
  };

  const getScoreColor = (s: number) =>
    s >= 7 ? 'var(--success)' : s >= 5 ? 'var(--warning)' : 'var(--danger)';

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Compiling Defense Questions</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing architecture to generate high-probability examiner queries...</p>
        <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
           {[1, 2, 3].map(i => (
               <div key={i} className="glass-panel" style={{ width: 120, height: 160, borderRadius: 'var(--radius-lg)', animation: `float ${2 + i * 0.5}s infinite ease-in-out` }} />
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
        <button className="btn btn-primary" onClick={loadQuestions}>Retry Compilation</button>
      </div>
    );
  }

  const filteredQuestions = vivaQuestions.filter((q) => q.category === activeCategory);
  const availableCategories = CATEGORIES.filter((cat) =>
    vivaQuestions.some((q) => q.category === cat)
  );

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="page-title text-gradient">Defense Simulator</h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>
          Mock examination for <strong>{projectTitle}</strong>
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center', marginBottom: 'var(--space-2xl)' }}>
        {availableCategories.map((cat) => (
          <button
            key={cat}
            className={`chip ${activeCategory === cat ? 'selected' : ''}`}
            style={activeCategory === cat ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : { cursor: 'pointer' }}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {filteredQuestions.map((question, idx) => {
          const globalIdx = vivaQuestions.indexOf(question);
          const evaluation = evaluations[globalIdx];

          return (
            <div key={globalIdx} className="card glass-panel slide-in" style={{ animationDelay: `${idx * 0.1}s`, padding: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <div style={{ 
                        width: 32, height: 32, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 
                    }}>
                        Q{idx + 1}
                    </div>
                    <h4 style={{ flex: 1, fontSize: '1.15rem', lineHeight: 1.5 }}>
                    {question.question}
                    </h4>
                </div>
                <span className="chip" style={activeCategory === 'difficult' ? { borderColor: 'var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' } : {}}>
                  {CATEGORY_LABELS[question.category]}
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <textarea
                    className="form-textarea"
                    placeholder="Draft your defense response..."
                    rows={4}
                    value={answers[globalIdx] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [globalIdx]: e.target.value }))}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)' }}
                    disabled={!!evaluation}
                />
                
                {!evaluation && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
                        <button
                            className="btn btn-primary glow-on-hover"
                            onClick={() => handleEvaluate(globalIdx, question)}
                            disabled={evaluating === globalIdx || !answers[globalIdx]?.trim()}
                        >
                            {evaluating === globalIdx ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <div className="status-dot pulsing" /> Processing
                                </span>
                            ) : 'Submit for Grading'}
                        </button>
                    </div>
                )}
              </div>

              {evaluation && (
                <div className="evaluation-card slide-in" style={{ marginTop: 'var(--space-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        color: getScoreColor(evaluation.score),
                        lineHeight: 1,
                        textShadow: `0 0 12px ${getScoreColor(evaluation.score)}40`
                        }}>
                        {evaluation.score}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>/ 10</div>
                    </div>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${evaluation.score * 10}%`,
                        height: '100%',
                        background: getScoreColor(evaluation.score),
                        boxShadow: `0 0 8px ${getScoreColor(evaluation.score)}80`,
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '1.2rem' }}>✅</span> Positives
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{evaluation.whatWasGood}</p>
                    </div>

                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--warning)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '1.2rem' }}>⚠️</span> Missing Elements
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{evaluation.whatWasMissing}</p>
                    </div>

                    <div style={{ gridColumn: '1 / -1', background: 'rgba(59, 130, 246, 0.05)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '1.2rem' }}>💡</span> Optimal Response
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{evaluation.betterAnswer}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
            No questions available in this sector.
          </div>
        )}
      </div>
    </div>
  );
}
