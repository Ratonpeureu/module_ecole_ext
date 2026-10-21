import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  getToken, getEntreprise, setToken, setEntreprise,
  logout as apiLogout,TOKEN_EXPIRED_EVENT,
} from './api';
import toast from 'react-hot-toast';

type Entreprise = { id: string; email: string; nom?: string; rhEmail?: string };

interface AuthCtx {
  token: string | null;
  entreprise: Entreprise | null;
  isAuthenticated: boolean;
  setAuth: (token: string, entreprise: Entreprise) => void;
  logout: (reason?: string) => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setT] = useState<string | null>(() => getToken());
  const [entreprise, setE] = useState<Entreprise | null>(() => getEntreprise());

  const refresh = useCallback(() => {
    setT(getToken());
    setE(getEntreprise());
  }, []);

  const setAuth = useCallback((tok: string, e: Entreprise) => {
    setToken(tok);
    setEntreprise(e);
    setT(tok);
    setE(e);
  }, []);

  const logout = useCallback((_reason?: string) => {
    apiLogout();
    setT(null);
    setE(null);
  }, []);


  useEffect(() => {
    const onTokenExpired = () => {
      setT(null);
      setE(null);
      toast.error('Votre session a expiré. Veuillez vous reconnecter.', {
        id: 'session-expired',
        duration: 5000,
      });
    };

    window.addEventListener(TOKEN_EXPIRED_EVENT, onTokenExpired);
    return () => window.removeEventListener(TOKEN_EXPIRED_EVENT, onTokenExpired);
  }, []);

  // Écouteur pour les déconnexions forcées (IP interdite, etc.)


  // Synchronisation multi-onglets
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return (
    <Ctx.Provider value={{ token, entreprise, isAuthenticated: !!token, setAuth, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}