"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Definir la interfaz para la información de la sesión
export interface SessionInfo {
  username: string;
  accessToken: string;
  scope: string;
  isAuthenticated: boolean;
}

// Definir la interfaz para el contexto
interface SessionContextType {
  session: SessionInfo | null;
  setSession: (session: SessionInfo | null) => void;
  clearSession: () => void;
}

// Crear el contexto con un valor inicial
const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
});

// Hook personalizado para usar el contexto
export const useSession = () => useContext(SessionContext);

// Proveedor del contexto
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  // Intentar recuperar la sesión del localStorage al inicio
  const [session, setSessionState] = useState<SessionInfo | null>(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('session');
      return savedSession ? JSON.parse(savedSession) : null;
    }
    return null;
  });

  // Función para establecer la sesión
  const setSession = (newSession: SessionInfo | null) => {
    setSessionState(newSession);
    
    if (newSession) {
      localStorage.setItem('session', JSON.stringify(newSession));
    } else {
      localStorage.removeItem('session');
    }
  };

  // Función para limpiar la sesión
  const clearSession = () => {
    setSessionState(null);
    localStorage.removeItem('session');
  };

  // Guardar la sesión en localStorage cuando cambie
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