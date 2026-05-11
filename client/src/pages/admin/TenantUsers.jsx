import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase.js';
import { ArrowLeft, Plus, Trash2, Users, Info } from 'lucide-react';

const fetchTenants = async () => {
  const { data, error } = await supabase.from('tenants').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const fetchUsers = async (tenantId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, first_name, last_name, auth_id, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const createUser = async ({ tenantId, email, role, first_name, last_name }) => {
  const { data, error } = await supabase
    .from('users')
    .insert({ tenant_id: tenantId, email, role, first_name, last_name })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const deleteUser = async (userId) => {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw new Error(error.message);
};

const BLANK = { email: '', role: 'admin', first_name: '', last_name: '' };

export default function TenantUsers() {
  const { id: tenantId } = useParams();
  const qc = useQueryClient();
  const { data: tenants = [] } = useQuery({ queryKey: ['admin-tenants'], queryFn: fetchTenants });
  const tenant = tenants.find((t) => t.id === tenantId);
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', tenantId],
    queryFn: () => fetchUsers(tenantId),
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  const field = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users', tenantId] });
      setShowForm(false);
      setForm(BLANK);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users', tenantId] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/admin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Tenants
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Users {tenant ? `— ${tenant.name}` : ''}
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add User
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-2">New User</h2>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 text-sm text-blue-700">
              <Info size={15} className="flex-shrink-0 mt-0.5" />
              <span>
                This creates the user profile. To activate their login, run the migration script:<br />
                <code className="font-mono text-xs">node server/src/scripts/migrate-to-supabase-auth.js &lt;service_role_key&gt;</code>
              </span>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ tenantId, ...form }); }}
              className="space-y-4"
            >
              {createMutation.error && <p className="text-red-600 text-sm">{createMutation.error.message}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input {...field('first_name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input {...field('last_name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required {...field('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select {...field('role')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit" disabled={createMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? 'Creating…' : 'Create User'}
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
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No users yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {u.first_name || u.last_name ? `${u.first_name} ${u.last_name} · ` : ''}
                    <span className="text-gray-600 font-normal">{u.email}</span>
                  </p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                    {u.role} · {u.auth_id ? '✓ login active' : '⚠ no login yet'}
                  </p>
                </div>
                <button
                  onClick={() => { if (confirm(`Delete user ${u.email}?`)) deleteMutation.mutate(u.id); }}
                  className="text-red-400 hover:text-red-600 p-2 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
