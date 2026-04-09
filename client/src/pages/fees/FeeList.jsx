import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchFees, deleteFee, fetchFeesSummary } from '../../api/fees.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Plus, Pencil, Trash2, DollarSign, X } from 'lucide-react';

// Maps filter value → API params
function filterToParams(filter) {
  if (filter === 'outstanding') return { outstanding: '1' };
  if (filter)                   return { status: filter };
  return {};
}

export default function FeeList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [activeCard, setActiveCard] = useState(null); // 'paid' | 'outstanding' | null
  const [deleting, setDeleting] = useState(null);

  // Merge card filter + dropdown filter (dropdown takes precedence when both set)
  const effectiveFilter = status || (activeCard ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['fees', { effectiveFilter }],
    queryFn: () => fetchFees(filterToParams(effectiveFilter)),
  });

  const toggleCard = (card) => {
    setStatus(''); // clear dropdown when using a card
    setActiveCard(prev => prev === card ? null : card);
  };

  const clearFilter = () => { setStatus(''); setActiveCard(null); };

  const { data: summary } = useQuery({
    queryKey: ['fees-summary'],
    queryFn: () => fetchFeesSummary(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFee,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); qc.invalidateQueries({ queryKey: ['fees-summary'] }); setDeleting(null); },
  });

  const fees = data?.data || [];

  const isFiltered = Boolean(effectiveFilter);
  const filterLabel = {
    paid:        'Total Collected (Paid)',
    outstanding: 'Outstanding (Pending + Partial)',
    pending:     'Pending',
    partial:     'Partial',
    waived:      'Waived',
  }[effectiveFilter] ?? '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Collection</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.meta?.total ?? 0} fee records</p>
        </div>
        <Link to="/fees/new" className="btn-primary"><Plus size={16} /> Add Fee</Link>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: null,          label: 'Total Billed',    value: `$${summary.total_due.toLocaleString()}`,   color: 'bg-blue-500',   ring: 'ring-blue-400',   textColor: 'text-blue-600' },
            { key: 'paid',        label: 'Total Collected', value: `$${summary.total_paid.toLocaleString()}`,  color: 'bg-green-500',  ring: 'ring-green-400',  textColor: 'text-green-700' },
            { key: 'outstanding', label: 'Outstanding',     value: `$${summary.outstanding.toLocaleString()}`, color: 'bg-orange-500', ring: 'ring-orange-400', textColor: 'text-orange-700' },
          ].map(({ key, label, value, color, ring, textColor }) => {
            const isActive = key ? activeCard === key && !status : false;
            return (
              <button
                key={label}
                onClick={() => key ? toggleCard(key) : clearFilter()}
                className={`card p-4 flex items-center gap-3 w-full text-left transition-all hover:shadow-md ${
                  isActive ? `ring-2 ${ring} shadow-md` : 'hover:ring-1 hover:ring-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                  <DollarSign size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className={`text-lg font-bold ${isActive ? textColor : 'text-gray-900'}`}>{value}</div>
                  <div className="text-xs text-gray-500">{label}{isActive ? '' : key ? ' — click to filter' : ''}</div>
                </div>
                {isActive && <X size={14} className={`ml-auto flex-shrink-0 ${textColor}`} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="input w-44"
          value={status}
          onChange={e => { setStatus(e.target.value); setActiveCard(null); }}
        >
          <option value="">All statuses</option>
          <option value="outstanding">Outstanding (Pending + Partial)</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="waived">Waived</option>
        </select>
        {isFiltered && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <span>Showing: <strong>{filterLabel}</strong></span>
            <button onClick={clearFilter} className="ml-1 text-blue-400 hover:text-blue-700"><X size={13} /></button>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : fees.length === 0 ? (
          <EmptyState title="No fee records" action={<Link to="/fees/new" className="btn-primary btn-sm">Add Fee</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header hidden md:table-cell">Class</th>
                  <th className="table-header">Type</th>
                  <th className="table-header hidden sm:table-cell">Billing</th>
                  <th className="table-header text-right">Amount Due</th>
                  <th className="table-header text-right">Amount Paid</th>
                  <th className="table-header hidden sm:table-cell">Due Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <Link to={`/students/${f.student_id}`} className="font-medium text-blue-600 hover:underline">
                        {f.first_name} {f.last_name}
                      </Link>
                    </td>
                    <td className="table-cell hidden md:table-cell text-gray-500">
                      {f.class_name ? (
                        <Link to={`/classes/${f.class_id}`} className="text-blue-600 hover:underline">{f.class_name}</Link>
                      ) : '—'}
                    </td>
                    <td className="table-cell text-gray-600 capitalize">{f.fee_type}</td>
                    <td className="table-cell hidden sm:table-cell">
                      {f.billing_frequency
                        ? <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full capitalize">{f.billing_frequency.replace('_',' ')}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-cell text-right font-medium">${f.amount_due.toLocaleString()}</td>
                    <td className="table-cell text-right text-green-700">${f.amount_paid.toLocaleString()}</td>
                    <td className="table-cell hidden sm:table-cell text-gray-500">{f.due_date || '—'}</td>
                    <td className="table-cell"><Badge label={f.status} /></td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/fees/${f.id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil size={14} /></button>
                        <button onClick={() => setDeleting(f)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
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
        <ConfirmDialog title="Delete Fee Record"
          message={`Delete this fee record for ${deleting.first_name} ${deleting.last_name}?`}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleting.id)}
          onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}
