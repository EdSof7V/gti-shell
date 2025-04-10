"use client";
import { UserType } from '@/lib/types/auth';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';


export interface SessionInfo {
  username: string;
  accessToken: string;
  scope: string;
  isAuthenticated: boolean;
}

interface SessionContextType {
  session: SessionInfo | null;
  setSession: (session: SessionInfo | null) => void;
  logoutSession: () => Promise<void>;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => { },
  logoutSession: async () => { },
  clearSession: () => { },
});

export const useSession = () => useContext(SessionContext);

// Proveedor del contexto
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSessionState] = useState<SessionInfo | null>(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('session');
      return savedSession ? JSON.parse(savedSession) : null;
    }
    return null;
  });

  const setSession = (newSession: SessionInfo | null) => {
    setSessionState(newSession);

    if (newSession) {
      localStorage.setItem('session', JSON.stringify(newSession));
    } else {
      localStorage.removeItem('session');
    }
  };

  const clearSession = () => {
    setSessionState(null);
    localStorage.removeItem('session');
  };

  const logoutSession = async (): Promise<void> => {
    try {
      Cookies.remove('auth_token');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession, clearSession, logoutSession }}>
      {children}
    </SessionContext.Provider>
  );
};