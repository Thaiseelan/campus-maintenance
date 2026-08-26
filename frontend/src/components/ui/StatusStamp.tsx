import type { ComplaintStatus } from '@/lib/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';

interface StatusStampProps {
  status: ComplaintStatus;
  animate?: boolean;
  className?: string;
}

export default function StatusStamp({ status, animate = false, className = '' }: StatusStampProps) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={`status-stamp ${colors.text} ${animate ? 'animate-stamp-down' : ''} ${className}`}
      style={{ textShadow: '0.5px 0.5px 0 rgba(0,0,0,0.05)' }}
    >
      {STATUS_LABELS[status].replace(' ', '_')}
    </span>
  );
}
