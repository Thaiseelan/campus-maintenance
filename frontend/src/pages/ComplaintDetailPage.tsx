import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getComplaint, getComplaintHistory, closeComplaint } from '@/lib/api';
import type { Complaint, ComplaintHistoryEntry } from '@/lib/types';
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, timeAgo } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import StatusStamp from '@/components/ui/StatusStamp';
import StatusTimeline from '@/components/shared/StatusTimeline';
import CategoryIcon from '@/components/shared/CategoryIcon';
import ImagePreview from '@/components/shared/ImagePreview';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, MapPin, Calendar, User, Flag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [c, h] = await Promise.all([getComplaint(id), getComplaintHistory(id)]);
        setComplaint(c);
        setHistory(h);
      } catch (err) {
        toastError('Could not load complaint', err instanceof Error ? err.message : undefined);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toastError]);

  async function handleClose() {
    if (!id) return;
    setClosing(true);
    try {
      await closeComplaint(id);
      const [c, h] = await Promise.all([getComplaint(id), getComplaintHistory(id)]);
      setComplaint(c);
      setHistory(h);
      success('Complaint closed', 'Thank you for confirming the resolution.');
    } catch (err) {
      toastError('Could not close complaint', err instanceof Error ? err.message : undefined);
    } finally {
      setClosing(false);
    }
  }

  const canClose = user && complaint && complaint.reporter_id === user.id && complaint.status === 'RESOLVED';

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="card p-10 text-center">
          <AlertCircle className="w-10 h-10 text-rust mx-auto mb-3" />
          <h2 className="font-display font-semibold text-lg text-ink-navy">Complaint not found</h2>
          <p className="text-sm text-slate mt-1">This request may have been removed.</p>
          <Link to="/dashboard" className="inline-block mt-4">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink-navy transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <PageHeader
        monoLabel={complaint.code}
        title={complaint.title}
        subtitle={`Filed ${timeAgo(complaint.created_at)}`}
        dark
        actions={<StatusStamp status={complaint.status} animate />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: details */}
        <div className="md:col-span-2 space-y-4">
          {/* Meta row */}
          <div className="card p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Category</p>
                <CategoryIcon category={complaint.category} size="sm" showLabel />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Priority</p>
                <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-semibold ${PRIORITY_COLORS[complaint.priority].bg} ${PRIORITY_COLORS[complaint.priority].text}`}>
                  {PRIORITY_LABELS[complaint.priority]}
                </span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Location</p>
                <div className="inline-flex items-center gap-1.5 text-sm text-ink-navy">
                  <MapPin className="w-4 h-4 text-slate" />
                  {complaint.location_label}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Filed on</p>
                <div className="inline-flex items-center gap-1.5 text-sm text-ink-navy">
                  <Calendar className="w-4 h-4 text-slate" />
                  {formatDateTime(complaint.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-2">Description</p>
            <p className="text-sm text-ink-navy leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Photo */}
          {complaint.photo_url && (
            <div className="card p-5">
              <ImagePreview src={complaint.photo_url} alt="Reported issue" label="Attached photo" />
            </div>
          )}

          {/* Resolution photo */}
          {complaint.resolution_photo_url && (
            <div className="card p-5">
              <ImagePreview src={complaint.resolution_photo_url} alt="Resolution" label="Resolution photo" />
            </div>
          )}

          {/* Remarks */}
          {complaint.remarks && (
            <div className="card p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-2">Technician remarks</p>
              <p className="text-sm text-ink-navy leading-relaxed italic">{complaint.remarks}</p>
            </div>
          )}

          {/* Close action */}
          {canClose && (
            <div className="card p-5 bg-moss/5 border-moss/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-moss shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-display font-semibold text-ink-navy text-sm">This issue has been marked as resolved.</p>
                  <p className="text-xs text-slate mt-0.5">If the problem is fixed, please confirm by closing this request.</p>
                </div>
                <Button variant="secondary" size="sm" loading={closing} onClick={handleClose}>
                  Confirm & close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: timeline */}
        <div className="md:col-span-1">
          <div className="card p-5 sticky top-4">
            <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-4">Status timeline</p>
            <StatusTimeline currentStatus={complaint.status} history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
