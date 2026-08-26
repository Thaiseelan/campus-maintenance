import type { Category, ComplaintStatus, Priority, Role, Availability } from './types';
import {
  Zap,
  Droplets,
  Wifi,
  Armchair,
  HardHat,
  Sparkles,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORIES: Category[] = [
  'ELECTRICAL',
  'PLUMBING',
  'NETWORK',
  'FURNITURE',
  'CIVIL',
  'CLEANING',
  'OTHER',
];

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  ELECTRICAL: Zap,
  PLUMBING: Droplets,
  NETWORK: Wifi,
  FURNITURE: Armchair,
  CIVIL: HardHat,
  CLEANING: Sparkles,
  OTHER: HelpCircle,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  ELECTRICAL: 'Electrical',
  PLUMBING: 'Plumbing',
  NETWORK: 'Network',
  FURNITURE: 'Furniture',
  CIVIL: 'Civil',
  CLEANING: 'Cleaning',
  OTHER: 'Other',
};

export const STATUSES: ComplaintStatus[] = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const STATUS_FLOW: ComplaintStatus[] = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

export const STATUS_COLORS: Record<ComplaintStatus, { text: string; border: string; bg: string; dot: string }> = {
  OPEN: { text: 'text-signal-amber', border: 'border-signal-amber', bg: 'bg-signal-amber', dot: 'bg-signal-amber' },
  ASSIGNED: { text: 'text-ink-navy', border: 'border-ink-navy', bg: 'bg-ink-navy', dot: 'bg-ink-navy' },
  IN_PROGRESS: { text: 'text-rust', border: 'border-rust', bg: 'bg-rust', dot: 'bg-rust' },
  RESOLVED: { text: 'text-moss', border: 'border-moss', bg: 'bg-moss', dot: 'bg-moss' },
  CLOSED: { text: 'text-stamp-gray', border: 'border-stamp-gray', bg: 'bg-stamp-gray', dot: 'bg-stamp-gray' },
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_COLORS: Record<Priority, { text: string; bg: string; border: string }> = {
  LOW: { text: 'text-slate', bg: 'bg-slate/10', border: 'border-slate/30' },
  MEDIUM: { text: 'text-signal-amber', bg: 'bg-signal-amber/10', border: 'border-signal-amber/30' },
  HIGH: { text: 'text-rust', bg: 'bg-rust/10', border: 'border-rust/30' },
};

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
  STAFF: 'Staff',
  ADMIN: 'Admin',
  TECHNICIAN: 'Technician',
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  OFFLINE: 'Offline',
  OFF_DUTY: 'Off Duty',
};

export const AVAILABILITY_COLORS: Record<Availability, { text: string; dot: string; bg: string }> = {
  AVAILABLE: { text: 'text-moss', dot: 'bg-moss', bg: 'bg-moss/10' },
  BUSY: { text: 'text-rust', dot: 'bg-rust', bg: 'bg-rust/10' },
  OFFLINE: { text: 'text-stamp-gray', dot: 'bg-stamp-gray', bg: 'bg-stamp-gray/10' },
  OFF_DUTY: { text: 'text-stamp-gray', dot: 'bg-stamp-gray', bg: 'bg-stamp-gray/10' },
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
