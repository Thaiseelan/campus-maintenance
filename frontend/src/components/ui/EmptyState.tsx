import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate/25 flex items-center justify-center bg-paper">
          <Icon className="w-10 h-10 text-slate/40" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded bg-paper border border-slate/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate/30" />
        </div>
      </div>
      <h3 className="font-display font-semibold text-lg text-ink-navy mb-1">{title}</h3>
      <p className="text-sm text-slate max-w-xs mb-6">{message}</p>
      {action}
    </div>
  );
}
