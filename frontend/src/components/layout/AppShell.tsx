import { type ReactNode } from 'react';
import NavRail from './NavRail';
import MobileNav from './MobileNav';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen blueprint-bg">
      <NavRail />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
