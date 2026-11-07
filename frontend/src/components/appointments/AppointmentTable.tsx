import { Appointment } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from './StatusBadge';

interface Props {
  appointments: Appointment[];
  onStatusUpdate: (id: string, status: string) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const STATUSES = ['pending', 'confirmed', 'cancelled'];

export default function AppointmentTable({ appointments, onStatusUpdate, onEdit, onDelete }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Patient Name', 'Date & Time', 'Status', 'Notes', 'Change Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                No appointments found.
              </td>
            </tr>
          ) : appointments.map(a => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-medium">{a.patient?.fullName ?? '—'}</td>
              <td className="px-4 py-3 text-gray-900">{new Date(a.appointmentDate).toLocaleString()}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.notes || '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={a.status}
                  onChange={e => onStatusUpdate(a.id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 flex items-center gap-2">
                <button
                  onClick={() => onEdit(a)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                >
                  Edit
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onDelete(a.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
