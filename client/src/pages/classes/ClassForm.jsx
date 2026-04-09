import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClass, createClass, updateClass } from '../../api/classes.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { ArrowLeft } from 'lucide-react';

const EMPTY = { name: '', grade_level: '', section: '', subject: '', teacher_name: '', room_number: '', academic_year: '2024-2025', capacity: 40, fee_amount: '', billing_frequency: '' };

export default function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const { data: existing, isLoading } = useQuery({ queryKey: ['class', id], queryFn: () => fetchClass(id), enabled: isEdit });
  useEffect(() => { if (existing) setForm({ ...EMPTY, ...existing }); }, [existing]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateClass(id, data) : createClass(data),
    onSuccess: (cls) => {
      qc.invalidateQueries({ queryKey: ['classes'] });
      navigate(`/classes/${cls.id}`);
    },
    onError: (e) => setError(e.message),
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    const payload = { ...form };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
    payload.name = form.name;
    payload.academic_year = form.academic_year;
    payload.capacity = Number(form.capacity) || 40;
    if (payload.fee_amount !== null) payload.fee_amount = Number(payload.fee_amount);
    mutation.mutate(payload);
  };

  if (isEdit && isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Class' : 'Add Class'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div>
          <label className="label">Class Name *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="Grade 5A" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Grade Level</label>
            <input className="input" value={form.grade_level || ''} onChange={set('grade_level')} placeholder="5" />
          </div>
          <div>
            <label className="label">Section</label>
            <input className="input" value={form.section || ''} onChange={set('section')} placeholder="A" />
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject || ''} onChange={set('subject')} placeholder="Mathematics" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Teacher Name</label>
            <input className="input" value={form.teacher_name || ''} onChange={set('teacher_name')} placeholder="Mrs. Thompson" />
          </div>
          <div>
            <label className="label">Room Number</label>
            <input className="input" value={form.room_number || ''} onChange={set('room_number')} placeholder="101" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Academic Year *</label>
            <input className="input" required value={form.academic_year} onChange={set('academic_year')} placeholder="2024-2025" />
          </div>
          <div>
            <label className="label">Capacity</label>
            <input className="input" type="number" min="1" value={form.capacity} onChange={set('capacity')} />
          </div>
        </div>

        {/* Tuition fee structure */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tuition Fee Structure</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Fee Amount</label>
              <input className="input" type="number" min="0" step="0.01"
                value={form.fee_amount ?? ''} onChange={set('fee_amount')} placeholder="e.g. 5000" />
            </div>
            <div>
              <label className="label">Billing Frequency</label>
              <select className="input" value={form.billing_frequency ?? ''} onChange={set('billing_frequency')}>
                <option value="">— not set —</option>
                <option value="per_session">Per Session</option>
                <option value="per_week">Per Week</option>
                <option value="per_month">Per Month</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update Class' : 'Add Class'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
