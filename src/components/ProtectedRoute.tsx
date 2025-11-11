import { Navigate, Outlet } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const ProtectedRoute = () => {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/auth" />;
};

export default ProtectedRoute;
