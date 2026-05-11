import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Plus, LogOut, Building2, Users } from 'lucide-react';

const fetchTenants = async () => {
  const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const createTenant = async (body) => {
  const { data, error } = await supabase.from('tenants').insert(body).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const qc = useQueryClient();
  const { data: tenants = [], isLoading } = useQuery({ queryKey: ['admin-tenants'], queryFn: fetchTenants });
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');

  const mutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      setShowForm(false);
      setName('');
      setSubdomain('');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm text-white">S</div>
          <span className="font-semibold text-gray-900">SchoolMS Admin</span>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Tenants</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> New Tenant
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Create Tenant</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name, subdomain: subdomain || undefined }); }}
              className="space-y-4"
            >
              {mutation.error && <p className="text-red-600 text-sm">{mutation.error.message}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain (optional)</label>
                <input
                  value={subdomain} onChange={(e) => setSubdomain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. lincoln-high"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit" disabled={mutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {mutation.isPending ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : tenants.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No tenants yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenants.map((t) => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t.subdomain || 'no subdomain'} · {t.status} · {t.plan_tier}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/admin/tenants/${t.id}/users`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Users size={16} /> Manage Users
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
