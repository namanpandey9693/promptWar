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
      <div className="fade-in loading-container">
        <div className="status-dot pulsing" style={{ width: 24, height: 24, marginBottom: 'var(--space-md)' }} />
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Compiling Defense Questions</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing architecture to generate high-probability examiner queries...</p>
        <div className="viva-skeleton-list">
           {[1, 2, 3].map(i => (
               <div key={i} className="glass-panel viva-skeleton-item" style={{ animationDelay: `${i * 0.5}s` }} />
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
        <button className="btn btn-primary" onClick={loadQuestions}>Retry Compilation</button>
      </div>
    );
  }

  const filteredQuestions = vivaQuestions.filter((q) => q.category === activeCategory);
  const availableCategories = CATEGORIES.filter((cat) =>
    vivaQuestions.some((q) => q.category === cat)
  );

  return (
    <div className="fade-in viva-container">
      <div className="page-header viva-header">
        <h1 className="page-title text-gradient">Defense Simulator</h1>
        <p className="page-subtitle">
          Mock examination for <strong>{projectTitle}</strong>
        </p>
      </div>

      {/* Category Tabs */}
      <div className="viva-category-tabs">
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
      <div className="viva-questions-list">
        {filteredQuestions.map((question, idx) => {
          const globalIdx = vivaQuestions.indexOf(question);
          const evaluation = evaluations[globalIdx];

          return (
            <div key={globalIdx} className="card glass-panel slide-in viva-question-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="viva-question-header">
                <div className="viva-question-title-wrapper">
                    <div className="viva-question-number">
                        Q{idx + 1}
                    </div>
                    <h4 className="viva-question-text">
                    {question.question}
                    </h4>
                </div>
                <span className="chip" style={activeCategory === 'difficult' ? { borderColor: 'var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' } : {}}>
                  {CATEGORY_LABELS[question.category]}
                </span>
              </div>

              <div className="viva-textarea-wrapper">
                <textarea
                    className="form-textarea"
                    placeholder="Draft your defense response..."
                    rows={4}
                    value={answers[globalIdx] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [globalIdx]: e.target.value }))}
                    disabled={!!evaluation}
                />
                
                {!evaluation && (
                    <div className="viva-submit-wrapper">
                        <button
                            className="btn btn-primary glow-on-hover viva-submit-btn"
                            onClick={() => handleEvaluate(globalIdx, question)}
                            disabled={evaluating === globalIdx || !answers[globalIdx]?.trim()}
                        >
                            {evaluating === globalIdx ? (
                                <span className="viva-btn-content">
                                    <div className="status-dot pulsing" /> Processing
                                </span>
                            ) : 'Submit for Grading'}
                        </button>
                    </div>
                )}
              </div>

              {evaluation && (
                <div className="evaluation-card slide-in viva-evaluation-card">
                  <div className="viva-score-header">
                    <div className="viva-score-display">
                        <div className="viva-score-number" style={{ color: getScoreColor(evaluation.score), textShadow: `0 0 12px ${getScoreColor(evaluation.score)}40` }}>
                        {evaluation.score}
                        </div>
                        <div className="viva-score-max">/ 10</div>
                    </div>
                    <div className="viva-score-bar-bg">
                      <div className="viva-score-bar-fill" style={{
                        width: `${evaluation.score * 10}%`,
                        background: getScoreColor(evaluation.score),
                        boxShadow: `0 0 8px ${getScoreColor(evaluation.score)}80`,
                      }} />
                    </div>
                  </div>

                  <div className="viva-evaluation-grid">
                    <div>
                        <div className="viva-eval-section-title" style={{ color: 'var(--success)' }}>
                            <span>✅</span> Positives
                        </div>
                        <p className="viva-eval-text">{evaluation.whatWasGood}</p>
                    </div>

                    <div>
                        <div className="viva-eval-section-title" style={{ color: 'var(--warning)' }}>
                            <span>⚠️</span> Missing Elements
                        </div>
                        <p className="viva-eval-text">{evaluation.whatWasMissing}</p>
                    </div>

                    <div className="viva-optimal-response">
                        <div className="viva-eval-section-title" style={{ color: 'var(--primary)' }}>
                            <span>💡</span> Optimal Response
                        </div>
                        <p className="viva-eval-text">{evaluation.betterAnswer}</p>
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
