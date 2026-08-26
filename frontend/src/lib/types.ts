export type Role = 'STUDENT' | 'STAFF' | 'ADMIN' | 'TECHNICIAN';

export type ComplaintStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type Category =
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'NETWORK'
  | 'FURNITURE'
  | 'CIVIL'
  | 'CLEANING'
  | 'OTHER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

// OFFLINE is the frontend display value; backend uses OFF_DUTY.
// The adapter in api.ts maps OFF_DUTY -> OFFLINE on read and OFFLINE -> OFF_DUTY on write.
export type Availability = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'OFF_DUTY';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
  phone: string;
}

export interface Technician {
  id: number;
  user_id: number;
  specialization: Category;
  availability: Availability;
  created_at: string;
  name?: string;
  email?: string;
  department?: string;
  phone?: string;
}

export interface Location {
  id: number;
  building: string;
  floor: string;
  room: string;
  label: string;
}

export interface Complaint {
  id: number;
  code: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: ComplaintStatus;
  location_id: number | null;
  location_label: string;
  reporter_id: number;
  technician_id: number | null;
  photo_url: string | null;
  resolution_photo_url: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  reporter?: User;
  technician?: Technician | null;
}

export interface ComplaintHistoryEntry {
  id: number;
  complaint_id: number;
  status: ComplaintStatus;
  remarks: string | null;
  changed_by: number | null;
  created_at: string;
  changed_by_name?: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  unresolved: number;
  resolution_rate: number;
  technician_workload: Array<{
    technician_id: number;
    name: string;
    specialization: string;
    active_tasks: number;
  }>;
}
