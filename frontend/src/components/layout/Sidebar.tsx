import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/patients', label: 'Patients' },
  { to: '/appointments', label: 'Appointments' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold">ClinicFlow</h1>
        <p className="text-blue-300 text-sm mt-1">{user?.email}</p>
        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-700 rounded-full capitalize">{user?.role}</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-blue-200 hover:bg-blue-800 rounded-md text-left transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
