import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStudents } from '../../api/students.js';
import { fetchClasses, fetchClassStudents } from '../../api/classes.js';
import { fetchAttendance } from '../../api/attendance.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { CalendarCheck, ClipboardList, BarChart2 } from 'lucide-react';

const TABS = [
  { to: '/attendance',          label: 'Mark Attendance', icon: CalendarCheck },
  { to: '/attendance/register', label: 'Register',        icon: ClipboardList },
  { to: '/attendance/report',   label: 'Report',          icon: BarChart2 },
];

export default function AttendanceReport() {
  const location = useLocation();
  const [classId, setClassId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [studentId, setStudentId] = useState('');

  const { data: classesData } = useQuery({ queryKey: ['classes', {}], queryFn: () => fetchClasses() });
  const { data: allStudentsData } = useQuery({ queryKey: ['students', {}], queryFn: () => fetchStudents() });
  const { data: classStudents = [] } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => fetchClassStudents(classId),
    enabled: Boolean(classId),
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance-report', { classId, from, to, studentId }],
    queryFn: () => fetchAttendance({ class_id: classId, from, to, student_id: studentId }),
    enabled: Boolean(from && to),
  });

  const classes = classesData?.data || [];
  // When a class is selected, limit student picker to students in that class
  const students = classId ? classStudents : (allStudentsData?.data || []);

  const handleClassChange = (val) => { setClassId(val); setStudentId(''); };

  // Aggregate by student
  const byStudent = {};
  for (const r of records) {
    if (!byStudent[r.student_id]) {
      byStudent[r.student_id] = { first_name: r.first_name, last_name: r.last_name, present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    }
    byStudent[r.student_id][r.status]++;
    byStudent[r.student_id].total++;
  }
  const rows = Object.entries(byStudent).map(([id, v]) => ({ id, ...v, pct: Math.round((v.present / v.total) * 100) }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Summarized attendance by student and date range</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              location.pathname === to
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Class (optional)</label>
          <select className="input w-56" value={classId} onChange={e => handleClassChange(e.target.value)}>
            <option value="">All classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">From</label>
          <input className="input w-44" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <input className="input w-44" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div>
          <label className="label">Student (optional)</label>
          <select className="input w-52" value={studentId} onChange={e => setStudentId(e.target.value)}>
            <option value="">{classId ? 'All in class' : 'All students'}</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
      </div>

      {!from || !to ? (
        <div className="card flex items-center justify-center py-16 text-gray-400 text-sm">
          Select a date range to view the report
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : rows.length === 0 ? (
        <div className="card flex items-center justify-center py-16 text-gray-400 text-sm">
          No attendance records for this period
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Student</th>
                <th className="table-header text-center">Present</th>
                <th className="table-header text-center">Absent</th>
                <th className="table-header text-center">Late</th>
                <th className="table-header text-center">Excused</th>
                <th className="table-header text-center">Total</th>
                <th className="table-header text-center">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.sort((a, b) => b.pct - a.pct).map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <Link to={`/students/${r.id}`} className="font-medium text-blue-600 hover:underline">
                      {r.first_name} {r.last_name}
                    </Link>
                  </td>
                  <td className="table-cell text-center text-green-700 font-medium">{r.present}</td>
                  <td className="table-cell text-center text-red-600 font-medium">{r.absent}</td>
                  <td className="table-cell text-center text-yellow-600 font-medium">{r.late}</td>
                  <td className="table-cell text-center text-blue-600 font-medium">{r.excused}</td>
                  <td className="table-cell text-center text-gray-600">{r.total}</td>
                  <td className="table-cell text-center">
                    <span className={`font-semibold ${r.pct >= 90 ? 'text-green-600' : r.pct >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {r.pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
