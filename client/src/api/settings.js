import { supabase } from '../lib/supabase.js';

export const fetchSettings = async () => {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) throw new Error(error.message);
  return Object.fromEntries(data.map(r => [r.key, r.value]));
};

export const updateSettings = async (settings) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('auth_id', user.id).single();

  const rows = Object.entries(settings).map(([key, value]) => ({
    tenant_id: profile.tenant_id,
    key,
    value: String(value),
  }));

  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'tenant_id,key' });
  if (error) throw new Error(error.message);
  return settings;
};
