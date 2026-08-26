import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllComplaints, getDashboardStats, getTechnicians } from '@/lib/api';
import type { Complaint, DashboardStats, Technician } from '@/lib/types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
} from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import StatusStamp from '@/components/ui/StatusStamp';
import {
  ClipboardList,
  Wrench,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [c, t] = await Promise.all([
          getAllComplaints().catch(() => []),
          getTechnicians().catch(() => []),
        ]);
        const s = await getDashboardStats(c, t).catch(() => null);
        if (mounted) {
          setComplaints(c);
          setTechs(t);
          setStats(s);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  const recent = complaints.slice(0, 6);
  const unassigned = complaints.filter((c) => c.status === 'OPEN').length;
  const categoryEntries = stats?.by_category
    ? Object.entries(stats.by_category).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <PageHeader
        monoLabel="Admin Console"
        title="Maintenance overview"
        subtitle="Monitor all campus maintenance requests, technician assignments, and facility health."
        dark
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/complaints">
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                <ClipboardList className="w-4 h-4 mr-1.5" /> All complaints ({complaints.length})
              </Button>
            </Link>
            <Link to="/technicians">
              <Button variant="primary" size="sm">
                <Wrench className="w-4 h-4 mr-1.5" /> Technicians ({techs.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total requests" value={complaints.length} icon={ClipboardList} />
        <StatCard label="Unassigned" value={unassigned} icon={AlertCircle} accent="text-rust" />
        <StatCard label="In progress" value={complaints.filter((c) => c.status === 'IN_PROGRESS').length} icon={Clock} accent="text-signal-amber" />
        <StatCard label="Resolution rate" value={`${stats?.resolution_rate ?? 0}%`} icon={TrendingUp} accent="text-moss" />
      </div>

      {/* Breakdown sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Status breakdown */}
        <div className="card p-5 lg:col-span-2">
          <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-4">Status breakdown</p>
          <div className="space-y-3">
            {(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => {
              const count = complaints.filter((c) => c.status === status).length;
              const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
              const colors = STATUS_COLORS[status] || STATUS_COLORS.OPEN;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-navy w-28 shrink-0">
                    {STATUS_LABELS[status] || status}
                  </span>
                  <div className="flex-1 h-2.5 bg-slate/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink-navy w-10 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-4">By category</p>
          <div className="space-y-3">
            {categoryEntries.length > 0 ? (
              categoryEntries.map(([cat, count]) => {
                const Icon = (CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] || Wrench) as LucideIcon;
                return (
                  <div key={cat} className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate shrink-0" />
                    <span className="text-sm text-ink-navy flex-1">
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                    </span>
                    <span className="font-mono text-sm font-semibold text-ink-navy">{count}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-stamp-gray">No category statistics available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Technicians Overview */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray">Technicians overview</p>
            <p className="text-xs text-slate mt-0.5">{techs.length} registered maintenance specialists</p>
          </div>
          <Link to="/technicians" className="text-sm text-ink-navy hover:text-signal-amber transition-colors inline-flex items-center gap-1">
            Manage technicians <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {techs.length === 0 ? (
          <div className="p-4 text-center rounded-md bg-ink-navy/3 border border-ink-navy/10">
            <p className="text-sm text-slate">No technicians registered yet.</p>
            <Link to="/technicians" className="text-xs font-semibold text-ink-navy hover:underline mt-1 inline-block">
              Add your first technician →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {techs.map((t) => {
              const activeCount = complaints.filter(
                (c) => c.technician_id === t.id && c.status !== 'CLOSED' && c.status !== 'RESOLVED',
              ).length;
              const avail = AVAILABILITY_COLORS[t.availability] || AVAILABILITY_COLORS.OFFLINE;
              const Icon = (CATEGORY_ICONS[t.specialization] || Wrench) as LucideIcon;

              return (
                <div key={t.id} className="p-3.5 rounded-md bg-white border border-slate/15 hover:border-ink-navy/30 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-ink-navy text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                        {t.name ? t.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-navy truncate">{t.name}</p>
                        <p className="text-xs text-slate flex items-center gap-1">
                          <Icon className="w-3 h-3 text-stamp-gray" />
                          <span>{CATEGORY_LABELS[t.specialization] || t.specialization}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${avail.bg} ${avail.text} shrink-0`}>
                      {AVAILABILITY_LABELS[t.availability] || 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate/10 text-xs">
                    <span className="text-slate flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stamp-gray" />
                      {t.phone || t.email}
                    </span>
                    <span className="font-mono font-bold text-ink-navy">
                      {activeCount} active {activeCount === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent requests */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray">Recent requests</p>
            <p className="text-xs text-slate mt-0.5">Latest campus maintenance submissions</p>
          </div>
          <Link to="/complaints" className="text-sm text-ink-navy hover:text-signal-amber transition-colors inline-flex items-center gap-1">
            View all ({complaints.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-6 text-center rounded-md bg-ink-navy/3 border border-ink-navy/10">
            <p className="text-sm text-slate">No maintenance requests submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((c) => (
              <Link
                key={c.id}
                to={`/complaints/${c.id}`}
                className="block p-3.5 rounded-md border border-slate/10 hover:border-ink-navy/30 hover:bg-ink-navy/3 transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-stamp-gray font-semibold">{c.code}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          PRIORITY_COLORS[c.priority].bg
                        } ${PRIORITY_COLORS[c.priority].text}`}
                      >
                        {PRIORITY_LABELS[c.priority]}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-ink-navy truncate group-hover:text-signal-amber transition-colors">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate mt-0.5">
                      {c.location_label} · {CATEGORY_LABELS[c.category]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusStamp status={c.status} />
                    <ArrowRight className="w-4 h-4 text-stamp-gray group-hover:text-ink-navy transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
