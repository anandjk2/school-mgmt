import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children, requireRole }) {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!auth) return <Navigate to="/login" replace />;

  // Super-admin hitting app routes → send to admin panel
  if (!requireRole && auth.user.role === 'super_admin') return <Navigate to="/admin" replace />;

  // Wrong role for a restricted route → send to dashboard
  if (requireRole && auth.user.role !== requireRole) return <Navigate to="/dashboard" replace />;

  return children;
}
