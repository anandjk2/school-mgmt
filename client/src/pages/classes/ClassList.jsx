import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { fetchClasses, deleteClass } from '../../api/classes.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';

export default function ClassList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [year, setYear] = useState('');
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['classes', { year }],
    queryFn: () => fetchClasses({ academic_year: year }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); setDeleting(null); },
  });

  const classes = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{classes.length} classes</p>
        </div>
        <Link to="/classes/new" className="btn-primary"><Plus size={16} /> Add Class</Link>
      </div>

      <div className="flex gap-3">
        <input className="input w-48" placeholder="Filter by year (e.g. 2024-2025)" value={year} onChange={e => setYear(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : classes.length === 0 ? (
          <EmptyState title="No classes found" action={<Link to="/classes/new" className="btn-primary btn-sm">Add Class</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header hidden sm:table-cell">Teacher</th>
                  <th className="table-header hidden md:table-cell">Room</th>
                  <th className="table-header">Year</th>
                  <th className="table-header"><Users size={13} className="inline" /></th>
                  <th className="table-header w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classes.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <Link to={`/classes/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.name}</Link>
                      {c.subject && <span className="ml-2 text-xs text-gray-400">{c.subject}</span>}
                    </td>
                    <td className="table-cell hidden sm:table-cell text-gray-500">{c.teacher_name || '—'}</td>
                    <td className="table-cell hidden md:table-cell text-gray-500">{c.room_number || '—'}</td>
                    <td className="table-cell text-gray-500">{c.academic_year}</td>
                    <td className="table-cell text-center">
                      <span className="text-sm font-medium">{c.student_count}/{c.capacity}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/classes/${c.id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil size={14} /></button>
                        <button onClick={() => setDeleting(c)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
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
        <ConfirmDialog title="Delete Class" message={`Delete "${deleting.name}"?`}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleting.id)}
          onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}
