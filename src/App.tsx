import { Suspense, lazy, useEffect, useState } from 'react';
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

import { User, Lightbulb, CheckSquare, Activity, Component, Map, MessageSquare, GraduationCap, Rocket, Menu, X } from 'lucide-react';

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

function TopHeader({ title, subtitle, onMenuClick }: { title: string; subtitle: string; onMenuClick: () => void }) {
  return (
    <header className="top-header fade-in" role="banner">
      <div className="top-header-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={24} />
        </button>
        <div>
          <div className="top-header-title">{title}</div>
          {subtitle && <div className="top-header-subtitle">{subtitle}</div>}
        </div>
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

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const realityCheck = useAppStore((s) => s.realityCheck);
  const healthScore = realityCheck?.healthScore;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          className="sidebar-logo"
          onClick={() => { navigate('/'); onClose(); }}
          onKeyDown={(e) => { e.key === 'Enter' && navigate('/'); onClose(); }}
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
        <button className="mobile-menu-btn mobile-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={24} />
        </button>
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
              onClick={() => {
                if (!isDisabled) {
                  navigate(item.path);
                  onClose();
                }
              }}
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

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageInfo = getPageInfo(location.pathname);

  // Auto-close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Mobile backdrop */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="main-content" id="main-content" role="main" aria-label={pageInfo.title}>
        <TopHeader 
          title={pageInfo.title} 
          subtitle={pageInfo.sub} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
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
            <DashboardLayout>
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
            </DashboardLayout>
          } />
        </Routes>
      </Suspense>
    </>
  );
}

