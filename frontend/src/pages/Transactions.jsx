import { useState, useEffect, useContext } from 'react';
import GlassCard from '../components/common/GlassCard';
import { Plus, X, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '../services/transactionService';

const CAT_BADGE = {
  Entertainment: 'badge-violet',
  Income:        'badge-green',
  Food:          'badge-amber',
  Utilities:     'badge-blue',
  Health:        'badge-green',
  Transport:     'badge-blue',
  Housing:       'badge-blue',
  Other:         'badge-blue',
};

const CATEGORIES = ['Food', 'Entertainment', 'Transport', 'Health', 'Utilities', 'Housing', 'Income', 'Other'];

const fmtDate = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const fmtAmt = (amount, type) => {
  const abs = Math.abs(amount ?? 0);
  const formatted = abs.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return (type === 'INCOME' ? '+' : '-') + formatted;
};

export default function Transactions() {
  const { user }  = useContext(AuthContext);
  const userId    = user?.userId;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [showModal, setShowModal]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm] = useState({
    desc: '', cat: 'Food',
    date: new Date().toISOString().split('T')[0],
    amount: '', type: 'expense',
  });

  const load = () => {
    if (!userId) return;
    setLoading(true);
    getTransactions(userId)
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [userId]);

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      (tx.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.category    ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' || tx.type?.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || !userId) return;
    setSubmitting(true);
    try {
      const newTx = {
        userId,
        type:        form.type.toUpperCase(),
        category:    form.cat,
        amount:      Math.abs(amt),
        description: form.desc,
        timestamp:   new Date(form.date + 'T12:00:00Z').toISOString(),
      };
      const saved = await createTransaction(newTx);
      setTransactions((prev) => [saved, ...prev]);
      setShowModal(false);
      setForm({ desc: '', cat: 'Food', date: new Date().toISOString().split('T')[0], amount: '', type: 'expense' });
    } catch {
      alert('Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Failed to delete transaction.');
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-sub">{loading ? 'Loading…' : `${filtered.length} records`}</p>
        </div>
        <button id="add-transaction-btn" className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
          Add Transaction
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', color: 'var(--red)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '380px' }}>
          <Search size={15} color="var(--text-3)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'income', 'expense'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f ? 'btn-primary' : 'btn-ghost'}
              style={{ textTransform: 'capitalize', padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center', paddingRight: '1.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>Loading transactions…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                  {transactions.length === 0 ? 'No transactions yet — add your first one!' : 'No transactions match your filter.'}
                </td></tr>
              )}
              {!loading && filtered.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ paddingLeft: '1.5rem', fontWeight: 500 }}>{tx.description || '—'}</td>
                  <td><span className={`badge ${CAT_BADGE[tx.category] || 'badge-blue'}`}>{tx.category}</span></td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{fmtDate(tx.timestamp)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                    {fmtAmt(tx.amount, tx.type)}
                  </td>
                  <td style={{ textAlign: 'center', paddingRight: '1.5rem' }}>
                    <button className="btn-danger" onClick={() => handleDelete(tx.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>New Transaction</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Description</label>
                <input id="tx-desc" placeholder="e.g. Coffee at Starbucks" value={form.desc}
                  onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Type</label>
                  <select id="tx-type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label>Category</label>
                  <select id="tx-cat" value={form.cat} onChange={(e) => setForm((p) => ({ ...p, cat: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Amount ($)</label>
                  <input id="tx-amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div>
                  <label>Date</label>
                  <input id="tx-date" type="date" value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="tx-submit" type="submit" className="btn-primary" style={{ flex: 2 }} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
