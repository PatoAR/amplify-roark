import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNews } from '../../context/NewsContext';
import { useSession } from '../../context/SessionContext';

export const TabTitleUpdater: React.FC = () => {
  const { authStatus } = useAuthenticator();
  const { isAuthenticated } = useSession();
  const { articles } = useNews();
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() => !document.hidden);

  // Tab visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Update tab title based on unread count and authentication status
  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    
    // Reset title if not authenticated
    if (!isAuthenticated || authStatus === 'unauthenticated') {
      document.title = baseTitle;
      return;
    }

    // Only update title if tab is visible (user is actively viewing)
    if (isTabVisible) {
      const unreadCount = articles.filter(article => !article.seen).length;
      document.title = unreadCount > 0 ? `(${unreadCount}) 🔥 ${baseTitle}` : baseTitle;
    }
  }, [articles, isAuthenticated, authStatus, isTabVisible]);

  // Additional effect to ensure document title is reset when authentication state changes
  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    if (!isAuthenticated || authStatus === 'unauthenticated') {
      document.title = baseTitle;
    }
  }, [isAuthenticated, authStatus]);

  // Cleanup effect to reset document title when component unmounts
  useEffect(() => {
    return () => {
      document.title = 'Perkins Live Feed';
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};
