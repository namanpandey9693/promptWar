import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { mentorChat } from '../services/api';

const SUGGESTED_PROMPTS = [
  { label: '🏗️ Architecture Breakdown', prompt: 'Explain the architecture for my project and why each technology was chosen.' },
  { label: '⚠️ Risk Mitigation', prompt: 'What are the main risks in my project and how can I mitigate them?' },
  { label: '📋 Next Immediate Step', prompt: 'What should I work on next in my project? Give me specific steps.' },
  { label: '📊 Dataset Sourcing', prompt: 'What datasets should I use for my project? Suggest specific, real datasets with sources.' },
  { label: '🎓 Mock Viva Defense', prompt: 'Give me 5 tough viva questions an examiner might ask about my project, with ideal answers.' },
  { label: '💡 Innovation Booster', prompt: 'How can I make my project stand out and improve its innovation factor?' },
  { label: '🧪 Testing Protocol', prompt: 'What testing strategy should I follow for my project? Include unit, integration, and user testing.' },
  { label: '📝 Doc Outline', prompt: 'What should my project documentation include? Give me an outline.' },
];

export default function MentorPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const chatHistory = useAppStore((s) => s.chatHistory);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const projectTitle = useAppStore((s) => s.getActiveProjectTitle)();
  const projectDesc = useAppStore((s) => s.getActiveProjectDescription)();
  const techStack = useAppStore((s) => s.getActiveProjectTechStack)();

  const architecture = useAppStore((s) => s.architecture);
  const roadmap = useAppStore((s) => s.roadmap);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile || !projectTitle) {
      navigate('/reality-check');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || !profile || loading) return;

    addChatMessage({ role: 'user', content: message });
    setInput('');
    setLoading(true);

    try {
      const archSummary = architecture ? `Modules: ${architecture.mainModules.map(m => m.name).join(', ')}. Tech: ${architecture.frontend.tech}, ${architecture.backend.tech}` : undefined;
      const roadmapSummary = roadmap ? `${roadmap.phases.length} phases.` : undefined;

      const result = await mentorChat(
        profile,
        projectTitle,
        projectDesc,
        techStack,
        message,
        chatHistory.map((m) => ({ role: m.role, content: m.content })),
        archSummary,
        roadmapSummary
      );
      addChatMessage({ role: 'model', content: result.response });
    } catch (err: any) {
      addChatMessage({ role: 'model', content: `⚠️ Sorry, I couldn't respond. Error: ${err.message}. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>
        <h1 className="page-title text-gradient">AI Consultant</h1>
        <p className="page-subtitle" style={{ fontSize: '1.05rem' }}>
          Expert guidance for <strong>{projectTitle}</strong>
        </p>
      </div>

      <div className="chat-container glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {chatHistory.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) var(--space-xl)', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)', animation: 'float 6s infinite ease-in-out' }}>🧠</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Consultation Initialized</h3>
              <p style={{ maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                I have loaded your system architecture and deployment roadmap into my context window. What technical challenge can we solve today?
              </p>
            </div>
          )}

          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`} style={{
              display: 'flex',
              gap: 'var(--space-md)',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div className="chat-avatar" style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                flexShrink: 0
              }}>
                {msg.role === 'user' ? '👤' : '🧠'}
              </div>
              <div className="chat-bubble" style={{
                padding: 'var(--space-md) var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-light)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                maxWidth: '75%',
                lineHeight: 1.6,
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                borderTopRightRadius: 4,
                borderTopLeftRadius: 'var(--radius-lg)',
              }}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} style={{ marginBottom: line ? '0.5em' : 0 }}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message ai" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div className="chat-avatar" style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                🧠
              </div>
              <div className="chat-bubble" style={{ padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderTopLeftRadius: 4 }}>
                <div style={{ display: 'flex', gap: 6, padding: '8px 4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {chatHistory.length === 0 && (
          <div className="suggested-prompts" style={{ padding: '0 var(--space-xl) var(--space-md)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center' }}>
            {SUGGESTED_PROMPTS.map((sp, idx) => (
              <button
                key={idx}
                className="chip"
                style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                onClick={() => sendMessage(sp.prompt)}
                disabled={loading}
              >
                {sp.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area" style={{ padding: 'var(--space-lg)', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 'var(--space-md)' }}>
          <input
            className="form-input"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-lg)' }}
            placeholder="Type a query to the AI Consultant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            id="mentor-input"
          />
          <button
            className="btn btn-primary glow-on-hover"
            style={{ padding: '0 var(--space-xl)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            id="mentor-send"
          >
            Transmit <span style={{ fontSize: '1.2rem' }}>↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
