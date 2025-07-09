import { createContext, useContext, ReactNode } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';

interface SessionContextType {
  isAuthenticated: boolean;
  isSessionActive: boolean;
  authStatus: string;
  logout: () => Promise<void>;
  trackPageViewIfActive: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const sessionManager = useSessionManager({
    onSessionStart: (userId) => {
      console.log('✅ Session started for user:', userId);
    },
    onSessionEnd: (userId) => {
      console.log('✅ Session ended for user:', userId);
    },
    onAuthError: (error) => {
      console.error('❌ Authentication error:', error);
    }
  });

  return (
    <SessionContext.Provider value={sessionManager}>
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