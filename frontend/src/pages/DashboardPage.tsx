import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getMyComplaints } from '@/lib/api';
import type { Complaint } from '@/lib/types';
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import ComplaintCard from '@/components/shared/ComplaintCard';
import StatCard from '@/components/shared/StatCard';
import { DashboardSkeleton, ComplaintCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { Plus, ClipboardList, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  useEffect(() => {
    (async () => {
      try {
        // Students only need their own complaints.
        // getDashboardStats() calls admin-only endpoints and must NOT be used here.
        const c = await getMyComplaints();
        setComplaints(c);
      } catch {
        // non-critical — empty list is shown
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = complaints.filter((c) => {
    if (filter === 'ACTIVE') return c.status !== 'CLOSED' && c.status !== 'RESOLVED';
    if (filter === 'RESOLVED') return c.status === 'CLOSED' || c.status === 'RESOLVED';
    return true;
  });

  const recent = filtered.slice(0, 6);
  const myActive = complaints.filter((c) => c.status !== 'CLOSED' && c.status !== 'RESOLVED').length;
  const myResolved = complaints.filter((c) => c.status === 'CLOSED' || c.status === 'RESOLVED').length;

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader
        monoLabel="Dashboard"
        title="Your maintenance requests"
        subtitle="Track the status of issues you've reported across campus."
        dark
        actions={
          <Link to="/complaints/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" /> New request
            </Button>
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={complaints.length} icon={ClipboardList} />
        <StatCard label="Active" value={myActive} icon={Clock} accent="text-signal-amber" />
        <StatCard label="Resolved" value={myResolved} icon={CheckCircle2} accent="text-moss" />
        <StatCard
          label="Resolution rate"
          value={`${complaints.length > 0 ? Math.round((myResolved / complaints.length) * 100) : 0}%`}
          icon={TrendingUp}
          accent="text-ink-navy"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-slate/15">
        {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-display font-medium transition-colors relative ${
              filter === f ? 'text-ink-navy' : 'text-stamp-gray hover:text-slate'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'ACTIVE' ? 'Active' : 'Resolved'}
            {filter === f && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal-amber rounded-t" />}
          </button>
        ))}
      </div>

      {/* Complaint list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <ComplaintCardSkeleton key={i} />)}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filter === 'RESOLVED' ? 'No resolved requests yet' : 'No maintenance requests yet'}
          message={filter === 'RESOLVED' ? 'Your resolved and closed requests will appear here.' : 'Report a broken light, leaky tap, or network issue to get started.'}
          action={
            <Link to="/complaints/new">
              <Button variant="primary"><Plus className="w-4 h-4" /> Report an issue</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recent.map((c, i) => <ComplaintCard key={c.id} complaint={c} index={i} />)}
        </div>
      )}

      {filtered.length > 6 && (
        <div className="text-center mt-6">
          <Link to="/complaints">
            <Button variant="outline">View all {filtered.length} requests</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
