import { useEffect, useState } from 'react';
import type { ComplaintStatus, ComplaintHistoryEntry } from '@/lib/types';
import { STATUS_FLOW, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';

interface StatusTimelineProps {
  currentStatus: ComplaintStatus;
  history: ComplaintHistoryEntry[];
}

export default function StatusTimeline({ currentStatus, history }: StatusTimelineProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= STATUS_FLOW.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  function getHistoryEntry(status: ComplaintStatus): ComplaintHistoryEntry | undefined {
    return history.find((h) => h.status === status);
  }

  return (
    <div className="space-y-0">
      {STATUS_FLOW.map((status, idx) => {
        const isReached = idx <= currentIndex;
        const isCurrent = status === currentStatus;
        const entry = getHistoryEntry(status);
        const isVisible = idx < visibleSteps;
        const colors = STATUS_COLORS[status];

        return (
          <div
            key={status}
            className={`flex gap-4 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            {/* Line + dot column */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 shrink-0 ${
                  isReached
                    ? `${colors.bg} ${colors.border} ${isCurrent ? 'ring-4 ring-offset-2 ring-offset-white ' + colors.bg + '/20' : ''}`
                    : 'bg-white border-slate/30'
                }`}
              />
              {idx < STATUS_FLOW.length - 1 && (
                <div
                  className={`w-0.5 h-12 transition-all duration-500 ${
                    idx < currentIndex ? colors.bg : 'bg-slate/20'
                  }`}
                  style={{ transitionDelay: '100ms' }}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-3 ${idx < STATUS_FLOW.length - 1 ? '' : ''}`}>
              <p
                className={`font-mono text-xs uppercase tracking-wider font-semibold ${
                  isReached ? colors.text : 'text-stamp-gray'
                } ${isCurrent ? 'text-sm' : ''}`}
              >
                {STATUS_LABELS[status]}
              </p>
              {entry ? (
                <div className="mt-0.5">
                  <p className="text-xs text-slate">{formatDateTime(entry.created_at)}</p>
                  {entry.changed_by_name && (
                    <p className="text-xs text-stamp-gray mt-0.5">by {entry.changed_by_name}</p>
                  )}
                  {entry.remarks && (
                    <p className="text-xs text-slate mt-1 italic max-w-xs">{entry.remarks}</p>
                  )}
                </div>
              ) : isReached ? (
                <p className="text-xs text-stamp-gray mt-0.5">Awaiting update</p>
              ) : (
                <p className="text-xs text-stamp-gray/50 mt-0.5">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
