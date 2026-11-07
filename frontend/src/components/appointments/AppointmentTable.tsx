import { Appointment } from '../../types/api';
import StatusBadge from './StatusBadge';

interface Props {
  appointments: Appointment[];
  onStatusUpdate: (id: string, status: string) => void;
}

const STATUSES = ['pending', 'confirmed', 'cancelled'];

export default function AppointmentTable({ appointments, onStatusUpdate }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Patient ID', 'Date & Time', 'Status', 'Notes', 'Change Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {appointments.map(a => (
            <tr key={a.id}>
              <td className="px-4 py-3 text-gray-600 font-mono text-xs">{a.patientId.slice(0, 8)}…</td>
              <td className="px-4 py-3 text-gray-900">{new Date(a.appointmentDate).toLocaleString()}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3 text-gray-500">{a.notes || '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={a.status}
                  onChange={e => onStatusUpdate(a.id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
