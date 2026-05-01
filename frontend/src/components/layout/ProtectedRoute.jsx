import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('hr_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // Support both wrapper and layout usage
  return children ?? <Outlet />;
}
