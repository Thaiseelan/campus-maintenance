import { useEffect, useState } from 'react';
import { getTechnicians, createTechnician, updateTechnician } from '@/lib/api';
import type { Technician, Category, Availability } from '@/lib/types';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS, AVAILABILITY_LABELS, AVAILABILITY_COLORS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { Wrench, UserPlus, Mail, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Default password shown in the modal — admin must change it after first login.
const DEFAULT_PASSWORD = 'TechPass@123';

interface NewTechForm {
  name: string;
  email: string;
  password: string;
  department: string;
  phone: string;
  specialization: Category;
}

const INITIAL_FORM: NewTechForm = {
  name: '',
  email: '',
  password: DEFAULT_PASSWORD,
  department: 'Maintenance',
  phone: '',
  specialization: 'ELECTRICAL',
};

export default function AdminTechniciansPage() {
  const { success, error: toastError } = useToast();
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<NewTechForm>(INITIAL_FORM);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadTechs();
  }, []);

  async function loadTechs() {
    setLoading(true);
    try {
      const t = await getTechnicians();
      setTechs(t);
    } catch {
      // non-critical — empty list is shown
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof NewTechForm>(key: K, value: NewTechForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAddTech() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toastError('Missing fields', 'Name, email and password are required.');
      return;
    }
    setAdding(true);
    try {
      // Two-step flow:
      // 1. POST /api/auth/admin/create-user  — creates a TECHNICIAN user
      // 2. POST /api/technicians             — creates the technician profile
      await createTechnician({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        department: form.department.trim() || 'Maintenance',
        phone: form.phone.trim(),
        specialization: form.specialization,
      });
      await loadTechs();
      setAddOpen(false);
      setForm(INITIAL_FORM);
      success('Technician added', `${form.name} is now a ${CATEGORY_LABELS[form.specialization]} technician.`);
    } catch (err) {
      toastError('Could not add technician', err instanceof Error ? err.message : undefined);
    } finally {
      setAdding(false);
    }
  }

  function handleCloseModal() {
    setAddOpen(false);
    setForm(INITIAL_FORM);
  }

  async function handleAvailabilityChange(techId: number, avail: Availability) {
    try {
      await updateTechnician(techId, { availability: avail });
      await loadTechs();
    } catch (err) {
      toastError('Update failed', err instanceof Error ? err.message : undefined);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader
        monoLabel="Admin"
        title="Technician management"
        subtitle="Add and manage maintenance technicians and their specializations."
        dark
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="w-4 h-4" /> Add technician
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : techs.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No technicians yet"
          message="Add technicians to start assigning maintenance requests to them."
          action={<Button variant="primary" onClick={() => setAddOpen(true)}><UserPlus className="w-4 h-4" /> Add technician</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techs.map((t, i) => {
            const Icon = CATEGORY_ICONS[t.specialization] as LucideIcon;
            const avail = AVAILABILITY_COLORS[t.availability] ?? AVAILABILITY_COLORS['OFFLINE'];
            return (
              <div key={t.id} className="card p-5 animate-slide-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-ink-navy flex items-center justify-center font-display font-bold text-white shrink-0">
                    {t.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-ink-navy">{t.name}</p>
                    <p className="text-xs text-slate truncate">{t.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon className="w-3.5 h-3.5 text-slate" />
                      <span className="text-xs text-slate">{CATEGORY_LABELS[t.specialization]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${avail.dot}`} />
                    <span className={`text-xs font-mono font-semibold ${avail.text}`}>
                      {AVAILABILITY_LABELS[t.availability] ?? 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-stamp-gray mb-4">
                  {t.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {t.phone}</span>}
                  <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {t.email}</span>
                </div>

                <div className="pt-3 border-t border-slate/10">
                  <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray mb-2">Availability</p>
                  <div className="flex gap-1.5">
                    {(['AVAILABLE', 'BUSY', 'OFFLINE'] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => handleAvailabilityChange(t.id as number, a)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          t.availability === a || (a === 'OFFLINE' && t.availability === 'OFF_DUTY')
                            ? `${AVAILABILITY_COLORS[a].bg} ${AVAILABILITY_COLORS[a].text} border ${AVAILABILITY_COLORS[a].text}/30`
                            : 'bg-ink-navy/3 text-stamp-gray hover:bg-ink-navy/8'
                        }`}
                      >
                        {AVAILABILITY_LABELS[a]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add technician modal — two-step flow */}
      <Modal open={addOpen} onClose={handleCloseModal} title="Add technician">
        <div className="space-y-4">
          <p className="text-sm text-slate">
            This will create a new <span className="font-semibold text-ink-navy">TECHNICIAN</span> user account
            and link them as a maintenance specialist.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full name"
              placeholder="e.g. Arun Kumar"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
            <Input
              label="Phone"
              placeholder="98765 43210"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="technician@bitsathy.ac.in"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />

          <Input
            label="Temporary password"
            type="text"
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            hint="Technician should change this on first login."
            required
          />

          <Input
            label="Department"
            placeholder="e.g. Electrical Maintenance"
            value={form.department}
            onChange={(e) => updateField('department', e.target.value)}
          />

          <Select
            label="Specialization"
            value={form.specialization}
            onChange={(e) => updateField('specialization', e.target.value as Category)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </Select>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button loading={adding} onClick={handleAddTech}>
              <UserPlus className="w-4 h-4" /> Create technician
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
