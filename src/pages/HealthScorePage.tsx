import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Dumbbell, Target, Zap, Wrench, AlertTriangle, Rocket, Lightbulb, Component, Calendar, MessageSquare, GraduationCap, ArrowLeft } from 'lucide-react';

function ScoreGauge({ score, size = 240 }: { score: number; size?: number }) {
  const radius = (size - 30) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const mounted = useRef(false);

  useEffect(() => { mounted.current = true; }, []);

  const getColor = (s: number) =>
    s >= 75 ? 'var(--success)' : s >= 55 ? 'var(--warning)' : s >= 35 ? 'var(--accent)' : 'var(--danger)';

  return (
    <div className="gauge-container" style={{ position: 'relative', width: size, height: size }}>
      <svg className="gauge-svg" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle className="gauge-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={12} stroke="var(--border-color)" fill="none" />
        <circle
          className="gauge-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={12}
          strokeLinecap="round"
          stroke={getColor(score)}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={mounted.current ? offset : circumference}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 12px ${getColor(score)}80)` }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: getColor(score), lineHeight: 1, textShadow: `0 0 20px ${getColor(score)}40` }}>
          {score}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 'var(--space-xs)' }}>Health Score</div>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) =>
    v >= 75 ? 'var(--success)' : v >= 55 ? 'var(--warning)' : v >= 35 ? 'var(--accent)' : 'var(--danger)';

  return (
    <div className="card glass-panel" style={{ padding: 'var(--space-md)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: getColor(value) }}>{value}/100</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{ 
            width: `${value}%`, 
            height: '100%', 
            background: getColor(value),
            borderRadius: 3,
            boxShadow: `0 0 8px ${getColor(value)}80`,
            transition: 'width 1s ease-out'
          }}
        />
      </div>
    </div>
  );
}

const VERDICT_ICONS: Record<string, string> = {
  GOOD_TO_BUILD: '✅',
  NEEDS_MODIFICATION: '🔧',
  HIGH_RISK: '⚠️',
  NOT_RECOMMENDED: '🚫',
};

const VERDICT_LABELS: Record<string, string> = {
  GOOD_TO_BUILD: 'Authorized for Build',
  NEEDS_MODIFICATION: 'Requires Refactoring',
  HIGH_RISK: 'High Risk Profile',
  NOT_RECOMMENDED: 'Execution Not Advised',
};

export default function HealthScorePage() {
  const navigate = useNavigate();
  const result = useAppStore((s) => s.realityCheck);
  const projectTitle = useAppStore((s) => s.getActiveProjectTitle)();

  useEffect(() => {
    if (!result) navigate('/reality-check');
  }, []);

  if (!result) return null;

  const { scores, healthScore, analysis, verdict, verdictExplanation, alternativeSuggestion } = result;

  const scoreLabels: Record<string, string> = {
    innovation: 'Innovation Index',
    feasibility: 'Feasibility Rating',
    technicalComplexity: 'Tech Complexity',
    datasetAvailability: 'Data Availability',
    costFeasibility: 'Cost Efficiency',
    timeFeasibility: 'Time Constraints',
    aiPotential: 'AI Integration',
    resumeValue: 'Portfolio Value',
    riskLevel: 'Risk Assessment',
  };

  const getVerdictColor = (v: string) => {
      switch(v) {
          case 'GOOD_TO_BUILD': return 'var(--success)';
          case 'NEEDS_MODIFICATION': return 'var(--warning)';
          case 'HIGH_RISK': return 'var(--accent)';
          case 'NOT_RECOMMENDED': return 'var(--danger)';
          default: return 'var(--text-primary)';
      }
  };

  return (
    <div className="fade-in">
      <div className="page-header health-header">
        <h1 className="page-title text-gradient">Diagnostic Report</h1>
        <p className="page-subtitle">{projectTitle}</p>
      </div>

      <div className="health-score-grid">
        <div className="card glass-panel health-gauge-card">
          <ScoreGauge score={healthScore} />
        </div>

        <div className="card glass-panel health-verdict-card">
          <div className="verdict-label">System Verdict</div>
          <div className="verdict-badge" style={{ 
              background: `${getVerdictColor(verdict)}20`,
              color: getVerdictColor(verdict),
              borderColor: `${getVerdictColor(verdict)}40`
          }}>
            {VERDICT_ICONS[verdict]} {VERDICT_LABELS[verdict]}
          </div>
          <p className="verdict-explanation">
            {verdictExplanation}
          </p>
        </div>
      </div>

      <div className="health-section">
        <h2 className="section-title">
          Vector Analysis
        </h2>
        <div className="vector-analysis-grid">
          {Object.entries(scores).map(([key, value]) => (
            <MetricBar key={key} label={scoreLabels[key] || key} value={value as number} />
          ))}
        </div>
      </div>

      <div className="health-section">
        <h2 className="section-title">
          Deep Insights
        </h2>
        <div className="insights-grid">
          <div className="card glass-panel card-hover">
            <div className="insight-icon" style={{ color: 'var(--success)' }}><Dumbbell size={24} /></div>
            <div className="insight-label" style={{ color: 'var(--success)' }}>Core Strength</div>
            <div className="insight-desc">{analysis.biggestStrength}</div>
          </div>
          <div className="card glass-panel card-hover">
            <div className="insight-icon" style={{ color: 'var(--warning)' }}><Target size={24} /></div>
            <div className="insight-label" style={{ color: 'var(--warning)' }}>Primary Weakness</div>
            <div className="insight-desc">{analysis.biggestWeakness}</div>
          </div>
          <div className="card glass-panel card-hover">
            <div className="insight-icon" style={{ color: 'var(--accent)' }}><Zap size={24} /></div>
            <div className="insight-label" style={{ color: 'var(--accent)' }}>Technical Risk</div>
            <div className="insight-desc">{analysis.technicalRisk}</div>
          </div>
          <div className="card glass-panel card-hover">
            <div className="insight-icon" style={{ color: 'var(--danger)' }}><Wrench size={24} /></div>
            <div className="insight-label" style={{ color: 'var(--danger)' }}>Implementation Risk</div>
            <div className="insight-desc">{analysis.implementationRisk}</div>
          </div>
          <div className="card glass-panel card-hover full-width">
            <div className="insight-icon" style={{ color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
            <div className="insight-label" style={{ color: 'var(--danger)' }}>Failure Scenario</div>
            <div className="insight-desc">{analysis.failureScenario}</div>
          </div>
          <div className="card glass-panel card-hover full-width">
            <div className="insight-icon" style={{ color: 'var(--primary)' }}><Rocket size={24} /></div>
            <div className="insight-label" style={{ color: 'var(--primary)' }}>Optimization Vector</div>
            <div className="insight-desc">{analysis.improvementSuggestion}</div>
          </div>
        </div>
      </div>

      {alternativeSuggestion && (
        <div className="card glass-panel alternative-suggestion-card">
          <h4><Lightbulb size={20} /> Suggested Pivot</h4>
          <p>{alternativeSuggestion}</p>
        </div>
      )}

      <div className="health-actions">
        <button className="btn btn-primary glow-on-hover health-btn" onClick={() => navigate('/architecture')}>
          <Component size={18} /> View Architecture
        </button>
        <button className="btn btn-primary glow-on-hover health-btn" onClick={() => navigate('/roadmap')}>
          <Calendar size={18} /> Generate Roadmap
        </button>
        <button className="btn btn-secondary health-btn" onClick={() => navigate('/mentor')}>
          <MessageSquare size={18} /> AI Consultant
        </button>
        <button className="btn btn-secondary health-btn" onClick={() => navigate('/viva')}>
          <GraduationCap size={18} /> Prep Defense
        </button>
        <button className="btn btn-ghost health-btn" onClick={() => navigate('/reality-check')}>
          <ArrowLeft size={18} /> Return
        </button>
      </div>
    </div>
  );
}
