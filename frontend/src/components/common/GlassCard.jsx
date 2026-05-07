export default function GlassCard({ children, style, className = '' }) {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {children}
    </div>
  );
}
