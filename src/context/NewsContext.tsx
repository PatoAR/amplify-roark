import { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { sortArticlesByPriority } from '../utils/articleSorting';

export interface ArticleForState {
  id: string;
  timestamp?: string | null;
  source: string;
  title: string;
  industry?: string | null;
  summary?: string | null;
  link: string;
  companies?: Record<string, string> | null;
  countries?: Record<string, string> | null;
  language: string;
  seen: boolean;
  category?: string | null;
  priorityDuration?: number | null;
  callToAction?: string | null;
  sponsorLink?: string | null;
  priorityUntil?: string | null;
  receivedAt: number; // Timestamp when article was received by the client
}

interface NewsContextType {
  articles: ArticleForState[];
  setArticles: (articles: ArticleForState[]) => void;
  addArticle: (article: ArticleForState) => void;
  updateArticle: (id: string, updates: Partial<ArticleForState>) => void;
  markArticleAsSeen: (id: string) => void;
  clearArticles: () => void;
  isInitialized: boolean;
  setIsInitialized: (initialized: boolean) => void;
  seenArticlesRef: React.MutableRefObject<Map<string, number>>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

interface NewsProviderProps {
  children: ReactNode;
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const { user } = useAuthenticator();
  const [articles, setArticles] = useState<ArticleForState[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const seenArticlesRef = useRef<Map<string, number>>(new Map());

  const addArticle = useCallback((article: ArticleForState) => {
    setArticles(prev => {
      // Don't add if article already exists
      if (prev.find(a => a.id === article.id)) {
        return prev;
      }
      
      // Add the new article and then sort the entire array
      // This ensures consistent ordering and proper React re-rendering
      const newArticles = [article, ...prev];
      
      // Sort the entire array with priority hierarchy
      const sorted = sortArticlesByPriority(newArticles);
      
      return sorted;
    });
  }, []);

  const updateArticle = useCallback((id: string, updates: Partial<ArticleForState>) => {
    setArticles(prev => 
      prev.map(article => 
        article.id === id ? { ...article, ...updates } : article
      )
    );
  }, []);

  const markArticleAsSeen = useCallback((id: string) => {
    setArticles(prev => 
      prev.map(article => 
        article.id === id ? { ...article, seen: true } : article
      )
    );
  }, []);

  const clearArticles = useCallback(() => {
    setArticles([]);
    setIsInitialized(false);
    seenArticlesRef.current.clear();
  }, []);

  // Clear articles when user changes
  useEffect(() => {
    // Only clear if user is actually logged out (not just during logout process)
    if (!user?.userId && articles && articles.length > 0) {
      clearArticles();
    }
  }, [user?.userId, clearArticles, articles]);

  const value: NewsContextType = {
    articles,
    setArticles,
    addArticle,
    updateArticle,
    markArticleAsSeen,
    clearArticles,
    isInitialized,
    setIsInitialized,
    seenArticlesRef,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
}; 