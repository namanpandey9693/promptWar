import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';

// ── Route-based code splitting (Efficiency) ─────────────────────────
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const RealityCheckPage = lazy(() => import('./pages/RealityCheckPage'));
const HealthScorePage = lazy(() => import('./pages/HealthScorePage'));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const MentorPage = lazy(() => import('./pages/MentorPage'));
const VivaPage = lazy(() => import('./pages/VivaPage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
import AuthGuard from './components/AuthGuard';

import { User, Lightbulb, CheckSquare, Activity, Component, Map, MessageSquare, GraduationCap, Rocket } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/profile', icon: <User size={18} />, label: 'Student Profile', requiresProfile: false },
  { path: '/projects', icon: <Lightbulb size={18} />, label: 'Project Ideas', requiresProfile: true },
  { path: '/reality-check', icon: <CheckSquare size={18} />, label: 'Reality Check', requiresProfile: true },
  { path: '/health-score', icon: <Activity size={18} />, label: 'Health Score', requiresRealityCheck: true },
  { path: '/architecture', icon: <Component size={18} />, label: 'Architecture', requiresRealityCheck: true },
  { path: '/roadmap', icon: <Map size={18} />, label: 'Roadmap', requiresRealityCheck: true },
  { path: '/mentor', icon: <MessageSquare size={18} />, label: 'AI Mentor', requiresRealityCheck: true },
  { path: '/viva', icon: <GraduationCap size={18} />, label: 'Viva Prep', requiresRealityCheck: true },
];

/** Loading fallback shown while lazy chunks are loading */
function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div className="status-dot pulsing" style={{ width: 20, height: 20, marginBottom: 'var(--space-md)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
    </div>
  );
}

function TopHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="top-header fade-in" role="banner">
      <div className="top-header-left">
        <div className="top-header-title">{title}</div>
        {subtitle && <div className="top-header-subtitle">{subtitle}</div>}
      </div>
      <div className="top-header-right">
        <div
          className="ai-status-card"
          style={{ padding: '4px 12px', background: 'transparent', border: '1px solid var(--border-light)' }}
          role="status"
          aria-label="AI service status: online"
        >
          <div className="status-dot" style={{ width: 6, height: 6 }} aria-hidden="true" />
          <div className="status-text" style={{ fontSize: '0.65rem' }}>AI Online</div>
        </div>
        <div className="user-avatar" style={{ cursor: 'pointer' }} aria-hidden="true">✨</div>
      </div>
    </header>
  );
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const realityCheck = useAppStore((s) => s.realityCheck);
  const healthScore = realityCheck?.healthScore;

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div
        className="sidebar-logo"
        onClick={() => navigate('/')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
        role="button"
        tabIndex={0}
        aria-label="Go to homepage"
      >
        <div className="sidebar-logo-title">
          <span className="sidebar-logo-icon" aria-hidden="true"><Rocket size={20} /></span>
          ProjectPilot AI
        </div>
        <div className="sidebar-logo-subtitle">AI Project Mentor</div>
      </div>

      <nav className="sidebar-nav" aria-label="Application sections">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled =
            (item.requiresProfile && !profile) || (item.requiresRealityCheck && !realityCheck);

          return (
            <button
              key={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && navigate(item.path)}
              disabled={isDisabled}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={isDisabled}
              aria-label={`${item.label}${isDisabled ? ' (locked)' : ''}`}
            >
              <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.path === '/health-score' && healthScore !== undefined && (
                <span className="badge badge-accent" style={{ marginLeft: 'auto' }} aria-label={`Score: ${healthScore}`}>
                  {healthScore}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="ai-status-card" role="status" aria-label="AI system online">
          <div className="status-dot" aria-hidden="true" />
          <div>
            <div className="status-text">System Online</div>
            <div className="status-sub">Gemini Intelligence</div>
          </div>
        </div>

        {profile && (
          <div className="user-profile-card" role="complementary" aria-label="Logged in user">
            <div className="user-avatar" aria-hidden="true">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {profile.branch} • {profile.year}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

const getPageInfo = (path: string) => {
  const map: Record<string, { title: string; sub: string }> = {
    '/profile': { title: 'Student Profile', sub: 'Setup your preferences' },
    '/projects': { title: 'Project Ideas', sub: 'AI recommendations' },
    '/reality-check': { title: 'Reality Check', sub: 'Project feasibility' },
    '/health-score': { title: 'Health Score', sub: 'Overall analysis' },
    '/architecture': { title: 'Architecture', sub: 'System blueprint' },
    '/roadmap': { title: 'Roadmap', sub: 'Development timeline' },
    '/mentor': { title: 'AI Mentor', sub: 'Contextual assistance' },
    '/viva': { title: 'Viva Prep', sub: 'Exam readiness' },
  };
  return map[path] || { title: 'Dashboard', sub: '' };
};

export default function App() {
  const location = useLocation();
  const pageInfo = getPageInfo(location.pathname);
  const profile = useAppStore((state) => state.profile);

  useEffect(() => {
    // EMERGENCY BACKUP: Preserve in-memory state before it gets wiped by store refactoring
    const currentState = useAppStore.getState();
    if (currentState.profile && currentState.profile.name) {
      localStorage.setItem('projectpilot_legacy_backup', JSON.stringify(currentState));
    }
  }, [profile]);

  return (
    <>
      {/* Skip-to-content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'fixed';
          e.currentTarget.style.top = '10px';
          e.currentTarget.style.left = '10px';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.padding = '12px 24px';
          e.currentTarget.style.background = '#6366F1';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderRadius = '8px';
          e.currentTarget.style.zIndex = '10000';
          e.currentTarget.style.fontSize = '0.9rem';
          e.currentTarget.style.fontWeight = '600';
          e.currentTarget.style.overflow = 'visible';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.left = '-9999px';
          e.currentTarget.style.width = '1px';
          e.currentTarget.style.height = '1px';
          e.currentTarget.style.overflow = 'hidden';
        }}
      >
        Skip to main content
      </a>

      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/*" element={
            <div className="app-layout">
              <Sidebar />
              <main className="main-content" id="main-content" role="main" aria-label={pageInfo.title}>
                <TopHeader title={pageInfo.title} subtitle={pageInfo.sub} />
                <div className="page-content">
                  <Routes>
                    <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                    <Route path="/projects" element={<AuthGuard><ProjectsPage /></AuthGuard>} />
                    <Route path="/reality-check" element={<AuthGuard><RealityCheckPage /></AuthGuard>} />
                    <Route path="/health-score" element={<AuthGuard><HealthScorePage /></AuthGuard>} />
                    <Route path="/architecture" element={<AuthGuard><ArchitecturePage /></AuthGuard>} />
                    <Route path="/roadmap" element={<AuthGuard><RoadmapPage /></AuthGuard>} />
                    <Route path="/mentor" element={<AuthGuard><MentorPage /></AuthGuard>} />
                    <Route path="/viva" element={<AuthGuard><VivaPage /></AuthGuard>} />
                  </Routes>
                </div>
              </main>
            </div>
          } />
        </Routes>
      </Suspense>
    </>
  );
}

