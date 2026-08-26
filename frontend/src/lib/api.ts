// ─── Spring Boot API Layer ────────────────────────────────────────────────────
// All application data comes from the Spring Boot backend at VITE_API_BASE_URL.
// No Supabase. No localStorage fake database. No mock data fallbacks.
// The only localStorage usage here is JWT storage (delegated to http.ts).

import { http, setToken, clearToken, getToken, BASE_URL } from './http';
import type {
  User,
  Complaint,
  ComplaintHistoryEntry,
  Technician,
  Location,
  DashboardStats,
  Category,
  Priority,
  ComplaintStatus,
  Availability,
} from './types';

// ─── Backend DTO shapes ───────────────────────────────────────────────────────
// These mirror the Java DTOs exactly as serialised by Jackson.

interface BackendUserResponse {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN' | 'TECHNICIAN';
  department: string;
  phone: string; // Jackson @JsonProperty("phone") bridges phoneNumber -> phone
}

interface BackendAuthResponse {
  token: string;
  user: BackendUserResponse;
}

interface BackendLocationResponse {
  id: number;
  building: string;
  floor: string;
  room: string;
}

interface BackendComplaintResponse {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: ComplaintStatus;
  location: BackendLocationResponse;
  reportedBy: { id: number; name: string };
  assignedTechnician: { id: number; name: string } | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendStatusHistoryResponse {
  status: ComplaintStatus;
  changedByName: string;
  remarks: string | null;
  changedAt: string;
}

interface BackendTechnicianResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  specialization: string; // TechnicianSpecialization enum value from backend
  availabilityStatus: string; // AvailabilityStatus: AVAILABLE | BUSY | OFF_DUTY
  activeTaskCount: number;
}

interface BackendDashboardStats {
  totalComplaints: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  unresolvedCount: number;
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

/** Maps backend AvailabilityStatus to frontend Availability.
 *  OFF_DUTY (backend) -> OFFLINE (frontend display). */
function adaptAvailability(backendValue: string): Availability {
  if (backendValue === 'OFF_DUTY') return 'OFFLINE';
  if (backendValue === 'AVAILABLE' || backendValue === 'BUSY' || backendValue === 'OFFLINE') {
    return backendValue as Availability;
  }
  return 'OFFLINE';
}

/** Maps frontend Availability to backend AvailabilityStatus for writes. */
function toBackendAvailability(frontendValue: Availability): string {
  if (frontendValue === 'OFFLINE') return 'OFF_DUTY';
  return frontendValue;
}

/** Maps backend TechnicianSpecialization to frontend Category for display.
 *  The frontend Category enum is what the UI renders.
 *  Specializations that don't map directly fall back to 'ELECTRICAL'. */
function adaptSpecialization(spec: string): Category {
  const map: Record<string, Category> = {
    ELECTRICAL: 'ELECTRICAL',
    PLUMBING: 'PLUMBING',
    NETWORK: 'NETWORK',
    CARPENTRY_FURNITURE: 'FURNITURE',
    HOUSEKEEPING: 'CLEANING',
    CIVIL_MAINTENANCE: 'CIVIL',
    GENERAL: 'OTHER',
  };
  return map[spec] ?? 'OTHER';
}

function buildLocationLabel(loc: BackendLocationResponse): string {
  return `${loc.building} · ${loc.floor} · ${loc.room}`;
}

function adaptComplaint(raw: BackendComplaintResponse): Complaint {
  const year = new Date(raw.createdAt).getFullYear();
  const code = `REQ-${year}-${String(raw.id).padStart(3, '0')}`;

  const photoUrl =
    raw.photoUrl
      ? raw.photoUrl.startsWith('http')
        ? raw.photoUrl
        : `${BASE_URL}${raw.photoUrl}`
      : null;

  return {
    id: raw.id,
    code,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    priority: raw.priority,
    status: raw.status,
    location_id: raw.location?.id ?? null,
    location_label: raw.location ? buildLocationLabel(raw.location) : '',
    reporter_id: raw.reportedBy.id,
    technician_id: raw.assignedTechnician?.id ?? null,
    photo_url: photoUrl,
    resolution_photo_url: null, // not exposed in ComplaintResponse
    remarks: null,              // not exposed in ComplaintResponse; shown via history
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
    reporter: {
      id: raw.reportedBy.id,
      name: raw.reportedBy.name,
      email: '',
      role: 'STUDENT',
      department: '',
      phone: '',
    },
    technician: raw.assignedTechnician
      ? {
          id: raw.assignedTechnician.id,
          user_id: raw.assignedTechnician.id,
          name: raw.assignedTechnician.name,
          specialization: 'ELECTRICAL' as Category,
          availability: 'AVAILABLE' as Availability,
          created_at: '',
        }
      : null,
  };
}

function adaptHistoryEntry(
  raw: BackendStatusHistoryResponse,
  index: number,
  complaintId: number,
): ComplaintHistoryEntry {
  return {
    id: index + 1,
    complaint_id: complaintId,
    status: raw.status,
    remarks: raw.remarks,
    changed_by: null,
    changed_by_name: raw.changedByName,
    created_at: raw.changedAt,
  };
}

function adaptTechnician(raw: BackendTechnicianResponse): Technician {
  return {
    id: raw.id,
    user_id: raw.userId,
    specialization: adaptSpecialization(raw.specialization),
    availability: adaptAvailability(raw.availabilityStatus),
    created_at: '',
    name: raw.name,
    email: raw.email,
    department: '',  // not exposed in TechnicianResponse
    phone: '',       // not exposed in TechnicianResponse
  };
}

function adaptUser(raw: BackendUserResponse): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    department: raw.department ?? '',
    phone: raw.phone ?? '',
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'STAFF';
  department: string;
  phone: string;
}): Promise<User> {
  const res = await http.post<BackendUserResponse>('/api/auth/register', {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    department: data.department,
    phone: data.phone,
  }, false);
  return adaptUser(res);
}

export async function loginUser(email: string, password: string): Promise<User> {
  const res = await http.post<BackendAuthResponse>('/api/auth/login', { email, password }, false);
  setToken(res.token);
  return adaptUser(res.user);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await http.get<BackendUserResponse>('/api/auth/me');
    return adaptUser(res);
  } catch {
    // 401 will have already cleared the token inside http.ts
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  // Best-effort call — the backend is stateless so this doesn't invalidate the JWT.
  // The important work is clearing the token on the client.
  try {
    await http.post<void>('/api/auth/logout', undefined);
  } catch {
    // ignore any error; client-side cleanup always happens
  } finally {
    clearToken();
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(data: {
  name?: string;
  department?: string;
  phone?: string;
}): Promise<User> {
  const res = await http.patch<BackendUserResponse>('/api/users/me', {
    name: data.name,
    department: data.department,
    phone: data.phone,
  });
  return adaptUser(res);
}

// ─── Locations ────────────────────────────────────────────────────────────────

export async function getLocations(): Promise<Location[]> {
  const res = await http.get<BackendLocationResponse[]>('/api/locations');
  return res.map((loc) => ({
    id: loc.id,
    building: loc.building,
    floor: loc.floor,
    room: loc.room,
    label: buildLocationLabel(loc),
  }));
}

// ─── File upload (pass-through) ────────────────────────────────────────────────
// uploadComplaintPhoto does NOT store the file, create blob URLs, or base64-encode.
// It returns the File object as-is so that callers can append it to FormData.
// The actual upload happens inside createComplaint (field: 'image') and
// updateComplaintStatus (field: 'completionImage').

export async function uploadComplaintPhoto(file: File): Promise<File> {
  return file;
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export async function createComplaint(data: {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  location_id: number;
  location_label: string;
  photo_url?: File | string | null;
}): Promise<Complaint> {
  const fd = new FormData();
  fd.append('title', data.title);
  fd.append('description', data.description);
  fd.append('category', data.category);
  fd.append('priority', data.priority);
  fd.append('locationId', String(data.location_id));

  // photo_url is a File object when set via uploadComplaintPhoto
  if (data.photo_url instanceof File) {
    fd.append('image', data.photo_url);
  }

  const res = await http.postForm<BackendComplaintResponse>('/api/complaints', fd);
  return adaptComplaint(res);
}

export async function getMyComplaints(): Promise<Complaint[]> {
  const res = await http.get<BackendComplaintResponse[]>('/api/complaints/my');
  return res.map(adaptComplaint);
}

export async function getAllComplaints(): Promise<Complaint[]> {
  const res = await http.get<BackendComplaintResponse[]>('/api/complaints');
  return res.map(adaptComplaint);
}

export async function getComplaint(id: string | number): Promise<Complaint> {
  const res = await http.get<BackendComplaintResponse>(`/api/complaints/${id}`);
  return adaptComplaint(res);
}

export async function getComplaintHistory(id: string | number): Promise<ComplaintHistoryEntry[]> {
  const res = await http.get<BackendStatusHistoryResponse[]>(`/api/complaints/${id}/history`);
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return res.map((entry, index) => adaptHistoryEntry(entry, index, numId));
}

export async function updateComplaintStatus(
  id: string | number,
  status: ComplaintStatus,
  remarks?: string,
  resolutionPhotoFile?: File | string | null,
): Promise<void> {
  const fd = new FormData();
  fd.append('status', status);
  if (remarks) fd.append('remarks', remarks);

  // resolutionPhotoFile is a File object when set via uploadComplaintPhoto
  if (resolutionPhotoFile instanceof File) {
    fd.append('completionImage', resolutionPhotoFile);
  }

  await http.patchForm<BackendComplaintResponse>(`/api/complaints/${id}/status`, fd);
}

export async function assignTechnician(
  complaintId: string | number,
  technicianId: string | number,
): Promise<void> {
  // Convert to number — backend expects Java Long, HTML <select> returns string.
  await http.patch<BackendComplaintResponse>(
    `/api/complaints/${complaintId}/assign`,
    { technicianId: Number(technicianId) },
  );
}

export async function closeComplaint(id: string | number): Promise<void> {
  await http.put<BackendComplaintResponse>(`/api/complaints/${id}/close`);
}

// ─── Technicians ──────────────────────────────────────────────────────────────

export async function getTechnicians(): Promise<Technician[]> {
  const res = await http.get<BackendTechnicianResponse[]>('/api/technicians');
  return res.map(adaptTechnician);
}

/**
 * Creates a technician in two steps:
 * 1. POST /api/auth/admin/create-user — creates a User with role=TECHNICIAN
 * 2. POST /api/technicians          — creates the technician profile record
 *
 * The backend requires the user to already exist with role=TECHNICIAN before
 * a technician profile can be created.  Never create a technician record
 * against an arbitrary STUDENT or STAFF user.
 */
export async function createTechnician(data: {
  name: string;
  email: string;
  password: string;
  department: string;
  phone: string;
  specialization: Category;
}): Promise<void> {
  // Step 1 — create the TECHNICIAN user account
  const userRes = await http.post<BackendUserResponse>('/api/auth/admin/create-user', {
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'TECHNICIAN',
    department: data.department,
    phone: data.phone,
  });

  // Step 2 — create the technician profile record using the real userId
  await http.post<BackendTechnicianResponse>('/api/technicians', {
    userId: Number(userRes.id),
    specialization: categoryToSpecialization(data.specialization),
  });
}

/** Maps frontend Category to the backend TechnicianSpecialization enum value. */
function categoryToSpecialization(category: Category): string {
  const map: Record<Category, string> = {
    ELECTRICAL: 'ELECTRICAL',
    PLUMBING: 'PLUMBING',
    NETWORK: 'NETWORK',
    FURNITURE: 'CARPENTRY_FURNITURE',
    CIVIL: 'CIVIL_MAINTENANCE',
    CLEANING: 'HOUSEKEEPING',
    OTHER: 'GENERAL',
  };
  return map[category] ?? 'GENERAL';
}

export async function updateTechnician(
  id: string | number,
  data: { specialization?: Category; availability?: Availability },
): Promise<void> {
  const body: Record<string, string> = {};
  if (data.specialization) {
    body.specialization = categoryToSpecialization(data.specialization);
  }
  if (data.availability) {
    body.availabilityStatus = toBackendAvailability(data.availability);
  }
  await http.patch<BackendTechnicianResponse>(`/api/technicians/${id}`, body);
}

// ─── Technician tasks ─────────────────────────────────────────────────────────

export async function getMyTasks(): Promise<Complaint[]> {
  const res = await http.get<BackendComplaintResponse[]>('/api/complaints/my-tasks');
  return res.map(adaptComplaint);
}

// ─── Admin — Users ────────────────────────────────────────────────────────────

export async function searchUsers(query: string): Promise<User[]> {
  const encoded = encodeURIComponent(query);
  const res = await http.get<BackendUserResponse[]>(`/api/users/search?query=${encoded}`);
  return res.map(adaptUser);
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
// The backend /api/dashboard/stats provides: totalComplaints, byStatus,
// byCategory, unresolvedCount.
// It does NOT provide by_priority or technician_workload.
// Those are derived here from actual complaint and technician data.

export async function getDashboardStats(
  existingComplaints?: Complaint[],
  existingTechs?: Technician[],
): Promise<DashboardStats> {
  const [backendStats, allComplaints, allTechs] = await Promise.all([
    http.get<BackendDashboardStats>('/api/dashboard/stats'),
    existingComplaints ? Promise.resolve(existingComplaints) : getAllComplaints(),
    existingTechs ? Promise.resolve(existingTechs) : getTechnicians(),
  ]);

  // byStatus from backend (source of truth)
  const byStatus = backendStats.byStatus as Record<ComplaintStatus, number>;

  // by_priority derived from actual complaint list
  const by_priority: Record<string, number> = {};
  for (const c of allComplaints) {
    by_priority[c.priority] = (by_priority[c.priority] ?? 0) + 1;
  }

  // by_category from backend (source of truth); also available from complaints
  const by_category: Record<string, number> = {};
  for (const [k, v] of Object.entries(backendStats.byCategory)) {
    by_category[k] = v;
  }

  // technician_workload derived from actual complaints + technicians
  const technician_workload = allTechs.map((t) => {
    const active = allComplaints.filter(
      (c) => c.technician_id === t.id && c.status !== 'CLOSED' && c.status !== 'RESOLVED',
    ).length;
    return {
      technician_id: t.id,
      name: t.name ?? 'Technician',
      specialization: t.specialization,
      active_tasks: active,
    };
  });

  const totalResolved = (byStatus['RESOLVED'] ?? 0) + (byStatus['CLOSED'] ?? 0);
  const total = backendStats.totalComplaints;

  return {
    total,
    open: byStatus['OPEN'] ?? 0,
    assigned: byStatus['ASSIGNED'] ?? 0,
    in_progress: byStatus['IN_PROGRESS'] ?? 0,
    resolved: byStatus['RESOLVED'] ?? 0,
    closed: byStatus['CLOSED'] ?? 0,
    by_category,
    by_priority,
    unresolved: backendStats.unresolvedCount,
    resolution_rate: total > 0 ? Math.round((totalResolved / total) * 100) : 0,
    technician_workload,
  };
}
