import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;