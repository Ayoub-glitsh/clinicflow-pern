import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Appointment, PaginatedResponse } from '../types/api';
import Spinner from '../components/shared/Spinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import Pagination from '../components/shared/Pagination';
import AppointmentTable from '../components/appointments/AppointmentTable';
import AppointmentForm from '../components/appointments/AppointmentForm';

export default function AppointmentsPage() {
  const [data, setData] = useState<PaginatedResponse<Appointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // undefined = form closed, null = create mode, Appointment = edit mode
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null | undefined>(undefined);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/appointments', {
      params: {
        page,
        limit: 10,
        patientName: patientNameFilter || undefined,
        date: dateFilter || undefined,
        status: statusFilter || undefined,
      },
    })
      .then((r: { data: PaginatedResponse<Appointment> }) => setData(r.data))
      .catch(() => setError('Failed to load appointments. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, patientNameFilter, dateFilter, statusFilter]);

  // Debounce the patient name search — wait 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(fetchAppointments, 300);
    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this appointment? This action cannot be undone.')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete appointment.');
    }
  };

  const hasActiveFilters = patientNameFilter || dateFilter || statusFilter;

  const clearFilters = () => {
    setPatientNameFilter('');
    setDateFilter('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <button
          onClick={() => setEditingAppointment(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          + New Appointment
        </button>
      </div>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        {/* Patient name search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={patientNameFilter}
            onChange={e => { setPatientNameFilter(e.target.value); setPage(1); }}
            placeholder="Search by patient name..."
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>

        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? <Spinner /> : (
        <>
          <AppointmentTable
            appointments={data?.data || []}
            onStatusUpdate={handleStatusUpdate}
            onEdit={appt => setEditingAppointment(appt)}
            onDelete={handleDelete}
          />
          <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
      {editingAppointment !== undefined && (
        <AppointmentForm
          appointment={editingAppointment ?? undefined}
          onClose={() => setEditingAppointment(undefined)}
          onSuccess={() => { setEditingAppointment(undefined); fetchAppointments(); }}
        />
      )}
    </div>
  );
}
