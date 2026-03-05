import React, { useEffect } from 'react';
import { useNewsOptional, type ArticleForState } from '../../context/NewsContext';
import { useSession } from '../../context/SessionContext';
import { useUserPreferencesOptional } from '../../context/UserPreferencesContext';
import { useFilteredUnreadCount } from '../../hooks/useArticleFiltering';

const DEFAULT_PREFERENCES = { countries: [] as string[], industries: [] as string[] };

export const TabTitleUpdater: React.FC = () => {
  const { isAuthenticated } = useSession();

  const newsContext = useNewsOptional();
  const userPrefsContext = useUserPreferencesOptional();

  const articles: ArticleForState[] = newsContext?.articles ?? [];
  const preferences = userPrefsContext?.preferences ?? DEFAULT_PREFERENCES;
  const isLoading = userPrefsContext?.isLoading ?? false;

  const filteredUnreadCount = useFilteredUnreadCount(articles, preferences, isLoading);

  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    
    if (!isAuthenticated) {
      document.title = baseTitle;
      return;
    }

    document.title = filteredUnreadCount > 0 ? `(${filteredUnreadCount}) 🔥 ${baseTitle}` : baseTitle;
  }, [filteredUnreadCount, isAuthenticated]);

  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    if (!isAuthenticated) {
      document.title = baseTitle;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      document.title = 'Perkins Live Feed';
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return null;
};
