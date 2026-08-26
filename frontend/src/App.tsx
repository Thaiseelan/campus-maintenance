import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardRouter from '@/components/DashboardRouter';
import NewComplaintPage from '@/pages/NewComplaintPage';
import ComplaintDetailPage from '@/pages/ComplaintDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import TechnicianDashboardPage from '@/pages/TechnicianDashboardPage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminComplaintsPage from '@/pages/AdminComplaintsPage';
import AdminTechniciansPage from '@/pages/AdminTechniciansPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected — shared */}
            <Route path="/dashboard" element={<ProtectedRoute><AppShell><DashboardRouter /></AppShell></ProtectedRoute>} />
            <Route path="/complaints/new" element={<ProtectedRoute roles={['STUDENT', 'STAFF']}><AppShell><NewComplaintPage /></AppShell></ProtectedRoute>} />
            <Route path="/complaints/:id" element={<ProtectedRoute><AppShell><ComplaintDetailPage /></AppShell></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />

            {/* Technician */}
            <Route path="/tasks/:id" element={<ProtectedRoute roles={['TECHNICIAN', 'ADMIN']}><AppShell><TaskDetailPage /></AppShell></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/complaints" element={<ProtectedRoute roles={['ADMIN']}><AppShell><AdminComplaintsPage /></AppShell></ProtectedRoute>} />
            <Route path="/technicians" element={<ProtectedRoute roles={['ADMIN']}><AppShell><AdminTechniciansPage /></AppShell></ProtectedRoute>} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
