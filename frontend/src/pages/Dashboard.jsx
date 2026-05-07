import { DollarSign, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

const cashFlow = [
  { month: 'Jan', income: 4000, expense: 1200 },
  { month: 'Feb', income: 4000, expense: 1800 },
  { month: 'Mar', income: 4200, expense: 1500 },
  { month: 'Apr', income: 4200, expense: 2100 },
  { month: 'May', income: 4200, expense: 1850 },
];

const recentTx = [
  { id: 1, desc: 'Spotify Premium',   cat: 'Entertainment', date: 'May 04', amount: -9.99,   type: 'expense' },
  { id: 2, desc: 'Salary Deposit',    cat: 'Income',        date: 'May 01', amount: +4200,   type: 'income'  },
  { id: 3, desc: 'Grocery Run',       cat: 'Food',          date: 'Apr 30', amount: -87.50,  type: 'expense' },
  { id: 4, desc: 'AWS Bill',          cat: 'Utilities',     date: 'Apr 29', amount: -43.12,  type: 'expense' },
  { id: 5, desc: 'Freelance Payment', cat: 'Income',        date: 'Apr 28', amount: +650,    type: 'income'  },
];

const budgets = [
  { cat: 'Groceries',     spent: 320, limit: 500,  color: 'var(--blue)' },
  { cat: 'Entertainment', spent: 180, limit: 200,  color: 'var(--red)' },
  { cat: 'Transport',     spent: 50,  limit: 150,  color: 'var(--green)' },
  { cat: 'Utilities',     spent: 110, limit: 150,  color: 'var(--amber)' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: '0.4rem' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: ${p.value.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-sub">Welcome back — here's how your finances look today.</p>
        </div>
        <button className="btn-primary">+ Add Expense</button>
      </div>

      {/* Stat Cards */}
      <div className="grid-4">
        {[
          { label: 'Total Balance', value: '$12,450.00', change: '+8.2% vs last month', up: true,  icon: DollarSign, color: 'var(--blue)',  bg: 'rgba(59,130,246,0.18)'  },
          { label: 'Monthly Income', value: '$4,200.00',  change: '+0% vs last month',   up: true,  icon: TrendingUp,  color: 'var(--green)', bg: 'rgba(16,185,129,0.18)'  },
          { label: 'Monthly Expenses', value: '$1,850.00', change: '-11.9% vs last month', up: false, icon: TrendingDown, color: 'var(--red)',   bg: 'rgba(239,68,68,0.18)'   },
          { label: 'Budget Used',  value: '44%',        change: 'of total limits',       up: true,  icon: Target,     color: 'var(--amber)', bg: 'rgba(245,158,11,0.18)'  },
        ].map(({ label, value, change, up, icon: Icon, color, bg }) => (
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
          <h2 className="section-title">Cash Flow</h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlow} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
                <XAxis dataKey="month" stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"  name="Income"  stroke="#10b981" strokeWidth={2} fill="url(#gi)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#ge)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Budget snapshot */}
        <GlassCard>
          <h2 className="section-title">Budget Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {budgets.map(({ cat, spent, limit, color }) => {
              const pct = Math.min(100, (spent / limit) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500 }}>{cat}</span>
                    <span style={{ color: 'var(--text-2)' }}>${spent} / ${limit}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>{pct.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Recent Transactions */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Transactions</h2>
          <a href="/transactions" style={{ fontSize: '0.82rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>View all →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 500 }}>{tx.desc}</td>
                  <td><span className={`badge ${tx.type === 'income' ? 'badge-green' : 'badge-blue'}`}>{tx.cat}</span></td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{tx.date}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
