import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClasses, fetchClassStudents } from '../../api/classes.js';
import { fetchAttendance, bulkUpsertAttendance } from '../../api/attendance.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Save, CheckSquare, XSquare, CalendarCheck, ClipboardList, BarChart2 } from 'lucide-react';

const TABS = [
  { to: '/attendance',          label: 'Mark Attendance', icon: CalendarCheck },
  { to: '/attendance/register', label: 'Register',        icon: ClipboardList },
  { to: '/attendance/report',   label: 'Report',          icon: BarChart2 },
];

const today = new Date().toISOString().split('T')[0];
const STATUSES = ['present', 'absent', 'late', 'excused'];

export default function AttendanceSheet() {
  const location = useLocation();
  const qc = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: classesData } = useQuery({ queryKey: ['classes', {}], queryFn: () => fetchClasses() });
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: () => fetchClassStudents(selectedClass),
    enabled: Boolean(selectedClass),
  });

  // Load existing attendance for this class+date
  useQuery({
    queryKey: ['attendance', selectedClass, date],
    queryFn: async () => {
      const rows = await fetchAttendance({ class_id: selectedClass, date });
      const map = {};
      for (const r of rows) map[r.student_id] = r.status;
      setRecords(map);
      return rows;
    },
    enabled: Boolean(selectedClass && date),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => bulkUpsertAttendance(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const classes = classesData?.data || [];

  const setStatus = (student_id, status) => setRecords(r => ({ ...r, [student_id]: status }));

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s.id] = status; });
    setRecords(map);
  };

  const handleSave = () => {
    if (!selectedClass || !date) return;
    const filled = students.map(s => ({ student_id: s.id, status: records[s.id] || 'present' }));
    saveMutation.mutate({ class_id: Number(selectedClass), date, records: filled });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Mark attendance for a class by date</p>
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

      {/* Controls */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Class</label>
          <select className="input w-52" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setRecords({}); }}>
            <option value="">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input w-44" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        {selectedClass && students.length > 0 && (
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => markAll('present')}>
              <CheckSquare size={13} /> All Present
            </button>
            <button className="btn-secondary btn-sm" onClick={() => markAll('absent')}>
              <XSquare size={13} /> All Absent
            </button>
          </div>
        )}
        {selectedClass && students.length > 0 && (
          <button className="btn-primary btn-sm ml-auto" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save size={13} /> {saveMutation.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save Attendance'}
          </button>
        )}
      </div>

      {/* Attendance grid */}
      {selectedClass && (
        <div className="card overflow-hidden">
          {studentsLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : students.length === 0 ? (
            <p className="text-sm text-gray-500 px-5 py-4">No students in this class.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Student</th>
                    {STATUSES.map(s => (
                      <th key={s} className="table-header text-center capitalize">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map(s => (
                    <tr key={s.id} className={`hover:bg-gray-50 ${records[s.id] === 'absent' ? 'bg-red-50' : ''}`}>
                      <td className="table-cell font-medium">{s.first_name} {s.last_name}</td>
                      {STATUSES.map(st => (
                        <td key={st} className="table-cell text-center">
                          <input
                            type="radio"
                            name={`att-${s.id}`}
                            checked={records[s.id] === st}
                            onChange={() => setStatus(s.id, st)}
                            className="accent-blue-600 w-4 h-4 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="card flex items-center justify-center py-20 text-gray-400 text-sm">
          Select a class above to take attendance
        </div>
      )}
    </div>
  );
}
