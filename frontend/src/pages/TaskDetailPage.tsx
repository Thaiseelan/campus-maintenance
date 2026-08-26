import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { getComplaint, getComplaintHistory, updateComplaintStatus, uploadComplaintPhoto } from '@/lib/api';
import type { Complaint, ComplaintHistoryEntry, ComplaintStatus } from '@/lib/types';
import { STATUS_FLOW, STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import { formatDateTime, timeAgo } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import StatusStamp from '@/components/ui/StatusStamp';
import StatusTimeline from '@/components/shared/StatusTimeline';
import CategoryIcon from '@/components/shared/CategoryIcon';
import ImagePreview from '@/components/shared/ImagePreview';
import ImageUpload from '@/components/shared/ImageUpload';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Play, Camera } from 'lucide-react';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error: toastError } = useToast();

  const [task, setTask] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState<File | string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [c, h] = await Promise.all([getComplaint(id), getComplaintHistory(id)]);
        setTask(c);
        setHistory(h);
      } catch (err) {
        toastError('Could not load task', err instanceof Error ? err.message : undefined);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toastError]);

  async function handleStatusUpdate(newStatus: ComplaintStatus) {
    if (!id) return;
    setUpdating(true);
    try {
      await updateComplaintStatus(id, newStatus, remarks.trim() || undefined, resolutionPhoto);
      const [c, h] = await Promise.all([getComplaint(id), getComplaintHistory(id)]);
      setTask(c);
      setHistory(h);
      setRemarks('');
      setResolutionPhoto(null);
      success('Status updated', `Task marked as ${STATUS_LABELS[newStatus].toLowerCase()}.`);
    } catch (err) {
      toastError('Update failed', err instanceof Error ? err.message : undefined);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="card p-10 text-center">
          <h2 className="font-display font-semibold text-lg text-ink-navy">Task not found</h2>
          <Link to="/dashboard" className="inline-block mt-4">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(task.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const isResolved = task.status === 'RESOLVED' || task.status === 'CLOSED';

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink-navy transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </Link>

      <PageHeader
        monoLabel={task.code}
        title={task.title}
        subtitle={`Assigned to you · Filed ${timeAgo(task.created_at)}`}
        dark
        actions={<StatusStamp status={task.status} animate />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Meta */}
          <div className="card p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Category</p>
                <CategoryIcon category={task.category} size="sm" showLabel />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Priority</p>
                <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-semibold ${PRIORITY_COLORS[task.priority].bg} ${PRIORITY_COLORS[task.priority].text}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Location</p>
                <div className="inline-flex items-center gap-1.5 text-sm text-ink-navy">
                  <MapPin className="w-4 h-4 text-slate" /> {task.location_label}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-1">Filed on</p>
                <div className="inline-flex items-center gap-1.5 text-sm text-ink-navy">
                  <Calendar className="w-4 h-4 text-slate" /> {formatDateTime(task.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-2">Description</p>
            <p className="text-sm text-ink-navy leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Photo */}
          {task.photo_url && (
            <div className="card p-5">
              <ImagePreview src={task.photo_url} alt="Reported issue" label="Reported photo" />
            </div>
          )}

          {/* Resolution photo (existing) */}
          {task.resolution_photo_url && (
            <div className="card p-5">
              <ImagePreview src={task.resolution_photo_url} alt="Resolution" label="Resolution photo" />
            </div>
          )}

          {/* Action panel */}
          {!isResolved && (
            <div className="card p-5 bg-ink-navy/3 border-ink-navy/15">
              <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-3">Update progress</p>

              <Textarea
                label="Remarks (optional)"
                name="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add notes about the work done..."
              />

              {nextStatus === 'RESOLVED' && (
                <div className="mt-3">
                  <ImageUpload
                    label="Resolution photo"
                    hint="Show the completed work"
                    currentUrl={resolutionPhoto}
                    onUpload={(f) => setResolutionPhoto(f)}
                    uploadFn={uploadComplaintPhoto}
                  />
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {task.status === 'ASSIGNED' && (
                  <Button loading={updating} onClick={() => handleStatusUpdate('IN_PROGRESS')}>
                    <Play className="w-4 h-4" /> Start working
                  </Button>
                )}
                {task.status === 'IN_PROGRESS' && nextStatus === 'RESOLVED' && (
                  <Button variant="secondary" loading={updating} onClick={() => handleStatusUpdate('RESOLVED')}>
                    <CheckCircle2 className="w-4 h-4" /> Mark as resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="md:col-span-1">
          <div className="card p-5 sticky top-4">
            <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-4">Status timeline</p>
            <StatusTimeline currentStatus={task.status} history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
