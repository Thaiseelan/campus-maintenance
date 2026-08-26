import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getMyTasks } from '@/lib/api';
import type { Complaint } from '@/lib/types';
import PageHeader from '@/components/layout/PageHeader';
import ComplaintCard from '@/components/shared/ComplaintCard';
import StatCard from '@/components/shared/StatCard';
import { DashboardSkeleton, ComplaintCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Wrench, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DONE'>('ACTIVE');

  useEffect(() => {
    (async () => {
      try {
        const t = await getMyTasks();
        setTasks(t);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = tasks.filter((t) => {
    if (filter === 'ACTIVE') return t.status !== 'CLOSED' && t.status !== 'RESOLVED';
    if (filter === 'DONE') return t.status === 'CLOSED' || t.status === 'RESOLVED';
    return true;
  });

  const activeCount = tasks.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
  const doneCount = tasks.filter((t) => t.status === 'CLOSED' || t.status === 'RESOLVED').length;

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
        monoLabel="Technician"
        title="Your assigned tasks"
        subtitle="Maintenance requests assigned to you. Update their status as you work."
        dark
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active tasks" value={activeCount} icon={Wrench} accent="text-signal-amber" />
        <StatCard label="In progress" value={tasks.filter((t) => t.status === 'IN_PROGRESS').length} icon={Clock} accent="text-rust" />
        <StatCard label="Completed" value={doneCount} icon={CheckCircle2} accent="text-moss" />
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-slate/15">
        {(['ACTIVE', 'DONE', 'ALL'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-display font-medium transition-colors relative ${
              filter === f ? 'text-ink-navy' : 'text-stamp-gray hover:text-slate'
            }`}
          >
            {f === 'ACTIVE' ? 'Active' : f === 'DONE' ? 'Completed' : 'All'}
            {filter === f && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal-amber rounded-t" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <ComplaintCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={filter === 'ACTIVE' ? 'No active tasks' : 'No completed tasks yet'}
          message={filter === 'ACTIVE' ? 'When the admin assigns you a maintenance request, it will appear here.' : 'Tasks you complete will show up here.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t, i) => <ComplaintCard key={t.id} complaint={t} index={i} linkTo={`/tasks/${t.id}`} />)}
        </div>
      )}
    </div>
  );
}
