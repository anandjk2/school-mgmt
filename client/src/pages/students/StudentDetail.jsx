import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchStudent, fetchStudentAttendance, fetchStudentFees } from '../../api/students.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { ArrowLeft, Pencil, BookOpen, CalendarCheck, DollarSign, Clock } from 'lucide-react';

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

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: student, isLoading } = useQuery({ queryKey: ['student', id], queryFn: () => fetchStudent(id) });
  const { data: attendance = [] } = useQuery({ queryKey: ['student-attendance', id], queryFn: () => fetchStudentAttendance(id, { from: '' }) });
  const { data: fees = [] } = useQuery({ queryKey: ['student-fees', id], queryFn: () => fetchStudentFees(id) });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!student) return <div className="text-red-500">Student not found.</div>;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : null;
  const totalDue  = fees.reduce((s, f) => s + f.amount_due, 0);
  const totalPaid = fees.reduce((s, f) => s + f.amount_paid, 0);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 mt-1">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.first_name} {student.last_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{student.email || '—'}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge label={student.status} />
            <Link to={`/students/${id}/edit`} className="btn-secondary btn-sm"><Pencil size={13} /> Edit</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info */}
        <div className="card p-5 space-y-3 lg:col-span-1">
          <h2 className="font-semibold text-gray-900 text-sm">Profile Details</h2>
          {[
            ['Date of Birth', student.date_of_birth],
            ['Gender', student.gender],
            ['Phone', student.phone],
            ['Address', student.address],
            ['Enrolled On', student.enrolled_on],
          ].map(([l, v]) => v ? (
            <div key={l}>
              <div className="text-xs text-gray-400 uppercase">{l}</div>
              <div className="text-sm text-gray-700">{v}</div>
            </div>
          ) : null)}
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <BookOpen size={18} className="mx-auto text-purple-500 mb-1" />
              <div className="text-xl font-bold">{student.classes?.length ?? 0}</div>
              <div className="text-xs text-gray-500">Classes</div>
            </div>
            <div className="card p-4 text-center">
              <CalendarCheck size={18} className="mx-auto text-green-500 mb-1" />
              <div className="text-xl font-bold">{attendancePct !== null ? `${attendancePct}%` : '—'}</div>
              <div className="text-xs text-gray-500">Attendance</div>
            </div>
            <div className="card p-4 text-center">
              <DollarSign size={18} className="mx-auto text-orange-500 mb-1" />
              <div className="text-xl font-bold">${(totalDue - totalPaid).toLocaleString()}</div>
              <div className="text-xs text-gray-500">Outstanding</div>
            </div>
          </div>

          {/* Classes */}
          <div className="card">
            <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">Classes</div>
            {(student.classes || []).length === 0 ? (
              <p className="text-sm text-gray-500 px-4 py-3">Not enrolled in any class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-header">Class</th>
                      <th className="table-header hidden sm:table-cell">Enrolled</th>
                      <th className="table-header hidden sm:table-cell">Left</th>
                      <th className="table-header hidden md:table-cell">Duration</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {student.classes.map(c => {
                      const active = !c.disenrolled_on;
                      const dur = calcDuration(c.enrolled_on, c.disenrolled_on);
                      return (
                        <tr key={c.assignment_id} className={`hover:bg-gray-50 ${!active ? 'opacity-60' : ''}`}>
                          <td className="table-cell">
                            <Link to={`/classes/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.name}</Link>
                            <div className="text-xs text-gray-400">{c.teacher_name || '—'}</div>
                          </td>
                          <td className="table-cell hidden sm:table-cell text-xs text-gray-500">{c.enrolled_on || '—'}</td>
                          <td className="table-cell hidden sm:table-cell text-xs text-gray-500">{c.disenrolled_on || '—'}</td>
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

          {/* Recent fees */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-900">Fees</span>
              <Link to={`/fees?student_id=${id}`} className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {fees.length === 0 ? (
              <p className="text-sm text-gray-500 px-4 py-3">No fee records.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {fees.slice(0, 5).map(f => (
                  <div key={f.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{f.fee_type}</div>
                      <div className="text-xs text-gray-500">Due: {f.due_date || '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${f.amount_due}</div>
                      <Badge label={f.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
