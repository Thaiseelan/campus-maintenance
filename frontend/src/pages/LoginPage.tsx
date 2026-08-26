import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ArrowRight, ShieldCheck, Wrench, Building } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate('/dashboard');
      toastError('Welcome back!', `Signed in as ${user.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center p-6 blueprint-bg">
        <div className="w-full max-w-sm animate-slide-up">
          {/* College Header & Logo */}
          <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate/15">
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

          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-wider text-signal-amber mb-1.5 font-semibold">Sign in</p>
            <h1 className="font-display text-2xl font-bold text-ink-navy">Welcome back</h1>
            <p className="text-sm text-slate mt-1">Sign in with your campus credentials to manage facilities requests.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campus Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@bitsathy.ac.in"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-md p-3 animate-fade-in">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Sign in <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Secure Institutional Portal footer badge */}
          <div className="mt-8 pt-5 border-t border-slate/15 flex items-center justify-center gap-2 text-xs text-stamp-gray font-mono">
            <ShieldCheck className="w-4 h-4 text-moss" />
            <span>BIT Official Maintenance Portal</span>
          </div>

          <p className="text-sm text-slate text-center mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-display font-semibold text-ink-navy hover:text-signal-amber transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right: visual panel */}
      <div className="hidden lg:flex flex-1 navy-blueprint items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-signal-amber animate-pulse-soft" />
              <span className="font-mono text-xs text-white/80 uppercase tracking-wider">BIT Sathy · Facility Network</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white leading-tight">
              Bannari Amman<br />Institute of Technology
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Centralized Maintenance Management System. Rapidly report, assign, and resolve campus infrastructure issues across all blocks and hostels.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: '7', label: 'Categories' },
                { value: '5', label: 'Status stages' },
                { value: '24/7', label: 'Active Support' },
              ].map((stat) => (
                <div key={stat.label} className="border-l-2 border-signal-amber/50 pl-3">
                  <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                  <p className="font-mono text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Decorative grid overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(242,160,7,0.15), transparent 50%)' }} />
      </div>
    </div>
  );
}
