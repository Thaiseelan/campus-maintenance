import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllComplaints, getTechnicians, updateComplaintStatus, assignTechnician, updateTechnician } from '@/lib/api';
import type { Complaint, Technician, ComplaintStatus, Category } from '@/lib/types';
import { STATUSES, STATUS_LABELS, CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import ComplaintCard from '@/components/shared/ComplaintCard';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ComplaintCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { ClipboardList, Search, Wrench, ArrowRight } from 'lucide-react';

export default function AdminComplaintsPage() {
  const { success, error: toastError } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');

  // Assign modal
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [assignTechId, setAssignTechId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, t] = await Promise.all([getAllComplaints(), getTechnicians()]);
        setComplaints(c);
        setTechs(t);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (categoryFilter && c.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.location_label.toLowerCase().includes(q);
      }
      return true;
    });
  }, [complaints, statusFilter, categoryFilter, search]);

  async function handleAssign() {
    if (!assignTarget || !assignTechId) return;
    setAssigning(true);
    try {
      const tech = techs.find((t) => t.id === Number(assignTechId));
      if (!tech) throw new Error('Technician not found.');
      await assignTechnician(assignTarget.id, assignTechId);
      await updateTechnician(Number(assignTechId), { availability: 'BUSY' }).catch(() => {});

      // Refresh
      const [c, t] = await Promise.all([getAllComplaints(), getTechnicians()]);
      setComplaints(c);
      setTechs(t);
      setAssignTarget(null);
      setAssignTechId('');
      success('Task assigned', `${assignTarget.code} assigned to ${tech.name}.`);
    } catch (err) {
      toastError('Assignment failed', err instanceof Error ? err.message : undefined);
    } finally {
      setAssigning(false);
    }
  }

  const availableTechs = assignTarget
    ? techs.filter((t) => t.specialization === assignTarget.category && t.availability !== 'OFFLINE')
    : techs;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <PageHeader
        monoLabel="Admin"
        title="All maintenance requests"
        subtitle="Assign technicians, update statuses, and oversee all campus complaints."
        dark
      />

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Search by title, code, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-mono text-sm"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | '')}
            placeholder="All statuses"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | '')}
            placeholder="All categories"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <ComplaintCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No complaints found"
          message="Try adjusting your filters or search query."
        />
      ) : (
        <>
          <p className="text-sm text-stamp-gray mb-3 font-mono">{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c, i) => (
              <div key={c.id} className="relative">
                <ComplaintCard complaint={c} index={i} />
                {c.status === 'OPEN' && (
                  <button
                    onClick={() => setAssignTarget(c)}
                    className="absolute top-3 right-16 z-10 px-2.5 py-1 text-xs font-display font-semibold bg-ink-navy text-white rounded-md hover:bg-ink-navy/80 transition-colors focus-ring"
                  >
                    <Wrench className="w-3 h-3 inline mr-1" /> Assign
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Assign modal */}
      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title={`Assign ${assignTarget?.code ?? ''}`}>
        {assignTarget && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-ink-navy/3 border border-ink-navy/10">
              <p className="font-medium text-sm text-ink-navy">{assignTarget.title}</p>
              <p className="text-xs text-slate mt-1">{CATEGORY_LABELS[assignTarget.category]} · {assignTarget.location_label}</p>
            </div>

            <Select
              label="Select technician"
              value={assignTechId}
              onChange={(e) => setAssignTechId(e.target.value)}
              placeholder="Choose a technician..."
            >
              {availableTechs.length === 0 ? (
                <option value="" disabled>No available technicians for this category</option>
              ) : (
                availableTechs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.specialization} ({t.availability})
                  </option>
                ))
              )}
            </Select>

            {availableTechs.length === 0 && (
              <p className="text-xs text-rust bg-rust/5 border border-rust/20 rounded-md p-2.5">
                No technicians are available for {CATEGORY_LABELS[assignTarget.category]} issues. You can add one from the Technicians page.
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
              <Button loading={assigning} disabled={!assignTechId} onClick={handleAssign}>
                Assign technician
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
