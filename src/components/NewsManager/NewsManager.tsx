import { useEffect, useRef, useCallback } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../../amplify/data/resource';
import { useNews } from '../../context/NewsContext';

const client = generateClient<Schema>();

// Constants
const MAX_ARTICLES_IN_MEMORY = 100;
const WEBSOCKET_LATENCY_BUFFER = 2000; // 2 seconds
const SHADOW_POLLER_INTERVAL = 30000; // 30 seconds

// GraphQL queries
const listArticles = /* GraphQL */ `
  query ListArticles {
    listArticles {
      items {
        id
        timestamp
        source
        title
        industry
        summary
        link
        companies
        countries
        language
      }
    }
  }
`;

const onCreateArticle = /* GraphQL */ `
  subscription OnCreateArticle {
    onCreateArticle {
      id
      timestamp
      source
      title
      industry
      summary
      link
      companies
      countries
      language
    }
  }
`;

interface Article {
  id: string;
  timestamp?: string | null;
  source: string;
  title: string;
  industry?: string | null;
  summary?: string | null;
  link?: string | null;
  companies?: string | Record<string, string> | null;
  countries?: string | Record<string, string> | null;
  language?: string | null;
}

interface ArticleForState {
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
}

// Helper functions
function normalizeCountries(countries: string | Record<string, string> | null | undefined): Record<string, string> | null {
  if (!countries) return null;
  if (typeof countries === 'string') {
    try {
      return JSON.parse(countries);
    } catch {
      return null;
    }
  }
  return countries;
}

function normalizeCompanies(companies: string | Record<string, string> | null | undefined): Record<string, string> | null {
  if (!companies) return null;
  if (typeof companies === 'string') {
    try {
      return JSON.parse(companies);
    } catch {
      return null;
    }
  }
  return companies;
}

export const NewsManager: React.FC = () => {
  const { user } = useAuthenticator();
  const { articles, setArticles, addArticle, isInitialized, setIsInitialized, seenArticlesRef } = useNews();

  // Resource management refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shadowPollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shadowPollerStoppedRef = useRef<boolean>(false);
  const isComponentMountedRef = useRef<boolean>(true);
  const articleIdsFromSubscriptionRef = useRef<Set<string>>(new Set());
  const articlesRef = useRef<typeof articles>(articles);
  const subscriptionEstablishedRef = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(false);

  // Keep articlesRef in sync with articles
  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  // Cleanup function to prevent memory leaks
  const cleanupResources = useCallback(() => {
    console.log('🧹 Cleaning up resources...');
    
    // Clear subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    // Clear polling intervals
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (shadowPollerRef.current) {
      clearInterval(shadowPollerRef.current);
      shadowPollerRef.current = null;
    }
    
    // Reset flags
    shadowPollerStoppedRef.current = false;
    articleIdsFromSubscriptionRef.current.clear();
    subscriptionEstablishedRef.current = false;
  }, []);

  // Memory management: limit articles in memory while preserving seen tracking
  const manageMemory = useCallback((articles: ArticleForState[]) => {
    if (articles.length > MAX_ARTICLES_IN_MEMORY) {
      const trimmed = articles.slice(0, MAX_ARTICLES_IN_MEMORY);
      
      // Update seen tracking for articles being removed from memory
      const removedArticles = articles.slice(MAX_ARTICLES_IN_MEMORY);
      const now = Date.now();
      removedArticles.forEach(article => {
        if (article.seen) {
          seenArticlesRef.current.set(article.id, now);
        }
      });
      
      console.log(`📦 Memory management: trimmed from ${articles.length} to ${trimmed.length} articles, tracking ${seenArticlesRef.current.size} seen articles`);
      return trimmed;
    }
    return articles;
  }, [seenArticlesRef]);

  // Check if article has been seen (either in memory or tracking)
  const isArticleSeen = useCallback((articleId: string): boolean => {
    // Check if it's in current memory
    const inMemory = articlesRef.current.find(msg => msg.id === articleId);
    if (inMemory) {
      return inMemory.seen;
    }
    
    // Check if it's in seen tracking
    return seenArticlesRef.current.has(articleId);
  }, []);

  // Fetch initial articles
  const fetchInitialArticles = useCallback(async () => {
    if (!isComponentMountedRef.current || isInitialized) return;
    
    console.log('📰 Fetching initial articles to establish a baseline...');
    try {
      const result = await client.graphql({ query: listArticles });
      const articles: Article[] = (result as any).data?.listArticles?.items || [];
      
      const formatted = articles.map(a => ({
        id: a.id,
        timestamp: a.timestamp,
        source: a.source,
        title: a.title,
        industry: a.industry,
        summary: a.summary,
        link: a.link ?? '#',
        companies: normalizeCompanies(a.companies),
        countries: normalizeCountries(a.countries),
        language: a.language ?? 'N/A',
        seen: true, // Mark initial articles as "seen"
      }));

      // Sort from newest to oldest by timestamp
      const now = new Date().getTime();
      const sorted = formatted.sort((a, b) =>
        new Date(b.timestamp ?? now).getTime() - new Date(a.timestamp ?? now).getTime()
      );
      
      const managedArticles = manageMemory(sorted);
      setArticles(managedArticles);
      setIsInitialized(true);
      console.log(`✅ Baseline established with ${managedArticles.length} articles.`);
    } catch (error) {
      console.error('Failed to fetch initial articles:', error);
    }
  }, [isInitialized, setArticles, setIsInitialized, manageMemory]);

  // Start polling for new articles
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      if (!isComponentMountedRef.current) return;

      const fetchArticles = async () => {
        try {
          const result = await client.graphql({ query: listArticles });
          const articles: Article[] = (result as any).data?.listArticles?.items || [];
          
          const newArticles = articles.filter(
            a => !articles.find(existing => existing.id === a.id) && !isArticleSeen(a.id)
          );

          if (newArticles.length > 0) {
            const formatted = newArticles.map(a => ({
              id: a.id,
              timestamp: a.timestamp,
              source: a.source,
              title: a.title,
              industry: a.industry,
              summary: a.summary,
              link: a.link ?? '#',
              companies: normalizeCompanies(a.companies),
              countries: normalizeCountries(a.countries),
              language: a.language ?? 'N/A',
              seen: false,
            }));

            formatted.forEach(article => addArticle(article));
            console.log(`📰 Polling: Added ${formatted.length} new articles`);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      fetchArticles();
    }, 30000); // Poll every 30 seconds
  }, [addArticle, isArticleSeen]);

  // Try to establish AppSync subscription
  const trySubscribe = useCallback(async () => {
    if (unsubscribeRef.current || subscriptionEstablishedRef.current) return;

    try {
      console.log('🔁 Attempting to establish AppSync subscription...');
      subscriptionEstablishedRef.current = true;
      
      const subscription = (client.graphql({
        query: onCreateArticle,
      }) as any).subscribe({
        next: ({ data }: { data: any }) => {
          if (!isComponentMountedRef.current) return;
          
          const newArticle = data.onCreateArticle;
          if (newArticle && !isArticleSeen(newArticle.id)) {
            const formatted: ArticleForState = {
              id: newArticle.id,
              timestamp: newArticle.timestamp,
              source: newArticle.source,
              title: newArticle.title,
              industry: newArticle.industry,
              summary: newArticle.summary,
              link: newArticle.link ?? '#',
              companies: normalizeCompanies(newArticle.companies),
              countries: normalizeCountries(newArticle.countries),
              language: newArticle.language ?? 'N/A',
              seen: false,
            };

            articleIdsFromSubscriptionRef.current.add(newArticle.id);
            addArticle(formatted);
            console.log('🟢 AppSync live: receiving news...');
          }
        },
        error: (error: any) => {
          console.error('Subscription error:', error);
          subscriptionEstablishedRef.current = false;
          if (isComponentMountedRef.current) {
            startPolling();
          }
        },
      });

      unsubscribeRef.current = () => subscription.unsubscribe();

      // Start shadow poller to detect missed articles
      if (!shadowPollerRef.current && !shadowPollerStoppedRef.current) {
        shadowPollerRef.current = setInterval(async () => {
          if (!isComponentMountedRef.current || shadowPollerStoppedRef.current) return;
          
          try {
            // Fetch the latest articles from the server (the ground truth)
            const result = await client.graphql({ query: listArticles });
            const articlesFromServer: Article[] = (result as any).data?.listArticles?.items || [];
           
            // Identify new articles that are not yet known
            const newServerArticles = articlesFromServer.filter(
              a => !articlesRef.current.find(m => m.id === a.id) && !isArticleSeen(a.id)
            );

            // If we have recent articles, check if the latest one came via WebSocket.
            if (newServerArticles.length > 0) {
              // Wait a brief moment to allow any in-flight WebSocket messages to arrive
              setTimeout(() => {
                if (!isComponentMountedRef.current) return;
                
                // Find if any new server article was NOT received by the subscription
                const missedArticle = newServerArticles.find(
                  a => !articleIdsFromSubscriptionRef.current.has(a.id)
                );
                if (missedArticle) {
                  console.warn(`⚠️ WebSocket missed article ${missedArticle.id}. Switching to polling.`);
                  if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                    unsubscribeRef.current = null;
                  }
                  subscriptionEstablishedRef.current = false;
                  startPolling();   // Start the reliable polling                  
                  shadowPollerStoppedRef.current = true;
                  if (shadowPollerRef.current) {
                    clearInterval(shadowPollerRef.current);
                    shadowPollerRef.current = null;
                  }
                } else {
                  // If all new articles were received via WebSocket, it's working reliably.
                  console.log('✅ WebSocket appears reliable. Stopping shadow poller.');
                  shadowPollerStoppedRef.current = true;
                  if (shadowPollerRef.current) {
                    clearInterval(shadowPollerRef.current);
                    shadowPollerRef.current = null;
                  }
                }
              }, WEBSOCKET_LATENCY_BUFFER);
            }
          } catch (err) {
            console.error('Shadow poller error:', err);
          }
        }, SHADOW_POLLER_INTERVAL);
      }
    } catch (err) {
      console.error('Subscription setup failed, falling back to polling:', err);
      subscriptionEstablishedRef.current = false;
      if (isComponentMountedRef.current) {
        startPolling();
      }
    }
  }, [addArticle, isArticleSeen, startPolling]);

  // Initialize when user changes
  useEffect(() => {
    if (isInitializingRef.current) return;
    
    // Don't initialize if user is logging out
    if (!user?.userId) return;
    
    isComponentMountedRef.current = true;
    isInitializingRef.current = true;
    cleanupResources();

    const initialize = async () => {
      await fetchInitialArticles();
      if (isComponentMountedRef.current) {
        trySubscribe();
      }
    };

    initialize();

    return () => {
      isComponentMountedRef.current = false;
      isInitializingRef.current = false;
      cleanupResources();
    };
  }, [user?.userId]); // Only depend on user ID, not the callback functions

  // Auto-mark articles as seen after 10 seconds
  useEffect(() => {
    if (articles.length === 0) return;
    
    const timer = setTimeout(() => {
      if (isComponentMountedRef.current) {
        const updatedArticles = articles.map(article => ({ ...article, seen: true }));
        setArticles(updatedArticles);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [articles.length]); // Only depend on articles length, not the full articles array

  // This component doesn't render anything, it just manages the news state
  return null;
}; 