import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

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
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title text-gradient">Diagnostic Report</h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>{projectTitle}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
          <ScoreGauge score={healthScore} />
        </div>

        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-xl)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-md)' }}>System Verdict</div>
          <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              background: `${getVerdictColor(verdict)}20`,
              color: getVerdictColor(verdict),
              border: `1px solid ${getVerdictColor(verdict)}40`,
              borderRadius: 'var(--radius-lg)',
              fontWeight: 600,
              fontSize: '1.2rem',
              marginBottom: 'var(--space-lg)',
              alignSelf: 'flex-start'
          }}>
            {VERDICT_ICONS[verdict]} {VERDICT_LABELS[verdict]}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            {verdictExplanation}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-sm)' }}>
          Vector Analysis
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          {Object.entries(scores).map(([key, value]) => (
            <MetricBar key={key} label={scoreLabels[key] || key} value={value as number} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-sm)' }}>
          Deep Insights
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="card glass-panel card-hover">
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>💪</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Core Strength</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.biggestStrength}</div>
          </div>
          <div className="card glass-panel card-hover">
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>🎯</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Primary Weakness</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.biggestWeakness}</div>
          </div>
          <div className="card glass-panel card-hover">
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>⚡</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Technical Risk</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.technicalRisk}</div>
          </div>
          <div className="card glass-panel card-hover">
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>🔧</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Implementation Risk</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.implementationRisk}</div>
          </div>
          <div className="card glass-panel card-hover" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>💥</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Failure Scenario</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.failureScenario}</div>
          </div>
          <div className="card glass-panel card-hover" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>🚀</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Optimization Vector</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.improvementSuggestion}</div>
          </div>
        </div>
      </div>

      {alternativeSuggestion && (
        <div className="card glass-panel" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)', marginBottom: 'var(--space-xl)' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span> Suggested Pivot
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{alternativeSuggestion}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-2xl)' }}>
        <button className="btn btn-primary glow-on-hover" onClick={() => navigate('/architecture')}>
          🏗️ View Architecture
        </button>
        <button className="btn btn-primary glow-on-hover" onClick={() => navigate('/roadmap')}>
          📅 Generate Roadmap
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/mentor')}>
          💬 AI Consultant
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/viva')}>
          🎓 Prep Defense
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/reality-check')}>
          ← Return
        </button>
      </div>
    </div>
  );
}
