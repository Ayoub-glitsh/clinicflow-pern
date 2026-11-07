import { useState, FormEvent } from 'react';
import api from '../../api/axios';
import { Patient } from '../../types/api';
import FieldError from '../shared/FieldError';
import ErrorBanner from '../shared/ErrorBanner';

interface Props {
  patient: Patient | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PatientForm({ patient, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    fullName: patient?.fullName || '',
    cin: patient?.cin || '',
    birthDate: patient?.birthDate ? patient.birthDate.slice(0, 10) : '',
    phone: patient?.phone || '',
    address: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bannerErrors, setBannerErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const FIELDS = ['fullName', 'cin', 'birthDate', 'phone', 'address'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setBannerErrors([]);
    try {
      if (patient) {
        await api.put(`/patients/${patient.id}`, form);
      } else {
        await api.post('/patients', form);
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
        if (orphans.length) setBannerErrors(orphans);
        else setBannerErrors([`${data.details.length} error(s) — see highlighted fields`]);
      } else {
        setBannerErrors([data?.error || 'An error occurred. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors[name] ? 'border-red-400' : 'border-gray-300'}`}
      />
      <FieldError message={fieldErrors[name]} />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{patient ? 'Edit Patient' : 'New Patient'}</h3>
        {bannerErrors.length > 0 && <ErrorBanner message={bannerErrors.join(' • ')} onDismiss={() => setBannerErrors([])} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('fullName', 'Full Name')}
          {field('cin', 'CIN')}
          {field('birthDate', 'Birth Date', 'date')}
          {field('phone', 'Phone')}
          {field('address', 'Address (optional)')}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
