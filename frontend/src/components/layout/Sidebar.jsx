import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Target, LogOut, Zap } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const links = [
  { name: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budgets',      path: '/budgets',      icon: Target },
  { name: 'Analytics',    path: '/analytics',    icon: PieChart },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logoutContext } = useContext(AuthContext);

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      height: '100vh',
      background: 'rgba(8,12,20,0.85)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem 2.5rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'var(--gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-b)',
        }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>SmartTracker</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem' }}>Menu</p>
        {links.map(({ name, path, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.7rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                color: active ? 'white' : 'var(--text-2)',
                background: active ? 'var(--gradient)' : 'transparent',
                boxShadow: active ? 'var(--shadow-glow-b)' : 'none',
                fontWeight: active ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
              >
                <Icon size={18} />
                {name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logoutContext}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.7rem 0.75rem', background: 'transparent',
          color: 'var(--text-2)', textAlign: 'left', width: '100%',
          borderRadius: 'var(--radius-sm)', fontSize: '0.9rem',
          border: '1px solid transparent',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'transparent'; }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
