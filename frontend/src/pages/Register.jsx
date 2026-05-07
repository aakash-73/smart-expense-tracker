import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle } from 'lucide-react';
import { register } from '../services/service';
import { AuthContext } from '../context/AuthContext';

const requirements = [
  { label: 'At least 8 characters',    test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter',      test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One number',               test: (pw) => /\d/.test(pw) },
];

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const { loginContext }            = useContext(AuthContext);
  const navigate                    = useNavigate();

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const token = await register(form.username, form.password, form.email);
      // If the backend returns a token on register, log them in directly
      if (token) {
        loginContext(token);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Registration failed. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--bg)',
      backgroundImage: `
        radial-gradient(ellipse 60% 50% at 10% 60%, rgba(59,130,246,0.14), transparent),
        radial-gradient(ellipse 50% 40% at 90% 20%, rgba(139,92,246,0.14), transparent)
      `,
    }}>
      <div className="animate-slide" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{
          background: 'rgba(13,18,32,0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '12px',
              background: 'var(--gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-glow-b)',
            }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>SmartTracker</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Expense Intelligence</div>
            </div>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            Create an account
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Start tracking your expenses for free
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              color: 'var(--red)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Username */}
            <div>
              <label htmlFor="reg-username">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-3)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="reg-username"
                  type="text"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={set('username')}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-3)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={set('email')}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-3)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-3)', padding: 0, width: 'auto' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {form.password.length > 0 && (
                <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {requirements.map(({ label, test }) => {
                    const met = test(form.password);
                    return (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: met ? 'var(--green)' : 'var(--text-3)' }}>
                        <CheckCircle size={13} style={{ flexShrink: 0 }} />
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm">Confirm password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-3)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  style={{
                    paddingLeft: '2.5rem', paddingRight: '2.75rem',
                    borderColor: form.confirm && form.confirm !== form.password ? 'var(--red)' : undefined,
                  }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-3)', padding: 0, width: 'auto' }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: '0.76rem', color: 'var(--red)', marginTop: '0.35rem' }}>Passwords do not match</p>
              )}
            </div>

            <button
              id="reg-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Divider + Google */}
          <div style={{ marginTop: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>or sign up with</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <a
              href="http://localhost:8081/oauth2/authorization/google"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '0.65rem 1.25rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-1)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Google
            </a>
          </div>

          {/* Switch to login */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
