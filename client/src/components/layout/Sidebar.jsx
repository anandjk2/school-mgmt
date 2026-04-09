import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Link2,
  CalendarCheck, DollarSign, X, Settings
} from 'lucide-react';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.js';

const links = [
  { to: '/dashboard',          label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/students',           label: 'Students',     icon: Users },
  { to: '/classes',            label: 'Classes',      icon: BookOpen },
  { to: '/assignments',        label: 'Assignments',  icon: Link2 },
  { to: '/attendance',         label: 'Attendance',   icon: CalendarCheck },
  { to: '/fees',               label: 'Fees',         icon: DollarSign },
];

export default function Sidebar({ onClose }) {
  const { data: profile } = useSchoolProfile();
  const schoolName = profile?.school_name || 'SchoolMS';
  const initial = schoolName.charAt(0).toUpperCase();

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
      </div>
    </aside>
  );
}
