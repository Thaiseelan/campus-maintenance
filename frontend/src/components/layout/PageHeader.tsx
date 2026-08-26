import { type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getGreeting } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  monoLabel?: string;
  actions?: ReactNode;
  dark?: boolean;
}

export default function PageHeader({ title, subtitle, monoLabel, actions, dark = false }: PageHeaderProps) {
  const { user } = useAuth();
  const greeting = user ? `${getGreeting()}, ${user.name.split(' ')[0]}` : '';
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className={`rounded-lg p-6 mb-6 ${dark ? 'navy-blueprint text-white' : 'card'}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          {monoLabel && (
            <p className={`font-mono text-xs uppercase tracking-wider mb-2 ${dark ? 'text-signal-amber' : 'text-stamp-gray'}`}>
              {monoLabel}
            </p>
          )}
          <h1 className={`font-display text-2xl md:text-3xl font-bold ${dark ? 'text-white' : 'text-ink-navy'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-1 text-sm ${dark ? 'text-white/60' : 'text-slate'}`}>{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {user && (
        <div className={`mt-3 pt-3 border-t ${dark ? 'border-white/10' : 'border-slate/10'} flex items-center justify-between text-xs`}>
          <span className={dark ? 'text-white/50' : 'text-stamp-gray'}>{greeting} · {ROLE_LABELS[user.role]}</span>
          <span className={`font-mono ${dark ? 'text-white/40' : 'text-stamp-gray'}`}>{today}</span>
        </div>
      )}
    </div>
  );
}
