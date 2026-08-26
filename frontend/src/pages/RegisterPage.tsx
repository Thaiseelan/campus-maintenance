import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Wrench, ArrowRight, UserCircle, Building2 } from 'lucide-react';
import { passwordStrength } from '@/lib/utils';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Artificial Intelligence',
  'Biotechnology',
  'Administration',
  'Hostel Office',
  'Maintenance',
  'Library',
  'Other',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'STAFF',
    department: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pw = passwordStrength(form.password);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate('/dashboard');
      success('Account created', `Welcome, ${user.name}!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
      toastError('Registration failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 blueprint-bg">
      <div className="w-full max-w-md animate-slide-up">
        {/* College Header & Logo */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate/15">
          <div className="w-12 h-12 rounded-lg bg-ink-navy border border-signal-amber/40 flex items-center justify-center font-display font-extrabold text-signal-amber text-lg shadow-sm shrink-0">
            BIT
          </div>
          <div>
            <p className="font-display font-bold text-ink-navy text-base leading-tight">
              Bannari Amman Institute of Technology
            </p>
            <p className="font-mono text-xs text-signal-amber font-semibold mt-0.5 tracking-wide">
              Campus Maintenance Desk
            </p>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-wider text-signal-amber mb-2">New account</p>
            <h1 className="font-display text-2xl font-bold text-ink-navy">Create your account</h1>
            <p className="text-sm text-slate mt-1">Report and track campus maintenance issues.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Arjun Kumar"
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@bitsathy.ac.in"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
              hint={form.password ? `${pw.label} — use letters, numbers & symbols for strength` : 'At least 6 characters'}
            />
            {form.password && (
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i < pw.score ? (pw.score >= 4 ? 'bg-moss' : pw.score >= 2 ? 'bg-signal-amber' : 'bg-rust') : 'bg-slate/15'
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Role"
                name="role"
                value={form.role}
                onChange={(e) => update('role', e.target.value as 'STUDENT' | 'STAFF')}
              >
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff</option>
              </Select>
              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="98765 43210"
                required
              />
            </div>
            <Select
              label="Department"
              name="department"
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              placeholder="Select department"
              required
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>

            {error && (
              <div className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-md p-3 animate-fade-in">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Create account <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-sm text-slate text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-display font-semibold text-ink-navy hover:text-signal-amber transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-xs text-stamp-gray text-center mt-4 font-mono">
          Bannari Amman Institute of Technology
        </p>
      </div>
    </div>
  );
}
