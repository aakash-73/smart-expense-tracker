import { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import { Plus, X, Search, Filter } from 'lucide-react';

const SAMPLE = [
  { id: 1,  desc: 'Spotify Premium',    cat: 'Entertainment', date: '2026-05-04', amount: -9.99,   type: 'expense' },
  { id: 2,  desc: 'Salary Deposit',     cat: 'Income',        date: '2026-05-01', amount: +4200,   type: 'income'  },
  { id: 3,  desc: 'Grocery Run',        cat: 'Food',          date: '2026-04-30', amount: -87.50,  type: 'expense' },
  { id: 4,  desc: 'AWS Bill',           cat: 'Utilities',     date: '2026-04-29', amount: -43.12,  type: 'expense' },
  { id: 5,  desc: 'Freelance Payment',  cat: 'Income',        date: '2026-04-28', amount: +650,    type: 'income'  },
  { id: 6,  desc: 'Gym Membership',     cat: 'Health',        date: '2026-04-27', amount: -45,     type: 'expense' },
  { id: 7,  desc: 'Uber Ride',          cat: 'Transport',     date: '2026-04-26', amount: -12.40,  type: 'expense' },
  { id: 8,  desc: 'Dividends Received', cat: 'Income',        date: '2026-04-25', amount: +120,    type: 'income'  },
];

const CAT_BADGE = {
  Entertainment: 'badge-violet',
  Income:        'badge-green',
  Food:          'badge-amber',
  Utilities:     'badge-blue',
  Health:        'badge-green',
  Transport:     'badge-blue',
};

const CATEGORIES = ['Food', 'Entertainment', 'Transport', 'Health', 'Utilities', 'Income', 'Other'];

export default function Transactions() {
  const [transactions, setTransactions] = useState(SAMPLE);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ desc: '', cat: 'Food', date: new Date().toISOString().split('T')[0], amount: '', type: 'expense' });

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.desc.toLowerCase().includes(search.toLowerCase()) || tx.cat.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || tx.type === filter;
    return matchSearch && matchFilter;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt) return;
    const newTx = {
      id: Date.now(),
      desc: form.desc,
      cat: form.cat,
      date: form.date,
      amount: form.type === 'expense' ? -Math.abs(amt) : Math.abs(amt),
      type: form.type,
    };
    setTransactions(prev => [newTx, ...prev]);
    setShowModal(false);
    setForm({ desc: '', cat: 'Food', date: new Date().toISOString().split('T')[0], amount: '', type: 'expense' });
  };

  const handleDelete = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-sub">{filtered.length} records</p>
        </div>
        <button id="add-transaction-btn" className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '380px' }}>
          <Search size={15} color="var(--text-3)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'income', 'expense'].map(f => (
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
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>No transactions found</td></tr>
              )}
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td style={{ paddingLeft: '1.5rem', fontWeight: 500 }}>{tx.desc}</td>
                  <td><span className={`badge ${CAT_BADGE[tx.cat] || 'badge-blue'}`}>{tx.cat}</span></td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{tx.date}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>New Transaction</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Description</label>
                <input id="tx-desc" placeholder="e.g. Coffee at Starbucks" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Type</label>
                  <select id="tx-type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label>Category</label>
                  <select id="tx-cat" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Amount ($)</label>
                  <input id="tx-amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div>
                  <label>Date</label>
                  <input id="tx-date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="tx-submit" type="submit" className="btn-primary" style={{ flex: 2 }}>Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
