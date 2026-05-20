import { useState, useEffect, useContext } from 'react';
import GlassCard from '../components/common/GlassCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { getSummary, getMonthly, getCategories } from '../services/analyticsService';

const PIE_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b',
  '#ec4899','#06b6d4','#ef4444','#6b7280',
];

const fmt$ = (v) => `$${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {fmt$(p.value)}</p>
      ))}
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return percent > 0.07 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  ) : null;
};

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const userId   = user?.userId;

  const [summary,    setSummary]    = useState(null);
  const [monthly,    setMonthly]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([getSummary(userId), getMonthly(userId), getCategories(userId)])
      .then(([s, m, c]) => { setSummary(s); setMonthly(m); setCategories(c); })
      .catch(() => setError('Could not load analytics. Make sure the analytics service is running.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>Loading analytics…</div>;
  }

  if (error) {
    return (
      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', color: 'var(--red)', fontSize: '0.85rem' }}>
        {error}
      </div>
    );
  }

  const noData = !summary || (monthly.every((m) => m.income === 0 && m.expense === 0) && categories.length === 0);

  const insights = summary ? [
    { label: 'Avg Monthly Income',    value: fmt$(monthly.length > 0 ? monthly.reduce((s, m) => s + m.income, 0) / monthly.length : 0), sub: 'Last 6 months',        up: true  },
    { label: 'Biggest Expense Cat',   value: summary.biggestExpenseCategory ?? 'N/A',  sub: fmt$(summary.biggestExpenseAmount) + ' total',      up: null  },
    { label: 'Saving Rate',           value: `${summary.savingRate ?? 0}%`,             sub: 'Of this month\'s income',  up: (summary.savingRate ?? 0) > 0 },
    { label: 'This Month Net',        value: fmt$(summary.netSavings),                  sub: summary.netSavings >= 0 ? 'Positive cashflow!' : 'Spending over income', up: (summary.netSavings ?? 0) >= 0 },
  ] : [];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Insights from your spending patterns.</p>
        </div>
      </div>

      {noData && (
        <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📈</p>
          <p style={{ color: 'var(--text-2)' }}>No transaction data yet — add some transactions to see your analytics.</p>
        </GlassCard>
      )}

      {!noData && (
        <>
          {/* Insights row */}
          <div className="grid-4">
            {insights.map(({ label, value, sub, up }) => (
              <GlassCard key={label} className="clickable">
                <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: up === true ? 'var(--green)' : up === false ? 'var(--red)' : 'var(--text-1)', marginBottom: '0.2rem' }}>{value}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{sub}</p>
              </GlassCard>
            ))}
          </div>

          {/* Cash Flow Trend */}
          <GlassCard>
            <h2 className="section-title">Income vs Expenses vs Savings</h2>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <defs>
                    {[['income','#10b981'],['expense','#ef4444'],['savings','#3b82f6']].map(([key, col]) => (
                      <linearGradient key={key} id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={col} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={col} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income"  name="Income"  stroke="#10b981" strokeWidth={2} fill="url(#g-income)"  />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#g-expense)" />
                  <Area type="monotone" dataKey="savings" name="Savings" stroke="#3b82f6" strokeWidth={2} fill="url(#g-savings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Pie + Bar */}
          <div className="grid-2">
            {/* Donut */}
            <GlassCard>
              <h2 className="section-title">Expense by Category</h2>
              {categories.length === 0 ? (
                <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '3rem 0' }}>No expenses recorded yet.</p>
              ) : (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categories} cx="50%" cy="50%"
                        innerRadius={68} outerRadius={105} paddingAngle={3}
                        dataKey="total" nameKey="category"
                        labelLine={false} label={renderCustomLabel}>
                        {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.82rem' }}
                        formatter={(v) => fmt$(v)} />
                      <Legend iconType="circle" iconSize={10}
                        formatter={(val) => <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{val}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </GlassCard>

            {/* Bar */}
            <GlassCard>
              <h2 className="section-title">Monthly Expense Breakdown</h2>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6,6,0,0]} fillOpacity={0.85} />
                    <Bar dataKey="savings" name="Savings" fill="#3b82f6" radius={[6,6,0,0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
