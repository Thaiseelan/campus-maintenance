import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateProfile } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROLE_LABELS } from '@/lib/constants';
import { User, Mail, Phone, Building2, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState(user?.phone ?? '');

  if (!user) return null;

  async function handleSave() {
    setSaving(true);
    try {
      // PATCH /api/users/me — backend updates phone (phoneNumber field)
      await updateProfile({ phone });
      // Refresh user in context so the displayed value is up-to-date
      await refreshUser();
      success('Profile updated', 'Your phone number has been saved.');
      setEditing(false);
    } catch (err) {
      toastError('Update failed', err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { icon: User, label: 'Name', value: user.name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Building2, label: 'Department', value: user.department },
    { icon: Shield, label: 'Role', value: ROLE_LABELS[user.role] },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader
        monoLabel="Profile"
        title="Your account"
        subtitle="View and update your personal information."
        dark
      />

      <div className="card p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate/10">
          <div className="w-16 h-16 rounded-lg bg-ink-navy flex items-center justify-center font-display font-bold text-white text-xl">
            {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-ink-navy">{user.name}</h2>
            <p className="text-sm text-slate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-ink-navy/8 text-ink-navy">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-ink-navy/5 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-slate" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray">{f.label}</p>
                <p className="text-sm text-ink-navy truncate">{f.value}</p>
              </div>
            </div>
          ))}

          {/* Phone (editable) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-ink-navy/5 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-slate" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray">Phone</p>
              {editing ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-ink-navy">{user.phone || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate/10">
          {editing ? (
            <div className="flex gap-2">
              <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); setPhone(user.phone); }}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit phone</Button>
          )}
        </div>
      </div>
    </div>
  );
}
