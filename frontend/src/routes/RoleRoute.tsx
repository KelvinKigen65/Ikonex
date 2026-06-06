import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

interface Props {
  roles: Role[];
}

const RoleRoute = ({ roles }: Props) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return user && roles.includes(user.role)
    ? <Outlet />
    : <Navigate to="/" replace />;
};

export default RoleRoute;
