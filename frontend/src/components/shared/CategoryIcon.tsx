import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants';
import type { Category } from '@/lib/types';
import { HelpCircle } from 'lucide-react';

interface CategoryIconProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { box: 'w-7 h-7', icon: 'w-3.5 h-3.5', text: 'text-xs' },
  md: { box: 'w-9 h-9', icon: 'w-4.5 h-4.5', text: 'text-sm' },
  lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' },
};

export default function CategoryIcon({ category, size = 'md', showLabel = false, className = '' }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category] || HelpCircle;
  const s = sizeClasses[size];
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`${s.box} rounded-md bg-ink-navy/8 border border-ink-navy/10 flex items-center justify-center shrink-0`}>
        <Icon className={`${s.icon} text-ink-navy`} strokeWidth={2} />
      </div>
      {showLabel && <span className={`font-medium text-ink-navy ${s.text}`}>{CATEGORY_LABELS[category] || category}</span>}
    </div>
  );
}
