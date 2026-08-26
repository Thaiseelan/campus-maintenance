import { useAuth } from '@/context/AuthContext';
import DashboardPage from '@/pages/DashboardPage';
import TechnicianDashboardPage from '@/pages/TechnicianDashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'ADMIN') return <AdminDashboardPage />;
  if (user.role === 'TECHNICIAN') return <TechnicianDashboardPage />;
  return <DashboardPage />;
}
