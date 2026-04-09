import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStudent, createStudent, updateStudent } from '../../api/students.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { ArrowLeft } from 'lucide-react';

const EMPTY = { first_name: '', last_name: '', date_of_birth: '', gender: '', email: '', phone: '', address: '', enrolled_on: '', status: 'active' };

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const { data: existing, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudent(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) setForm({ ...EMPTY, ...existing });
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateStudent(id, data) : createStudent(data),
    onSuccess: (student) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', id] });
      navigate(`/students/${student.id}`);
    },
    onError: (e) => setError(e.message),
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    // clean empty strings to null
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
    payload.first_name = form.first_name;
    payload.last_name = form.last_name;
    mutation.mutate(payload);
  };

  if (isEdit && isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Student' : 'Add Student'}</h1>
          <p className="text-sm text-gray-500">Fill in the student details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input className="input" required value={form.first_name} onChange={set('first_name')} placeholder="Alice" />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input className="input" required value={form.last_name} onChange={set('last_name')} placeholder="Johnson" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Date of Birth</label>
            <input className="input" type="date" value={form.date_of_birth || ''} onChange={set('date_of_birth')} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender || ''} onChange={set('gender')}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email || ''} onChange={set('email')} placeholder="alice@school.edu" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone || ''} onChange={set('phone')} placeholder="555-0101" />
          </div>
          <div>
            <label className="label">Enrolled On</label>
            <input className="input" type="date" value={form.enrolled_on || ''} onChange={set('enrolled_on')} />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <textarea className="input" rows={2} value={form.address || ''} onChange={set('address')} placeholder="123 Main St…" />
        </div>

        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update Student' : 'Add Student'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
