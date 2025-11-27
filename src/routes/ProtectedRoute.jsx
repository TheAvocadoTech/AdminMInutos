// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
// eslint-disable-next-line perfectionist/sort-imports
import { isAuthenticated } from 'src/utils/auth';

// eslint-disable-next-line react/prop-types
export default function ProtectedRoute({ element }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return element;
}
