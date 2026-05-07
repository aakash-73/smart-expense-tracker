import { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import { Plus, X, AlertTriangle } from 'lucide-react';

const INIT = [
  { id: 1, cat: 'Groceries',     limit: 500, spent: 320, color: 'var(--blue)',   icon: '🛒' },
  { id: 2, cat: 'Entertainment', limit: 200, spent: 180, color: 'var(--red)',    icon: '🎬' },
  { id: 3, cat: 'Transport',     limit: 150, spent: 50,  color: 'var(--green)',  icon: '🚌' },
  { id: 4, cat: 'Health',        limit: 200, spent: 45,  color: 'var(--violet)', icon: '💊' },
  { id: 5, cat: 'Utilities',     limit: 150, spent: 110, color: 'var(--amber)',  icon: '💡' },
];

export default function Budgets() {
  const [budgets, setBudgets] = useState(INIT);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ cat: '', limit: '', icon: '📦' });

  const total       = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent  = budgets.reduce((a, b) => a + b.spent, 0);
  const overBudget  = budgets.filter(b => b.spent >= b.limit);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.cat || !form.limit) return;
    const colors = ['var(--blue)', 'var(--violet)', 'var(--green)', 'var(--amber)', 'var(--red)'];
    setBudgets(prev => [...prev, {
      id: Date.now(),
      cat: form.cat,
      limit: parseFloat(form.limit),
      spent: 0,
      color: colors[prev.length % colors.length],
      icon: form.icon,
    }]);
    setShowModal(false);
    setForm({ cat: '', limit: '', icon: '📦' });
  };

  const handleDelete = (id) => setBudgets(prev => prev.filter(b => b.id !== id));

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-sub">Track your spending limits by category.</p>
        </div>
        <button id="add-budget-btn" className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
          Set Budget
        </button>
      </div>

      {/* Summary row */}
      <div className="grid-4">
        {[
          { label: 'Total Budget',   value: `$${total.toLocaleString()}`,      color: 'var(--blue)'   },
          { label: 'Total Spent',    value: `$${totalSpent.toLocaleString()}`,  color: 'var(--red)'    },
          { label: 'Remaining',      value: `$${(total - totalSpent).toLocaleString()}`, color: 'var(--green)' },
          { label: 'Over Budget',    value: `${overBudget.length} categories`,  color: overBudget.length > 0 ? 'var(--red)' : 'var(--green)' },
        ].map(({ label, value, color }) => (
          <GlassCard key={label}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Overall progress */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Overall Spending</h2>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>${totalSpent} / ${total}</span>
        </div>
        <div className="progress-track" style={{ height: 12 }}>
          <div className="progress-fill" style={{
            width: `${Math.min(100, (totalSpent / total) * 100)}%`,
            background: totalSpent / total > 0.8 ? 'var(--red)' : 'var(--gradient)',
          }} />
        </div>
        <p style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>
          {((totalSpent / total) * 100).toFixed(1)}% used
        </p>
      </GlassCard>

      {/* Budget cards */}
      <div className="grid-2">
        {budgets.map(b => {
          const pct = Math.min(100, (b.spent / b.limit) * 100);
          const critical = pct >= 90;
          return (
            <GlassCard key={b.id} style={{ position: 'relative' }}>
              {/* Delete */}
              <button className="btn-icon" onClick={() => handleDelete(b.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', width: 30, height: 30, border: 'none', background: 'transparent', color: 'var(--text-3)' }}>
                <X size={15} />
              </button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.6rem' }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.cat}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Monthly budget</div>
                </div>
                {critical && (
                  <span className="badge badge-red" style={{ marginLeft: 'auto', marginRight: '2rem' }}>
                    <AlertTriangle size={11} style={{ marginRight: '0.3rem', display: 'inline' }} />
                    Near limit
                  </span>
                )}
              </div>

              {/* Amounts */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-2)' }}>Spent</span>
                <span style={{ fontWeight: 700, color: critical ? 'var(--red)' : b.color }}>${b.spent}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: b.color }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                <span>${b.limit - b.spent} remaining</span>
                <span>{pct.toFixed(0)}% used</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>New Budget</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Category Name</label>
                <input id="budget-cat" placeholder="e.g. Dining Out" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Monthly Limit ($)</label>
                  <input id="budget-limit" type="number" min="1" step="0.01" placeholder="300" value={form.limit} onChange={e => setForm(p => ({ ...p, limit: e.target.value }))} required />
                </div>
                <div>
                  <label>Icon (emoji)</label>
                  <input id="budget-icon" placeholder="🍕" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} maxLength={2} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="budget-submit" type="submit" className="btn-primary" style={{ flex: 2 }}>Create Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
