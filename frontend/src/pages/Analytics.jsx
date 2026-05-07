import GlassCard from '../components/common/GlassCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

const monthly = [
  { month: 'Jan', income: 4000, expense: 1200, savings: 2800 },
  { month: 'Feb', income: 4000, expense: 1800, savings: 2200 },
  { month: 'Mar', income: 4200, expense: 1500, savings: 2700 },
  { month: 'Apr', income: 4200, expense: 2100, savings: 2100 },
  { month: 'May', income: 4200, expense: 1850, savings: 2350 },
];

const pieData = [
  { name: 'Housing',       value: 1200, color: '#3b82f6' },
  { name: 'Food',          value: 400,  color: '#8b5cf6' },
  { name: 'Transport',     value: 150,  color: '#10b981' },
  { name: 'Entertainment', value: 100,  color: '#f59e0b' },
  { name: 'Health',        value: 45,   color: '#ec4899' },
  { name: 'Utilities',     value: 110,  color: '#06b6d4' },
];

const insights = [
  { label: 'Avg Monthly Savings',  value: '$2,430',  sub: 'Based on last 5 months', up: true  },
  { label: 'Biggest Expense',      value: 'Housing', sub: '$1,200 / month',          up: null  },
  { label: 'Saving Rate',          value: '57.9%',   sub: 'Of total income',         up: true  },
  { label: 'Expense vs Last Month',value: '-11.9%',  sub: 'You spent less!',         up: true  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: ${p.value.toLocaleString()}</p>
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
  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Insights from your spending patterns.</p>
        </div>
        <button className="btn-ghost">Export Report</button>
      </div>

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
              <XAxis dataKey="month" stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
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
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={68} outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.82rem' }} />
                <Legend iconType="circle" iconSize={10} formatter={(val) => <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Bar */}
        <GlassCard>
          <h2 className="section-title">Monthly Expense Breakdown</h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6,6,0,0]} fillOpacity={0.85} />
                <Bar dataKey="savings" name="Savings" fill="#3b82f6" radius={[6,6,0,0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
