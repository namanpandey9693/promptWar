import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const PROGRAMMING_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'C#',
  'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'R', 'MATLAB',
];

const TECHNOLOGIES = [
  'React', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS',
  'Docker', 'TensorFlow', 'PyTorch', 'scikit-learn', 'OpenCV',
  'React Native', 'Flutter', 'Tailwind CSS', 'GraphQL', 'Redis',
];

const INTERESTS = [
  'Healthcare', 'Education', 'Finance', 'Agriculture', 'Environment',
  'Social Impact', 'E-commerce', 'Gaming', 'Cybersecurity', 'IoT',
  'Robotics', 'NLP', 'Computer Vision', 'Recommendation Systems',
  'Blockchain', 'Automation', 'Transportation', 'Sports', 'Music',
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const setProfile = useAppStore((s) => s.setProfile);
  const existing = useAppStore((s) => s.profile);

  const [form, setForm] = useState({
    name: existing?.name || '',
    branch: existing?.branch || 'CSE',
    year: existing?.year || '4th',
    programmingSkills: existing?.programmingSkills || [] as string[],
    technologies: existing?.technologies || [] as string[],
    aimlKnowledge: existing?.aimlKnowledge || 'basic',
    webDevKnowledge: existing?.webDevKnowledge || 'basic',
    interests: existing?.interests || [] as string[],
    teamSize: existing?.teamSize || 2,
    availableMonths: existing?.availableMonths || 4,
    budget: existing?.budget || 'low',
    difficulty: existing?.difficulty || 'intermediate',
    careerGoal: existing?.careerGoal || '',
  });

  const completion = useMemo(() => {
    let score = 0;
    if (form.name) score += 20;
    if (form.programmingSkills.length > 0) score += 20;
    if (form.interests.length > 0) score += 20;
    if (form.careerGoal) score += 20;
    if (form.technologies.length > 0) score += 20;
    return score;
  }, [form]);

  const toggleChip = (field: 'programmingSkills' | 'technologies' | 'interests', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.programmingSkills.length === 0 || form.interests.length === 0) {
      alert('Please fill in your name, select at least one programming skill, and one area of interest.');
      return;
    }
    setProfile(form as any);
    navigate('/projects');
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 'var(--space-3xl)' }}>
      
      {/* Premium Onboarding Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <span className="page-eyebrow">ProjectPilot AI • Profile Setup</span>
          <h1 className="page-title">Tell us about yourself.</h1>
          <p className="page-subtitle">
            Your profile helps ProjectPilot find projects that match your skills, goals and constraints.
          </p>
        </div>
        <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', border: '1px solid var(--border-accent)', background: 'rgba(139,92,246,0.05)' }}>
          <div className="status-dot" style={{ background: 'var(--accent-primary-hover)', boxShadow: '0 0 10px var(--accent-primary-hover)' }}></div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-primary-hover)', letterSpacing: '0.05em' }}>AI PROFILE MATCH</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Personalization engine ready</div>
          </div>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-info">
          <div className="progress-title">Profile Completion</div>
          <div className="progress-desc">Complete your profile to unlock personalized recommendations.</div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completion}%` }}></div>
          </div>
          <div className="progress-value">{completion}%</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        
        {/* CARD 1 */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)' }}>
            <span className="section-icon">👤</span>
            <h2 className="section-title" style={{ fontSize: '1.1rem' }}>About You</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input className="form-input" type="text" placeholder="Enter your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select className="form-select" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="AIML">AI & Machine Learning (AIML)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select className="form-select" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team Size</label>
              <select className="form-select" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'member' : 'members'}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)' }}>
            <span className="section-icon">⏱️</span>
            <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Project Constraints</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Available Time</label>
              <select className="form-select" value={form.availableMonths} onChange={(e) => setForm({ ...form, availableMonths: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} month{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget</label>
              <select className="form-select" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
                <option value="zero">₹0 (Free tools only)</option>
                <option value="low">Low (under ₹2,000)</option>
                <option value="medium">Medium (₹2,000–₹10,000)</option>
                <option value="high">High (₹10,000+)</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Preferred Difficulty</label>
              <select className="form-select" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="beginner">Beginner — Safe and achievable</option>
                <option value="intermediate">Intermediate — Challenging but doable</option>
                <option value="advanced">Advanced — Push my limits</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)' }}>
            <span className="section-icon">🧠</span>
            <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Your Skills</h2>
          </div>
          <div className="form-grid" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">AI/ML Knowledge</label>
              <select className="form-select" value={form.aimlKnowledge} onChange={(e) => setForm({ ...form, aimlKnowledge: e.target.value })}>
                <option value="none">None</option>
                <option value="basic">Basic (know concepts)</option>
                <option value="intermediate">Intermediate (built projects)</option>
                <option value="advanced">Advanced (research-level)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Web Dev Knowledge</label>
              <select className="form-select" value={form.webDevKnowledge} onChange={(e) => setForm({ ...form, webDevKnowledge: e.target.value })}>
                <option value="none">None</option>
                <option value="basic">Basic (HTML/CSS/JS)</option>
                <option value="intermediate">Intermediate (full-stack)</option>
                <option value="advanced">Advanced (production apps)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Programming Skills * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(select all you know)</span></label>
            <div className="chip-group">
              {PROGRAMMING_SKILLS.map((skill) => (
                <div key={skill} className={`chip ${form.programmingSkills.includes(skill) ? 'selected' : ''}`} onClick={() => toggleChip('programmingSkills', skill)}>
                  {form.programmingSkills.includes(skill) && <span style={{ marginRight: 6 }}>✓</span>}
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Technologies Known</label>
            <div className="chip-group">
              {TECHNOLOGIES.map((tech) => (
                <div key={tech} className={`chip ${form.technologies.includes(tech) ? 'selected' : ''}`} onClick={() => toggleChip('technologies', tech)}>
                  {form.technologies.includes(tech) && <span style={{ marginRight: 6 }}>✓</span>}
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 4 */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)' }}>
            <span className="section-icon">🎯</span>
            <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Career Direction</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Career Goal</label>
            <input className="form-input" type="text" placeholder="e.g., ML Engineer, Full-Stack Dev, Data Scientist..." value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Areas of Interest *</label>
            <div className="chip-group">
              {INTERESTS.map((interest) => (
                <div key={interest} className={`chip ${form.interests.includes(interest) ? 'selected' : ''}`} onClick={() => toggleChip('interests', interest)}>
                  {form.interests.includes(interest) && <span style={{ marginRight: 6 }}>✓</span>}
                  {interest}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
          <button type="submit" className="btn btn-primary btn-lg" style={{ padding: '16px 48px', fontSize: '1.1rem', width: '100%', maxWidth: 400 }}>
            🚀 Generate My Project Ideas
          </button>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
            Powered by ProjectPilot AI
          </div>
        </div>
      </form>
    </div>
  );
}
