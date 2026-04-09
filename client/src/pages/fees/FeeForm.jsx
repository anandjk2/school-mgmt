import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFee, updateFee } from '../../api/fees.js';
import { fetchStudents } from '../../api/students.js';
import { fetchClasses } from '../../api/classes.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { ArrowLeft } from 'lucide-react';

const EMPTY = { student_id: '', class_id: '', fee_type: '', description: '', amount_due: '', amount_paid: '0', billing_frequency: '', due_date: '', paid_on: '', status: 'pending' };
const FEE_TYPES = ['tuition', 'library', 'exam', 'activity', 'sports', 'transport', 'other'];

export default function FeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const { data: studentsData } = useQuery({ queryKey: ['students', {}], queryFn: () => fetchStudents() });
  const { data: classesData }  = useQuery({ queryKey: ['classes', {}],  queryFn: () => fetchClasses() });

  // For edit: fetch from list (we don't have single fee endpoint — fetch all and find)
  const { data: feesData } = useQuery({
    queryKey: ['fees', {}],
    queryFn: async () => { const r = await fetch('/api/v1/fees?limit=1000'); return r.json(); },
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && feesData?.data) {
      const fee = feesData.data.find(f => String(f.id) === id);
      if (fee) setForm({
        ...fee,
        amount_due:        String(fee.amount_due),
        amount_paid:       String(fee.amount_paid),
        student_id:        String(fee.student_id),
        class_id:          fee.class_id ? String(fee.class_id) : '',
        billing_frequency: fee.billing_frequency ?? '',
      });
    }
  }, [isEdit, feesData, id]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateFee(id, data) : createFee(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees'] });
      navigate('/fees');
    },
    onError: (e) => setError(e.message),
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    const payload = {
      ...form,
      student_id:  Number(form.student_id),
      amount_due:  Number(form.amount_due),
      amount_paid: Number(form.amount_paid) || 0,
    };
    if (form.class_id)          payload.class_id = Number(form.class_id);          else delete payload.class_id;
    if (!form.billing_frequency) delete payload.billing_frequency;
    if (!payload.due_date)       delete payload.due_date;
    if (!payload.paid_on)        delete payload.paid_on;
    if (!payload.description)    delete payload.description;
    mutation.mutate(payload);
  };

  // Auto-fill fee amount and billing frequency when a class with a fee is selected
  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    setForm(f => {
      const cls = classesData?.data?.find(c => String(c.id) === selectedId);
      return {
        ...f,
        class_id:          selectedId,
        amount_due:        cls?.fee_amount   ? String(cls.fee_amount)   : f.amount_due,
        billing_frequency: cls?.billing_frequency ?? f.billing_frequency,
      };
    });
  };

  const students = studentsData?.data || [];
  const classes  = classesData?.data  || [];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Fee Record' : 'Add Fee Record'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div>
          <label className="label">Student *</label>
          <select className="input" required value={form.student_id} onChange={set('student_id')} disabled={isEdit}>
            <option value="">Select student…</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Class <span className="text-gray-400 font-normal">(optional — links fee to a class)</span></label>
          <select className="input" value={form.class_id} onChange={handleClassChange} disabled={isEdit}>
            <option value="">— no class —</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.fee_amount ? ` — $${Number(c.fee_amount).toLocaleString()} ${c.billing_frequency ? '/' + c.billing_frequency.replace('per_','') : ''}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Fee Type *</label>
            <select className="input" required value={form.fee_type} onChange={set('fee_type')}>
              <option value="">Select type…</option>
              {FEE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Billing Frequency</label>
            <select className="input" value={form.billing_frequency} onChange={set('billing_frequency')}>
              <option value="">— not set —</option>
              <option value="per_session">Per Session</option>
              <option value="per_week">Per Week</option>
              <option value="per_month">Per Month</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <input className="input" value={form.description || ''} onChange={set('description')} placeholder="Term 2 Tuition" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Amount Due *</label>
            <input className="input" type="number" min="0" step="0.01" required value={form.amount_due} onChange={set('amount_due')} placeholder="5000" />
          </div>
          <div>
            <label className="label">Amount Paid</label>
            <input className="input" type="number" min="0" step="0.01" value={form.amount_paid} onChange={set('amount_paid')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Due Date</label>
            <input className="input" type="date" value={form.due_date || ''} onChange={set('due_date')} />
          </div>
          <div>
            <label className="label">Paid On</label>
            <input className="input" type="date" value={form.paid_on || ''} onChange={set('paid_on')} />
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update Record' : 'Add Fee Record'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
