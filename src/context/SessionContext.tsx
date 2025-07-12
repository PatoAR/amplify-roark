import { createContext, useContext, ReactNode } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';

interface SessionContextType {
  isAuthenticated: boolean;
  isSessionActive: boolean;
  authStatus: string;
  logout: () => Promise<void>;
  trackPageViewIfActive: () => void;
  // Add activity tracking functions
  trackPreferenceUpdate: (preferenceType: string, preferenceValue: string | string[] | boolean | number) => void;
  trackReferralActivity: (action: 'generated' | 'shared', referralCode?: string) => void;
  trackArticleClick: (articleId: string, articleTitle: string) => void;
  userId?: string;
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

  // Destructure activity tracking functions from sessionManager
  const {
    isAuthenticated,
    isSessionActive,
    authStatus,
    logout,
    trackPageViewIfActive,
    trackPreferenceUpdate,
    trackReferralActivity,
    trackArticleClick,
    userId,
  } = sessionManager;

  return (
    <SessionContext.Provider value={{
      isAuthenticated,
      isSessionActive,
      authStatus,
      logout,
      trackPageViewIfActive,
      trackPreferenceUpdate,
      trackReferralActivity,
      trackArticleClick,
      userId,
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