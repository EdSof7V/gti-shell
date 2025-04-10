"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface SessionInfo {
  username: string;
  accessToken: string;
  scope: string;
  isAuthenticated: boolean;
}

interface SessionContextType {
  session: SessionInfo | null;
  setSession: (session: SessionInfo | null) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => { },
  clearSession: () => { },
});

export const useSession = () => useContext(SessionContext);

// Proveedor del contexto
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
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

  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};