import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.js';
import { updateSettings } from '../../api/settings.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { School, Save, CheckCircle } from 'lucide-react';

const FIELDS = [
  { key: 'school_name',    label: 'School Name',       placeholder: 'e.g. Greenwood Academy',  required: true },
  { key: 'tagline',        label: 'Tagline / Motto',   placeholder: 'e.g. Excellence in Education' },
  { key: 'principal_name', label: 'Principal Name',    placeholder: 'e.g. Dr. Jane Smith' },
  { key: 'academic_year',  label: 'Academic Year',     placeholder: 'e.g. 2025–2026' },
  { key: 'address',        label: 'Address',           placeholder: 'Street, City, State, ZIP', textarea: true },
  { key: 'phone',          label: 'Phone',             placeholder: 'e.g. +1 555 000 1234' },
  { key: 'email',          label: 'Email',             placeholder: 'e.g. admin@school.edu', type: 'email' },
  { key: 'website',        label: 'Website',           placeholder: 'e.g. https://school.edu', type: 'url' },
];

export default function SchoolProfile() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useSchoolProfile();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <School size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your school's identity and contact details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-5">
          {FIELDS.map(({ key, label, placeholder, required, textarea, type }) => (
            <div key={key}>
              <label className="label">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {textarea ? (
                <textarea
                  className="input w-full h-20 resize-none"
                  value={form[key] || ''}
                  onChange={e => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
              ) : (
                <input
                  className="input w-full"
                  type={type || 'text'}
                  value={form[key] || ''}
                  onChange={e => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  required={required}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={mutation.isPending}
          >
            <Save size={15} />
            {mutation.isPending ? 'Saving…' : 'Save Profile'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle size={15} /> Saved successfully
            </span>
          )}
          {mutation.isError && (
            <span className="text-sm text-red-600">{mutation.error.message}</span>
          )}
        </div>
      </form>
    </div>
  );
}
