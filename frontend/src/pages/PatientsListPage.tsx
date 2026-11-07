import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Patient, PaginatedResponse } from '../types/api';
import Spinner from '../components/shared/Spinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import Pagination from '../components/shared/Pagination';
import PatientTable from '../components/patients/PatientTable';
import PatientForm from '../components/patients/PatientForm';

export default function PatientsListPage() {
  const [data, setData] = useState<PaginatedResponse<Patient> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // undefined = form closed, null = new patient, Patient = edit mode
  const [editingPatient, setEditingPatient] = useState<Patient | null | undefined>(undefined);
  const navigate = useNavigate();

  const fetchPatients = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/patients', { params: { page, limit: 10, search: search || undefined } })
      .then((r: { data: PaginatedResponse<Patient> }) => setData(r.data))
      .catch(() => setError('Failed to load patients. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch {
      setError('Failed to delete patient.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
        <button
          onClick={() => setEditingPatient(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          + Add Patient
        </button>
      </div>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or CIN..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {loading ? <Spinner /> : (
        <>
          <PatientTable
            patients={data?.data || []}
            onEdit={p => setEditingPatient(p)}
            onDelete={handleDelete}
            onViewDetail={id => navigate(`/patients/${id}`)}
          />
          <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
      {editingPatient !== undefined && (
        <PatientForm
          patient={editingPatient}
          onClose={() => setEditingPatient(undefined)}
          onSuccess={() => { setEditingPatient(undefined); fetchPatients(); }}
        />
      )}
    </div>
  );
}
