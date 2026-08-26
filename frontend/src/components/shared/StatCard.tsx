import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  accent?: string;
  children?: ReactNode;
  dark?: boolean;
}

export default function StatCard({ label, value, icon: Icon, accent = 'text-ink-navy', children, dark = false }: StatCardProps) {
  return (
    <div className={`card p-5 ${dark ? 'navy-blueprint text-white border-ink-navy' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`font-mono text-xs uppercase tracking-wider ${dark ? 'text-white/60' : 'text-stamp-gray'}`}>{label}</span>
        {Icon && <Icon className={`w-5 h-5 ${dark ? 'text-white/40' : accent + '/60'}`} strokeWidth={1.5} />}
      </div>
      <div className={`font-display text-3xl font-bold ${dark ? 'text-white' : accent}`}>{value}</div>
      {children && <div className={`mt-2 ${dark ? 'text-white/60' : 'text-slate'}`}>{children}</div>}
    </div>
  );
}
