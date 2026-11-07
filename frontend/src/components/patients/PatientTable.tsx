import { Patient } from '../../types/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onViewDetail: (id: string) => void;
}

export default function PatientTable({ patients, onEdit, onDelete, onViewDetail }: Props) {
  const { user } = useAuth();
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Name', 'CIN', 'Phone', 'Birth Date', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {patients.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{p.fullName}</td>
              <td className="px-4 py-3 text-gray-600">{p.cin}</td>
              <td className="px-4 py-3 text-gray-600">{p.phone}</td>
              <td className="px-4 py-3 text-gray-600">{new Date(p.birthDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 flex gap-2">
                <button onClick={() => onViewDetail(p.id)} className="text-blue-600 hover:underline">View</button>
                <button onClick={() => onEdit(p)} className="text-green-600 hover:underline">Edit</button>
                {user?.role === 'admin' && (
                  <button onClick={() => onDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
