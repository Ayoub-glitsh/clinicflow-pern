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
        date: dateFilter || undefined,
        status: statusFilter || undefined,
      },
    })
      .then((r: { data: PaginatedResponse<Appointment> }) => setData(r.data))
      .catch(() => setError('Failed to load appointments. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, dateFilter, statusFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

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
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter(''); setPage(1); }}
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
