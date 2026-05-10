import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Link2,
  CalendarCheck, DollarSign, X, Settings, LogOut
} from 'lucide-react';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.js';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/students',    label: 'Students',     icon: Users },
  { to: '/classes',     label: 'Classes',      icon: BookOpen },
  { to: '/assignments', label: 'Assignments',  icon: Link2 },
  { to: '/attendance',  label: 'Attendance',   icon: CalendarCheck },
  { to: '/fees',        label: 'Fees',         icon: DollarSign },
];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export default function Sidebar({ onClose }) {
  const { data: profile } = useSchoolProfile();
  const { auth, logout } = useAuth();
  const schoolName = profile?.school_name || auth?.tenantName || 'SchoolMS';
  const initial = schoolName.charAt(0).toUpperCase();

  const user = auth?.user;
  const fullName = user
    ? [(user.first_name || user.firstName), (user.last_name || user.lastName)].filter(Boolean).join(' ') || user.email
    : '';
  const userInitial = fullName.charAt(0).toUpperCase();
  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role ?? '';

  return (
    <aside className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
        <Link to="/profile" onClick={onClose} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">{initial}</div>
          <span className="font-semibold text-sm truncate">{schoolName}</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white ml-2 flex-shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{fullName}</p>
              <p className="text-xs text-gray-400">{roleLabel}</p>
            </div>
          </div>
        )}
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <Settings size={16} />
          School Profile
        </NavLink>
        <button
          onClick={() => { onClose?.(); logout(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
