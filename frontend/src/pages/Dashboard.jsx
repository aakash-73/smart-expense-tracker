import { useState, useEffect, useContext } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { getRecentTransactions } from '../services/transactionService';
import { getBudgets }            from '../services/budgetService';
import { getSummary, getMonthly } from '../services/analyticsService';
import { getTransactions }        from '../services/transactionService';

const fmt$ = (v) =>
  Number(v ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const fmtDate = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

/** Current-month expenses for a category */
const computeSpent = (category, transactions) => {
  const now = new Date();
  return transactions
    .filter((tx) =>
      tx.type === 'EXPENSE' &&
      tx.category === category &&
      new Date(tx.timestamp).getMonth()    === now.getMonth() &&
      new Date(tx.timestamp).getFullYear() === now.getFullYear()
    )
    .reduce((s, t) => s + (t.amount ?? 0), 0);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: '0.4rem' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {fmt$(p.value)}</p>
      ))}
    </div>
  );
};

const CAT_BADGE = {
  Entertainment: 'badge-violet', Income: 'badge-green', Food: 'badge-amber',
  Utilities: 'badge-blue', Health: 'badge-green', Transport: 'badge-blue',
  Housing: 'badge-blue', Other: 'badge-blue',
};
const COLORS = ['var(--blue)', 'var(--violet)', 'var(--green)', 'var(--amber)', 'var(--red)'];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const userId   = user?.userId;

  const [summary,   setSummary]   = useState(null);
  const [monthly,   setMonthly]   = useState([]);
  const [recentTx,  setRecentTx]  = useState([]);
  const [budgets,   setBudgets]   = useState([]);
  const [allTx,     setAllTx]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      getSummary(userId),
      getMonthly(userId),
      getRecentTransactions(userId),
      getBudgets(userId),
      getTransactions(userId),
    ])
      .then(([s, m, r, b, t]) => {
        setSummary(s); setMonthly(m); setRecentTx(r); setBudgets(b); setAllTx(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const enrichedBudgets = budgets.slice(0, 4).map((b, i) => ({
    ...b,
    spent: computeSpent(b.category, allTx),
    color: COLORS[i % COLORS.length],
  }));

  const statCards = [
    {
      label: 'Net Savings (Month)', value: fmt$(summary?.netSavings),
      change: summary?.savingRate != null ? `${summary.savingRate}% saving rate` : '—',
      up: (summary?.netSavings ?? 0) >= 0,
      icon: DollarSign, color: 'var(--blue)', bg: 'rgba(59,130,246,0.18)',
    },
    {
      label: 'Monthly Income', value: fmt$(summary?.totalIncome),
      change: 'This month',
      up: true, icon: TrendingUp, color: 'var(--green)', bg: 'rgba(16,185,129,0.18)',
    },
    {
      label: 'Monthly Expenses', value: fmt$(summary?.totalExpenses),
      change: 'This month',
      up: false, icon: TrendingDown, color: 'var(--red)', bg: 'rgba(239,68,68,0.18)',
    },
    {
      label: 'Budget Used',
      value: enrichedBudgets.length > 0
        ? (() => {
            const totalLimit = enrichedBudgets.reduce((s, b) => s + b.monthlyLimit, 0);
            const totalSpent = enrichedBudgets.reduce((s, b) => s + b.spent, 0);
            return totalLimit > 0 ? `${((totalSpent / totalLimit) * 100).toFixed(0)}%` : '—';
          })()
        : '—',
      change: enrichedBudgets.length > 0 ? 'of total budget limits' : 'No budgets set',
      up: true, icon: Target, color: 'var(--amber)', bg: 'rgba(245,158,11,0.18)',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-3)', fontSize: '0.95rem' }}>
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-sub">Welcome back, {user?.username} — here's how your finances look today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4">
        {statCards.map(({ label, value, change, up, icon: Icon, color, bg }) => (
          <GlassCard key={label} className="clickable">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{value}</h3>
                <p className={`stat-change ${up ? 'up' : 'down'}`}>
                  {up ? <ArrowUpRight size={12} style={{ display:'inline' }} /> : <ArrowDownRight size={12} style={{ display:'inline' }} />}
                  {' '}{change}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Cash Flow + Budget Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Chart */}
        <GlassCard>
          <h2 className="section-title">Cash Flow (Last 6 Months)</h2>
          {monthly.every((m) => m.income === 0 && m.expense === 0) ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
              Add transactions to see your cash flow chart.
            </div>
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income"  name="Income"  stroke="#10b981" strokeWidth={2} fill="url(#gi)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#ge)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        {/* Budget snapshot */}
        <GlassCard>
          <h2 className="section-title">Budget Status</h2>
          {enrichedBudgets.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
              No budgets set yet. Visit Budgets to create one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {enrichedBudgets.map(({ category, spent, monthlyLimit, color, id }) => {
                const pct = Math.min(100, monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0);
                return (
                  <div key={id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 500 }}>{category}</span>
                      <span style={{ color: 'var(--text-2)' }}>{fmt$(spent)} / {fmt$(monthlyLimit)}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>{pct.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recent Transactions */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Transactions</h2>
          <a href="/transactions" style={{ fontSize: '0.82rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>View all →</a>
        </div>
        {recentTx.length === 0 ? (
          <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '2rem 0', fontSize: '0.88rem' }}>
            No transactions yet — <a href="/transactions" style={{ color: 'var(--blue)' }}>add your first one</a>.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th><th>Category</th><th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 500 }}>{tx.description || '—'}</td>
                    <td><span className={`badge ${CAT_BADGE[tx.category] || 'badge-blue'}`}>{tx.category}</span></td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{fmtDate(tx.timestamp)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                      {tx.type === 'INCOME' ? '+' : '-'}{fmt$(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
