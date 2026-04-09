import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClasses } from '../../api/classes.js';
import { fetchStudents } from '../../api/students.js';
import { fetchClassStudents } from '../../api/classes.js';
import { createAssignment, disenrollAssignment, reenrollAssignment } from '../../api/assignments.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { UserPlus, UserMinus, UserCheck, ChevronRight, Clock } from 'lucide-react';

function calcDuration(from, to) {
  if (!from) return '—';
  const start = new Date(from);
  const end   = to ? new Date(to) : new Date();
  const days  = Math.max(0, Math.floor((end - start) / 86400000));
  if (days < 7)  return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y ${months % 12}mo`;
}

export default function AssignmentManager() {
  const qc = useQueryClient();
  const [selectedClass, setSelectedClass] = useState(null);
  const [search, setSearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const { data: classesData } = useQuery({ queryKey: ['classes', {}], queryFn: () => fetchClasses() });
  const { data: studentsData } = useQuery({ queryKey: ['students', { search, status: 'active' }], queryFn: () => fetchStudents({ search, status: 'active' }) });
  const { data: allEnrolled = [], isLoading: enrolledLoading } = useQuery({
    queryKey: ['class-students', selectedClass?.id],
    queryFn: () => fetchClassStudents(selectedClass.id),
    enabled: Boolean(selectedClass),
  });

  const assignMutation = useMutation({
    mutationFn: ({ student_id, class_id }) => createAssignment({ student_id, class_id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['class-students', selectedClass?.id] }); },
  });

  const disenrollMutation = useMutation({
    mutationFn: (assignment_id) => disenrollAssignment(assignment_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['class-students', selectedClass?.id] }); },
  });

  const reenrollMutation = useMutation({
    mutationFn: (assignment_id) => reenrollAssignment(assignment_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['class-students', selectedClass?.id] }); },
  });

  const classes  = classesData?.data || [];
  const allStudents = studentsData?.data || [];

  const active   = allEnrolled.filter(s => !s.class_disenrolled_on);
  const history  = allEnrolled.filter(s =>  s.class_disenrolled_on);
  const activeIds = new Set(active.map(s => s.id));
  const unenrolled = allStudents.filter(s => !activeIds.has(s.id));

  const displayed = showHistory ? history : active;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Assignments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Enroll and manage students in classes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class picker */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">Select a Class</div>
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {classes.length === 0 && <p className="text-sm text-gray-500 p-4">No classes yet.</p>}
            {classes.map(c => (
              <button key={c.id} onClick={() => { setSelectedClass(c); setShowHistory(false); }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedClass?.id === c.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
                <div>
                  <div className="text-sm font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.student_count}/{c.capacity} students</div>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Enrolled / History students */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="font-semibold text-sm text-gray-700 mb-2">
              {selectedClass ? `${selectedClass.name} — ` : ''}
              {showHistory ? 'Enrollment History' : 'Currently Enrolled'}
            </div>
            {selectedClass && (
              <div className="flex gap-2">
                <button onClick={() => setShowHistory(false)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${!showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                  Active ({active.length})
                </button>
                <button onClick={() => setShowHistory(true)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${showHistory ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                  History ({history.length})
                </button>
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {!selectedClass && <p className="text-sm text-gray-500 p-4">Select a class to see enrolled students.</p>}
            {selectedClass && enrolledLoading && <div className="flex justify-center p-6"><Spinner /></div>}
            {selectedClass && !enrolledLoading && displayed.length === 0 && (
              <p className="text-sm text-gray-500 p-4">{showHistory ? 'No disenrollment history.' : 'No students currently enrolled.'}</p>
            )}
            {displayed.map(s => (
              <div key={s.assignment_id} className={`flex items-center justify-between px-4 py-3 ${showHistory ? 'opacity-70' : ''}`}>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <Badge label={s.status} />
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <Clock size={10} /> {s.class_enrolled_on}
                      {s.class_disenrolled_on && ` → ${s.class_disenrolled_on}`}
                      {' · '}{calcDuration(s.class_enrolled_on, s.class_disenrolled_on)}
                    </span>
                  </div>
                </div>
                {!showHistory ? (
                  <button onClick={() => disenrollMutation.mutate(s.assignment_id)}
                    disabled={disenrollMutation.isPending}
                    title="Disenroll"
                    className="ml-2 p-1.5 text-gray-400 hover:text-orange-600 rounded flex-shrink-0">
                    <UserMinus size={14} />
                  </button>
                ) : (
                  <button onClick={() => reenrollMutation.mutate(s.assignment_id)}
                    disabled={reenrollMutation.isPending}
                    title="Re-enroll"
                    className="ml-2 p-1.5 text-gray-400 hover:text-green-600 rounded flex-shrink-0">
                    <UserCheck size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available students */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 space-y-2">
            <div className="font-semibold text-sm text-gray-700">Available Students</div>
            <input className="input text-xs py-1.5" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="divide-y divide-gray-100 max-h-[56vh] overflow-y-auto">
            {!selectedClass && <p className="text-sm text-gray-500 p-4">Select a class first.</p>}
            {selectedClass && unenrolled.length === 0 && <p className="text-sm text-gray-500 p-4">All active students enrolled.</p>}
            {selectedClass && unenrolled.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <div className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</div>
                  <div className="text-xs text-gray-400">{s.email || '—'}</div>
                </div>
                <button onClick={() => assignMutation.mutate({ student_id: s.id, class_id: selectedClass.id })}
                  disabled={assignMutation.isPending}
                  title="Enroll"
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                  <UserPlus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
