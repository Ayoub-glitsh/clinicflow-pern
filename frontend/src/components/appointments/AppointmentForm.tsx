import { useState, useEffect, FormEvent } from 'react';
import api from '../../api/axios';
import { Patient, Appointment } from '../../types/api';
import FieldError from '../shared/FieldError';
import ErrorBanner from '../shared/ErrorBanner';

interface Props {
  appointment?: Appointment; // present → edit mode, absent → create mode
  onClose: () => void;
  onSuccess: () => void;
}

// Convert an ISO datetime string to the value format datetime-local inputs expect
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
const FIELDS = ['patientId', 'appointmentDate', 'notes', 'status'];

export default function AppointmentForm({ appointment, onClose, onSuccess }: Props) {
  const isEdit = Boolean(appointment);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({
    patientId: appointment?.patientId ?? '',
    appointmentDate: appointment ? toDatetimeLocal(appointment.appointmentDate) : '',
    notes: appointment?.notes ?? '',
    status: appointment?.status ?? 'pending',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bannerErrors, setBannerErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/patients', { params: { limit: 100 } })
      .then((r: { data: { data: Patient[] } }) => setPatients(r.data.data));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setBannerErrors([]);
    try {
      if (isEdit) {
        await api.put(`/appointments/${appointment!.id}`, {
          patientId: form.patientId || undefined,
          appointmentDate: form.appointmentDate ? new Date(form.appointmentDate).toISOString() : undefined,
          notes: form.notes || undefined,
          status: form.status,
        });
      } else {
        await api.post('/appointments', {
          patientId: form.patientId,
          appointmentDate: new Date(form.appointmentDate).toISOString(),
          notes: form.notes || undefined,
        });
      }
      onSuccess();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.details) {
        const fe: Record<string, string> = {};
        const orphans: string[] = [];
        for (const d of data.details) {
          if (FIELDS.includes(d.field)) fe[d.field] = d.message;
          else orphans.push(`${d.field}: ${d.message}`);
        }
        setFieldErrors(fe);
        setBannerErrors(orphans.length ? orphans : [`${data.details.length} error(s) — see highlighted fields`]);
      } else {
        setBannerErrors([data?.error || 'An error occurred. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? 'Edit Appointment' : 'New Appointment'}
        </h3>
        {bannerErrors.length > 0 && (
          <ErrorBanner message={bannerErrors.join(' • ')} onDismiss={() => setBannerErrors([])} />
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              value={form.patientId}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 text-sm ${fieldErrors.patientId ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select a patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.cin})</option>
              ))}
            </select>
            <FieldError message={fieldErrors.patientId} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={form.appointmentDate}
              onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 text-sm ${fieldErrors.appointmentDate ? 'border-red-400' : 'border-gray-300'}`}
            />
            <FieldError message={fieldErrors.appointmentDate} />
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof form.status }))}
                className={`w-full border rounded-md px-3 py-2 text-sm ${fieldErrors.status ? 'border-red-400' : 'border-gray-300'}`}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FieldError message={fieldErrors.status} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save changes' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
