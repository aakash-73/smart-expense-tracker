import { useState, useEffect, useContext } from 'react';
import GlassCard from '../components/common/GlassCard';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getBudgets, createBudget, deleteBudget } from '../services/budgetService';
import { getTransactions } from '../services/transactionService';

const COLORS = ['var(--blue)', 'var(--violet)', 'var(--green)', 'var(--amber)', 'var(--red)'];

/** Sum of expense transactions in the current calendar month for a given category */
const computeSpent = (category, transactions) => {
  const now = new Date();
  return transactions
    .filter((tx) =>
      tx.type === 'EXPENSE' &&
      tx.category === category &&
      new Date(tx.timestamp).getMonth()    === now.getMonth() &&
      new Date(tx.timestamp).getFullYear() === now.getFullYear()
    )
    .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
};

export default function Budgets() {
  const { user }  = useContext(AuthContext);
  const userId    = user?.userId;

  const [budgets, setBudgets]       = useState([]);
  const [transactions, setTxs]      = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ cat: '', limit: '', icon: '📦' });

  const load = () => {
    if (!userId) return;
    setLoading(true);
    Promise.all([getBudgets(userId), getTransactions(userId)])
      .then(([b, t]) => { setBudgets(b); setTxs(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [userId]);

  // Enrich budgets with computed spent
  const enriched = budgets.map((b, i) => ({
    ...b,
    spent: computeSpent(b.category, transactions),
    color: COLORS[i % COLORS.length],
  }));

  const total      = enriched.reduce((a, b) => a + b.monthlyLimit, 0);
  const totalSpent = enriched.reduce((a, b) => a + b.spent,        0);
  const overBudget = enriched.filter((b) => b.spent >= b.monthlyLimit);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.cat || !form.limit || !userId) return;
    setSubmitting(true);
    try {
      const saved = await createBudget({
        userId,
        category:     form.cat,
        monthlyLimit: parseFloat(form.limit),
        icon:         form.icon || '📦',
      });
      setBudgets((prev) => [...prev, saved]);
      setShowModal(false);
      setForm({ cat: '', limit: '', icon: '📦' });
    } catch {
      alert('Failed to create budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('Failed to delete budget.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>
        Loading budgets…
      </div>
    );
  }

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

      {/* Empty state */}
      {enriched.length === 0 && (
        <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</p>
          <p style={{ color: 'var(--text-2)', marginBottom: '1rem' }}>No budgets yet — set a spending limit to get started.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Set your first budget</button>
        </GlassCard>
      )}

      {/* Summary row */}
      {enriched.length > 0 && (
        <>
          <div className="grid-4">
            {[
              { label: 'Total Budget',  value: `$${total.toLocaleString()}`,                           color: 'var(--blue)'   },
              { label: 'Total Spent',   value: `$${totalSpent.toFixed(2)}`,                             color: 'var(--red)'    },
              { label: 'Remaining',     value: `$${(total - totalSpent).toFixed(2)}`,                   color: 'var(--green)'  },
              { label: 'Over Budget',   value: `${overBudget.length} categories`,                       color: overBudget.length > 0 ? 'var(--red)' : 'var(--green)' },
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
              <span style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>${totalSpent.toFixed(2)} / ${total}</span>
            </div>
            <div className="progress-track" style={{ height: 12 }}>
              <div className="progress-fill" style={{
                width: `${Math.min(100, total > 0 ? (totalSpent / total) * 100 : 0)}%`,
                background: total > 0 && totalSpent / total > 0.8 ? 'var(--red)' : 'var(--gradient)',
              }} />
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>
              {total > 0 ? ((totalSpent / total) * 100).toFixed(1) : 0}% used
            </p>
          </GlassCard>

          {/* Budget cards */}
          <div className="grid-2">
            {enriched.map((b) => {
              const pct      = Math.min(100, b.monthlyLimit > 0 ? (b.spent / b.monthlyLimit) * 100 : 0);
              const critical = pct >= 90;
              return (
                <GlassCard key={b.id} style={{ position: 'relative' }}>
                  <button className="btn-icon" onClick={() => handleDelete(b.id)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', width: 30, height: 30, border: 'none', background: 'transparent', color: 'var(--text-3)' }}>
                    <X size={15} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{b.icon || '📦'}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.category}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Monthly budget</div>
                    </div>
                    {critical && (
                      <span className="badge badge-red" style={{ marginLeft: 'auto', marginRight: '2rem' }}>
                        <AlertTriangle size={11} style={{ marginRight: '0.3rem', display: 'inline' }} />
                        Near limit
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-2)' }}>Spent</span>
                    <span style={{ fontWeight: 700, color: critical ? 'var(--red)' : b.color }}>${b.spent.toFixed(2)}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: b.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                    <span>${(b.monthlyLimit - b.spent).toFixed(2)} remaining</span>
                    <span>{pct.toFixed(0)}% used · limit ${b.monthlyLimit}</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>New Budget</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Category Name</label>
                <input id="budget-cat" placeholder="e.g. Dining Out" value={form.cat}
                  onChange={(e) => setForm((p) => ({ ...p, cat: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Monthly Limit ($)</label>
                  <input id="budget-limit" type="number" min="1" step="0.01" placeholder="300" value={form.limit}
                    onChange={(e) => setForm((p) => ({ ...p, limit: e.target.value }))} required />
                </div>
                <div>
                  <label>Icon (emoji)</label>
                  <input id="budget-icon" placeholder="🍕" value={form.icon}
                    onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} maxLength={2} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="budget-submit" type="submit" className="btn-primary" style={{ flex: 2 }} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
