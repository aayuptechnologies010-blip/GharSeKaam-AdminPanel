import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    console.log('Index: Checking authentication:', token ? 'Found token' : 'No token');

    if (token) {
      // User is authenticated, redirect to dashboard
      console.log('Index: User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    } else {
      // User is not authenticated, redirect to auth page
      console.log('Index: User not authenticated, redirecting to auth');
      navigate('/auth');
    }
  }, [navigate]);

  // Show nothing while redirecting
  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  );
};

export default Index;