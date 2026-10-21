import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si pas de token, on redirige immédiatement vers le login
  if (!isAuthenticated) {
    // On sauvegarde la page demandée pour y revenir après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si connecté, on laisse passer vers AbonnementGuard puis EcoleLayout
  return <Outlet />;
}