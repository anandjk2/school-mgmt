import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchClasses, fetchClassStudents } from '../../api/classes.js';
import { fetchAttendance } from '../../api/attendance.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { ClipboardList, CalendarCheck, BarChart2 } from 'lucide-react';

// Default to current month
const now = new Date();
const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

const STATUS_STYLE = {
  present: 'bg-green-100 text-green-700',
  absent:  'bg-red-100 text-red-700',
  late:    'bg-yellow-100 text-yellow-700',
  excused: 'bg-blue-100 text-blue-700',
};
const STATUS_ABBR = { present: 'P', absent: 'A', late: 'L', excused: 'E' };

function dateRange(from, to) {
  const dates = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

const dayLabel = (d) => {
  const dt = new Date(d);
  return { day: dt.getDate(), dow: ['Su','Mo','Tu','We','Th','Fr','Sa'][dt.getDay()] };
};

const TABS = [
  { to: '/attendance',          label: 'Mark Attendance', icon: CalendarCheck },
  { to: '/attendance/register', label: 'Register',        icon: ClipboardList },
  { to: '/attendance/report',   label: 'Report',          icon: BarChart2 },
];

export default function AttendanceRegister() {
  const location = useLocation();
  const [selectedClass, setSelectedClass] = useState('');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const { data: classesData } = useQuery({ queryKey: ['classes', {}], queryFn: () => fetchClasses() });
  const classes = classesData?.data || [];

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: () => fetchClassStudents(selectedClass, { active: 1 }),
    enabled: Boolean(selectedClass),
  });

  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['attendance-register', selectedClass, from, to],
    queryFn: () => fetchAttendance({ class_id: selectedClass, from, to }),
    enabled: Boolean(selectedClass && from && to),
  });

  // Build pivot: { student_id: { date: status } }
  const pivot = useMemo(() => {
    const p = {};
    for (const r of records) {
      if (!p[r.student_id]) p[r.student_id] = {};
      p[r.student_id][r.date] = r.status;
    }
    return p;
  }, [records]);

  const dates = useMemo(() => (from && to ? dateRange(from, to) : []), [from, to]);

  // Per-student totals
  const studentTotals = useMemo(() =>
    students.map(s => {
      const row = pivot[s.id] || {};
      const vals = dates.map(d => row[d]).filter(Boolean);
      return {
        present:  vals.filter(v => v === 'present').length,
        absent:   vals.filter(v => v === 'absent').length,
        late:     vals.filter(v => v === 'late').length,
        excused:  vals.filter(v => v === 'excused').length,
        recorded: vals.length,
      };
    }),
    [students, pivot, dates]
  );

  // Per-date present counts
  const dateTotals = useMemo(() =>
    dates.map(d => ({
      present: records.filter(r => r.date === d && r.status === 'present').length,
      total:   students.length,
    })),
    [dates, records, students]
  );

  const isLoading = studentsLoading || recordsLoading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">View the full attendance register for a class</p>
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

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Class</label>
          <select className="input w-56" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select class…</option>
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
      </div>

      {!selectedClass ? (
        <div className="card flex items-center justify-center py-20 text-gray-400 text-sm">
          Select a class to view its attendance register
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : students.length === 0 ? (
        <div className="card flex items-center justify-center py-16 text-gray-400 text-sm">
          No active students in this class
        </div>
      ) : (
        <div className="card overflow-x-auto">
          {/* Legend */}
          <div className="px-5 pt-4 pb-2 flex items-center gap-4 flex-wrap text-xs text-gray-500 border-b border-gray-100">
            <span className="font-medium text-gray-700">Legend:</span>
            {Object.entries(STATUS_ABBR).map(([s, a]) => (
              <span key={s} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${STATUS_STYLE[s]}`}>
                {a} = {s}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-400">
              — = no record
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              {/* Month/date header */}
              <tr>
                <th className="table-header sticky left-0 bg-gray-50 z-10 min-w-[160px]">Student</th>
                {dates.map((d, i) => {
                  const { day, dow } = dayLabel(d);
                  const isWeekend = dow === 'Sa' || dow === 'Su';
                  return (
                    <th key={d} className={`table-header text-center min-w-[40px] px-1 ${isWeekend ? 'bg-gray-100 text-gray-400' : ''}`}>
                      <div className="text-xs font-bold">{day}</div>
                      <div className="text-[10px] font-normal text-gray-400">{dow}</div>
                    </th>
                  );
                })}
                <th className="table-header text-center bg-blue-50 text-blue-700 min-w-[48px]">P</th>
                <th className="table-header text-center bg-red-50 text-red-700 min-w-[48px]">A</th>
                <th className="table-header text-center bg-yellow-50 text-yellow-700 min-w-[48px]">L</th>
                <th className="table-header text-center bg-blue-50 text-blue-600 min-w-[48px]">E</th>
                <th className="table-header text-center min-w-[56px]">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s, idx) => {
                const row = pivot[s.id] || {};
                const t = studentTotals[idx];
                const rate = t.recorded > 0 ? Math.round((t.present / t.recorded) * 100) : null;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-cell sticky left-0 bg-white z-10 font-medium">
                      <Link to={`/students/${s.id}`} className="text-blue-600 hover:underline">
                        {s.last_name}, {s.first_name}
                      </Link>
                    </td>
                    {dates.map(d => {
                      const status = row[d];
                      const { dow } = dayLabel(d);
                      const isWeekend = dow === 'Sa' || dow === 'Su';
                      return (
                        <td key={d} className={`table-cell text-center px-1 ${isWeekend ? 'bg-gray-50' : ''}`}>
                          {status ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${STATUS_STYLE[status]}`}>
                              {STATUS_ABBR[status]}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="table-cell text-center text-green-700 font-medium bg-green-50">{t.present || '—'}</td>
                    <td className="table-cell text-center text-red-600 font-medium bg-red-50">{t.absent || '—'}</td>
                    <td className="table-cell text-center text-yellow-600 font-medium bg-yellow-50">{t.late || '—'}</td>
                    <td className="table-cell text-center text-blue-600 font-medium bg-blue-50">{t.excused || '—'}</td>
                    <td className="table-cell text-center">
                      {rate !== null ? (
                        <span className={`font-semibold ${rate >= 90 ? 'text-green-600' : rate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {rate}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer: per-date present count */}
            <tfoot className="border-t-2 border-gray-300 bg-gray-50">
              <tr>
                <td className="table-cell sticky left-0 bg-gray-50 z-10 font-semibold text-gray-600 text-xs uppercase">Present</td>
                {dateTotals.map((dt, i) => (
                  <td key={dates[i]} className="table-cell text-center text-xs font-semibold text-gray-600">
                    {dt.present > 0 ? dt.present : <span className="text-gray-300">—</span>}
                  </td>
                ))}
                <td colSpan={5} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
