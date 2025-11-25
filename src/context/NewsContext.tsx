import { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { sortArticlesByPriority } from '../utils/articleSorting';
import { SessionService } from '../utils/sessionService';

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
  const readStatesRestoredRef = useRef(false);

  // Restore article read states from localStorage on mount
  useEffect(() => {
    if (user?.userId && !readStatesRestoredRef.current) {
      const currentSession = SessionService.getCurrentSession();
      if (currentSession) {
        const readStates = SessionService.getArticleReadStates(currentSession.sessionId);
        // Populate seenArticlesRef with restored read states
        readStates.forEach((articleId) => {
          seenArticlesRef.current.set(articleId, Date.now());
        });
        readStatesRestoredRef.current = true;

        // Also update articles in state if they exist
        setArticles(prev => {
          if (prev.length === 0) return prev;
          const hasChanges = prev.some(article => 
            readStates.has(article.id) && !article.seen
          );
          if (hasChanges) {
            return prev.map(article => 
              readStates.has(article.id) ? { ...article, seen: true } : article
            );
          }
          return prev;
        });
      }
    }
  }, [user?.userId]);

  const addArticle = useCallback((article: ArticleForState) => {
    setArticles(prev => {
      // Don't add if article already exists
      if (prev.find(a => a.id === article.id)) {
        return prev;
      }
      
      // Check if article was previously read (from localStorage)
      const currentSession = SessionService.getCurrentSession();
      if (currentSession) {
        const readStates = SessionService.getArticleReadStates(currentSession.sessionId);
        if (readStates.has(article.id)) {
          article.seen = true;
          seenArticlesRef.current.set(article.id, Date.now());
        }
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
    // Update in-memory state
    setArticles(prev => 
      prev.map(article => 
        article.id === id ? { ...article, seen: true } : article
      )
    );

    // Persist to localStorage via SessionService
    const currentSession = SessionService.getCurrentSession();
    if (currentSession) {
      SessionService.storeArticleReadState(id, currentSession.sessionId);
      seenArticlesRef.current.set(id, Date.now());
    }
  }, []);

  const clearArticles = useCallback(() => {
    setArticles([]);
    setIsInitialized(false);
    seenArticlesRef.current.clear();
    readStatesRestoredRef.current = false;
  }, []);

  // Clear articles when user changes
  useEffect(() => {
    // Only clear if user is actually logged out (not just during logout process)
    if (!user?.userId && articles && articles.length > 0) {
      clearArticles();
    } else if (user?.userId) {
      // Reset restoration flag when new user logs in
      readStatesRestoredRef.current = false;
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