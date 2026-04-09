import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchClass, fetchClassStudents } from '../../api/classes.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { ArrowLeft, Pencil, Users, DollarSign, Clock } from 'lucide-react';

function calcDuration(from, to) {
  if (!from) return null;
  const start = new Date(from);
  const end = to ? new Date(to) : new Date();
  const days = Math.max(0, Math.round((end - start) / 86400000));
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  const months = Math.round(days / 30.44);
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12), m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const { data: cls, isLoading } = useQuery({ queryKey: ['class', id], queryFn: () => fetchClass(id) });
  const { data: students = [] } = useQuery({
    queryKey: ['class-students', id, showAll],
    queryFn: () => fetchClassStudents(id, showAll ? {} : { active: 1 }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!cls) return <div className="text-red-500">Class not found.</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 mt-1"><ArrowLeft size={18} /></button>
        <div className="flex-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
            <p className="text-sm text-gray-500">{cls.teacher_name || '—'} · Room {cls.room_number || '—'} · {cls.academic_year}</p>
          </div>
          <Link to={`/classes/${id}/edit`} className="btn-secondary btn-sm flex-shrink-0"><Pencil size={13} /> Edit</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Grade', cls.grade_level || '—'],
          ['Section', cls.section || '—'],
          ['Subject', cls.subject || 'Homeroom'],
          ['Capacity', `${cls.student_count}/${cls.capacity}`],
        ].map(([l, v]) => (
          <div key={l} className="card p-4 text-center">
            <div className="text-xl font-bold text-gray-900">{v}</div>
            <div className="text-xs text-gray-500 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Fee Structure */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <DollarSign size={16} /> Tuition Fee Structure
          </div>
          <Link to={`/classes/${id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
        </div>
        {cls.fee_amount ? (
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">${Number(cls.fee_amount).toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">Fee Amount</div>
            </div>
            {cls.billing_frequency && (
              <div>
                <div className="text-sm font-semibold text-indigo-700 capitalize bg-indigo-50 px-3 py-1 rounded-full">
                  {cls.billing_frequency.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 text-center">Billed</div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No tuition fee configured. <Link to={`/classes/${id}/edit`} className="text-blue-600 hover:underline">Set a fee</Link>.</p>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Users size={16} /> Students ({students.length})
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button onClick={() => setShowAll(false)} className={`px-3 py-1 ${!showAll ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Active</button>
              <button onClick={() => setShowAll(true)}  className={`px-3 py-1 ${showAll  ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>All</button>
            </div>
            <Link to="/assignments" className="text-xs text-blue-600 hover:underline">Manage</Link>
          </div>
        </div>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-4">No students {showAll ? 'found' : 'currently enrolled'}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header hidden md:table-cell">Email</th>
                  <th className="table-header hidden sm:table-cell">Enrolled</th>
                  <th className="table-header hidden sm:table-cell">Left</th>
                  <th className="table-header hidden md:table-cell">Duration</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(s => {
                  const active = !s.class_disenrolled_on;
                  const dur = calcDuration(s.class_enrolled_on, s.class_disenrolled_on);
                  return (
                    <tr key={s.assignment_id} className={`hover:bg-gray-50 ${!active ? 'opacity-60' : ''}`}>
                      <td className="table-cell">
                        <Link to={`/students/${s.id}`} className="font-medium text-blue-600 hover:underline">{s.first_name} {s.last_name}</Link>
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-500">{s.email || '—'}</td>
                      <td className="table-cell hidden sm:table-cell text-xs text-gray-500">{s.class_enrolled_on || '—'}</td>
                      <td className="table-cell hidden sm:table-cell text-xs text-gray-500">{s.class_disenrolled_on || '—'}</td>
                      <td className="table-cell hidden md:table-cell">
                        {dur && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={11} />{dur}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <Badge label={active ? 'Active' : 'Left'} variant={active ? 'active' : 'inactive'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
