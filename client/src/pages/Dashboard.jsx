import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboard.js';
import { Link } from 'react-router-dom';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';
import { Users, BookOpen, CalendarCheck, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useSchoolProfile } from '../hooks/useSchoolProfile.js';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });
  const { data: profile } = useSchoolProfile();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <div className="text-red-500 text-sm">Failed to load dashboard: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{profile?.school_name || 'Dashboard'}</h1>
        <p className="text-sm text-gray-500 mt-1">{profile?.tagline || 'Overview of your school'}{profile?.academic_year ? ` · ${profile.academic_year}` : ''}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students"   value={data.totalStudents}   icon={Users}          color="bg-blue-500" />
        <StatCard label="Classes"           value={data.totalClasses}    icon={BookOpen}       color="bg-purple-500" />
        <StatCard label="Present Today"     value={data.presentToday}    icon={CalendarCheck}  color="bg-green-500"
          sub={data.absentToday ? `${data.absentToday} absent` : null} />
        <StatCard label="Outstanding Fees"  value={`$${(data.totalOutstanding || 0).toLocaleString()}`} icon={DollarSign} color="bg-orange-500"
          sub={`${data.pendingFees} unpaid records`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <TrendingUp size={16} /> Recently Added Students
            </div>
            <Link to="/students" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentStudents.length === 0 && <p className="text-sm text-gray-500 px-5 py-4">No students yet.</p>}
            {data.recentStudents.map(s => (
              <Link key={s.id} to={`/students/${s.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <div className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</div>
                  <div className="text-xs text-gray-500">{s.email || '—'}</div>
                </div>
                <Badge label={s.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent fees */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <AlertCircle size={16} /> Recent Fee Records
            </div>
            <Link to="/fees" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentFees.length === 0 && <p className="text-sm text-gray-500 px-5 py-4">No fees yet.</p>}
            {data.recentFees.map(f => (
              <div key={f.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{f.first_name} {f.last_name}</div>
                  <div className="text-xs text-gray-500">{f.fee_type} — ${f.amount_due}</div>
                </div>
                <Badge label={f.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
