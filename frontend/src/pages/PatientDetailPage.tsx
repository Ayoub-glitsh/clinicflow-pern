import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Patient, Appointment } from '../types/api';
import Spinner from '../components/shared/Spinner';
import ErrorBanner from '../components/shared/ErrorBanner';

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}`),
      api.get('/appointments', { params: { limit: 100 } }),
    ]).then(([pr, ar]) => {
      setPatient(pr.data);
      setAppointments((ar.data.data as Appointment[]).filter((a: Appointment) => a.patientId === id));
    }).catch(() => setError('Failed to load patient details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!patient) return null;

  return (
    <div>
      <Link to="/patients" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Back to Patients
      </Link>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{patient.fullName}</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {([
            ['CIN', patient.cin],
            ['Phone', patient.phone],
            ['Birth Date', new Date(patient.birthDate).toLocaleDateString()],
            ['Registered', new Date(patient.createdAt).toLocaleDateString()],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k}>
              <dt className="font-medium text-gray-500">{k}</dt>
              <dd className="text-gray-900 mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointments ({appointments.length})</h3>
      {appointments.length === 0 ? (
        <p className="text-gray-500 text-sm">No appointments yet.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{new Date(a.appointmentDate).toLocaleString()}</p>
                {a.notes && <p className="text-sm text-gray-500 mt-0.5">{a.notes}</p>}
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
