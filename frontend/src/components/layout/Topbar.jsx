import { Bell, Search, User } from 'lucide-react';

export default function Topbar() {
  return (
    <header style={{
      height: 'var(--topbar-h)',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,12,20,0.7)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '1rem',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1', maxWidth: '360px' }}>
        <Search size={16} color="var(--text-3)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          placeholder="Search transactions, budgets…"
          style={{ paddingLeft: '2.5rem', paddingRight: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', width: '100%' }}
        />
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notification bell */}
        <button className="btn-icon" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--red)',
            border: '2px solid var(--bg)',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.2 }}>Admin User</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>admin@tracker.com</div>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-v)',
          }}>
            <User size={17} color="white" />
          </div>
        </div>
      </div>
    </header>
  );
}
