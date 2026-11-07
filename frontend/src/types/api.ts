// Shared TypeScript interfaces for API response shapes.

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface Patient {
  id: string;
  fullName: string;
  cin: string;
  birthDate: string;
  phone: string;
  address: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  createdBy: string | null;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  createdAt: string;
  patient?: { fullName: string } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingCount: number;
  confirmedCount: number;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  details?: ValidationErrorDetail[];
}
