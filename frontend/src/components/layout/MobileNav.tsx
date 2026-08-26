import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';
import { LayoutDashboard, ClipboardList, Wrench, User, LogOut } from 'lucide-react';
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

export default function MobileNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ink-navy border-t border-white/10 flex items-center justify-around px-2 py-1.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-colors focus-ring ${
              isActive ? 'text-signal-amber' : 'text-white/50'
            }`
          }
        >
          <item.icon className="w-5 h-5" strokeWidth={1.8} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
      <button
        onClick={async () => { await logout(); navigate('/login'); }}
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-white/50 hover:text-rust transition-colors focus-ring"
        aria-label="Sign out"
      >
        <LogOut className="w-5 h-5" strokeWidth={1.8} />
        <span className="text-[10px] font-medium">Sign out</span>
      </button>
    </nav>
  );
}
