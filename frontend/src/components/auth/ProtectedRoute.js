import React from 'react';
import { Navigate } from 'react-router-dom';

// Minimal placeholder: replace with real auth logic later
function ProtectedRoute({ children }) {
  const isAuthenticated = false; // TODO: wire to real auth
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;


