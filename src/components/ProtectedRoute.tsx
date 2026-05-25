import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('ProtectedRoute: Checking authentication:', token ? 'Authenticated' : 'Not authenticated');

    if (!token) {
      console.log('ProtectedRoute: No token found, redirecting to /auth');
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const token = localStorage.getItem('authToken');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
