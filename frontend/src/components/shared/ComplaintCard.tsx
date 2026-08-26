import { Link } from 'react-router-dom';
import type { Complaint } from '@/lib/types';
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import StatusStamp from '@/components/ui/StatusStamp';
import CategoryIcon from './CategoryIcon';
import { MapPin, ArrowRight } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  index?: number;
  linkTo?: string;
}

export default function ComplaintCard({ complaint, index = 0, linkTo }: ComplaintCardProps) {
  const delay = Math.min(index, 7) * 40;
  const to = linkTo ?? `/complaints/${complaint.id}`;
  const priorityColors = PRIORITY_COLORS[complaint.priority];

  return (
    <Link
      to={to}
      className="card card-hover p-5 block group animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-stamp-gray tracking-wider">{complaint.code}</span>
        <StatusStamp status={complaint.status} />
      </div>

      <div className="tear-line mb-3" />

      {/* Title */}
      <h3 className="font-display font-semibold text-ink-navy text-base leading-snug mb-3 group-hover:text-signal-amber transition-colors">
        {complaint.title}
      </h3>

      {/* Category + Location */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
        <CategoryIcon category={complaint.category} size="sm" showLabel />
        <div className="inline-flex items-center gap-1.5 text-xs text-slate">
          <MapPin className="w-3.5 h-3.5" />
          <span>{complaint.location_label}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-stamp-gray">Submitted {formatDate(complaint.created_at)}</span>
          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${priorityColors.bg} ${priorityColors.text}`}>
            {PRIORITY_LABELS[complaint.priority]}
          </span>
        </div>
        <span className="text-xs font-display font-medium text-ink-navy opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
          View <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
