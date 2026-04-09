import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStudents, deleteStudent } from '../../api/students.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

export default function StudentList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['students', { search, status }],
    queryFn: () => fetchStudents({ search, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setDeleting(null); },
  });

  const students = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.meta?.total ?? 0} total students</p>
        </div>
        <Link to="/students/new" className="btn-primary">
          <Plus size={16} /> Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : students.length === 0 ? (
          <EmptyState title="No students found" description="Try adjusting your filters or add a new student."
            action={<Link to="/students/new" className="btn-primary btn-sm">Add Student</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header hidden md:table-cell">Email</th>
                  <th className="table-header hidden sm:table-cell">Enrolled</th>
                  <th className="table-header">Status</th>
                  <th className="table-header w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <Link to={`/students/${s.id}`} className="font-medium text-blue-600 hover:underline">
                        {s.first_name} {s.last_name}
                      </Link>
                    </td>
                    <td className="table-cell hidden md:table-cell text-gray-500">{s.email || '—'}</td>
                    <td className="table-cell hidden sm:table-cell text-gray-500">{s.enrolled_on}</td>
                    <td className="table-cell"><Badge label={s.status} /></td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/students/${s.id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil size={14} /></button>
                        <button onClick={() => setDeleting(s)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Delete Student"
          message={`Delete ${deleting.first_name} ${deleting.last_name}? This will also remove their attendance and fee records.`}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
