import { createContext, useContext, ReactNode, useState } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';

interface SessionContextType {
  authStatus: 'configuring' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
  isSessionActive: boolean;
  logout: (isInactivityLogout?: boolean) => Promise<void>;
  userId?: string;
  sessionId?: string;
  authError: Error | null;
  clearAuthError: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [authError, setAuthError] = useState<Error | null>(null);
  const sessionManager = useSessionManager({
    onSessionStart: (userId) => {
      console.log('✅ Session started for user:', userId);
    },
    onSessionEnd: (userId) => {
      console.log('✅ Session ended for user:', userId);
    },
    onAuthError: (error) => {
      console.error('❌ Authentication error:', error);
      setAuthError(error instanceof Error ? error : new Error('Authentication error'));
    }
  });

  // Use consolidated session management
  const {
    authStatus,
    isAuthenticated,
    isSessionActive,
    logout,
    userId,
    sessionId,
  } = sessionManager;

  const clearAuthError = () => setAuthError(null);

  return (
    <SessionContext.Provider value={{
      authStatus,
      isAuthenticated,
      isSessionActive,
      logout,
      userId,
      sessionId,
      authError,
      clearAuthError,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}; 