import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';
import { LayoutDashboard, ClipboardList, Wrench, User, LogOut, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'STAFF', 'ADMIN', 'TECHNICIAN'] },
  { to: '/complaints', label: 'Complaints', icon: ClipboardList, roles: ['ADMIN'] },
  { to: '/technicians', label: 'Technicians', icon: Wrench, roles: ['ADMIN'] },
  { to: '/profile', label: 'Profile', icon: User, roles: ['STUDENT', 'STAFF', 'ADMIN', 'TECHNICIAN'] },
];

export default function NavRail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role));

  return (
    <nav className="hidden md:flex flex-col h-screen w-16 bg-ink-navy border-r border-ink-navy/50 shrink-0 sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <div className="w-9 h-9 rounded-md bg-signal-amber flex items-center justify-center font-display font-bold text-ink-navy text-sm">
          BIT
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 flex flex-col gap-1 px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative group flex items-center justify-center w-12 h-12 rounded-md transition-all duration-200 focus-ring ${
                isActive
                  ? 'bg-white/10 text-signal-amber'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-signal-amber rounded-r" />
                )}
                <item.icon className="w-5 h-5" strokeWidth={1.8} />
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-ink-navy text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 border border-white/10">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={async () => { await logout(); navigate('/login'); }}
          className="group relative w-12 h-12 flex items-center justify-center rounded-md text-white/50 hover:text-rust hover:bg-white/5 transition-all duration-200 focus-ring"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.8} />
          <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-ink-navy text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 border border-white/10">
            Sign out
          </span>
        </button>
      </div>
    </nav>
  );
}
