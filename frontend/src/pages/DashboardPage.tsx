import { useEffect, useState } from 'react';
import api from '../api/axios';
import Spinner from '../components/shared/Spinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import { DashboardStats } from '../types/api';

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r: { data: DashboardStats }) => setStats(r.data))
      .catch(() => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Total Patients" value={stats!.totalPatients} color="border-blue-500" />
        <StatCard label="Appointments Today" value={stats!.appointmentsToday} color="border-green-500" />
        <StatCard label="Pending" value={stats!.pendingCount} color="border-yellow-500" />
        <StatCard label="Confirmed" value={stats!.confirmedCount} color="border-purple-500" />
      </div>
    </div>
  );
}
