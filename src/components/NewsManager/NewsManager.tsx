import { useEffect, useRef, useCallback } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../../amplify/data/resource';
import { useNews } from '../../context/NewsContext';
import { listArticles } from '../../graphql/queries';
import { onCreateArticle } from '../../graphql/subscriptions';

// Constants
const MAX_ARTICLES_IN_MEMORY = 100;
const WEBSOCKET_LATENCY_BUFFER = 5000; // 5 seconds
const POLLER_INTERVAL = 60000; // 60 seconds

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
  const clientRef = useRef<ReturnType<typeof generateClient<Schema>> | null>(null);

  // Initialize client when needed
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = generateClient<Schema>();
    }
    return clientRef.current;
  }, []);

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
  const appSyncHasReceivedArticlesRef = useRef<boolean>(false);
  const previousUserIdRef = useRef<string | undefined>(undefined);

  // Keep articlesRef in sync with articles
  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  // Cleanup function to prevent memory leaks
  const cleanupResources = useCallback(() => {
    // Idempotent cleanup
    let cleaned = false;
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      cleaned = true;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      cleaned = true;
    }
    if (shadowPollerRef.current) {
      clearInterval(shadowPollerRef.current);
      shadowPollerRef.current = null;
      cleaned = true;
    }
    // Reset flags
    shadowPollerStoppedRef.current = false;
    articleIdsFromSubscriptionRef.current.clear();
    subscriptionEstablishedRef.current = false;
    appSyncHasReceivedArticlesRef.current = false;
    if (cleaned) {
      console.log('[NewsManager] 🧹 Cleaning up resources (unsubscribed, cleared intervals, reset flags)');
    } else {
      console.log('[NewsManager] 🧹 Cleanup called, nothing to clean');
    }
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
    if (!isComponentMountedRef.current || isInitialized) {
      console.log('[NewsManager] Skipping fetchInitialArticles: isComponentMountedRef.current:', isComponentMountedRef.current, 'isInitialized:', isInitialized);
      return;
    }
    
    console.log('[NewsManager] 📰 Fetching initial articles to establish a baseline...');
    try {
      const client = getClient();
      const result = await client.graphql({ query: listArticles });
      const articles: Article[] = (result as any).data?.listArticles?.items || [];
      console.log('[NewsManager] Initial articles fetched', articles.length);
      
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
        seen: false,
      }));

      // Sort articles by timestamp in reverse chronological order (newest first)
      const now = new Date().getTime();
      const sorted = formatted.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : now;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : now;
        return timeB - timeA; // Reverse chronological order
      });

      const managedArticles = manageMemory(sorted);
      setArticles(managedArticles);
      setIsInitialized(true);
      console.log(`[NewsManager] 📰 Loaded ${formatted.length} initial articles (sorted by timestamp)`);
    } catch (error) {
      console.error('[NewsManager] Failed to fetch initial articles:', error);
    }
  }, [isInitialized, setArticles, setIsInitialized, manageMemory, getClient]);

  // Start polling for new articles
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[NewsManager] Polling already running, skipping startPolling');
      return;
    }
    console.log('[NewsManager] 🟡 Starting polling for new articles...');
    pollingIntervalRef.current = setInterval(async () => {
      if (!isComponentMountedRef.current) {
        console.log('[NewsManager] Polling interval fired but component is unmounted');
        return;
      }
      const fetchArticles = async () => {
        try {
          const client = getClient();
          const result = await client.graphql({ query: listArticles });
          const articles: Article[] = (result as any).data?.listArticles?.items || [];
          const newArticles = articles.filter(
            a => !articlesRef.current.find(existing => existing.id === a.id) && !isArticleSeen(a.id)
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
            // Sort new articles by timestamp in reverse chronological order
            const now = new Date().getTime();
            const sorted = formatted.sort((a, b) => {
              const timeA = a.timestamp ? new Date(a.timestamp).getTime() : now;
              const timeB = b.timestamp ? new Date(b.timestamp).getTime() : now;
              return timeB - timeA; // Reverse chronological order
            });
            sorted.forEach(article => addArticle(article));
            console.log(`[NewsManager] 📰 Polling: Added ${formatted.length} new articles (sorted by timestamp):`, formatted.map(a => a.id));
          } else {
            console.log('[NewsManager] Polling: No new articles found');
          }
        } catch (error) {
          console.error('[NewsManager] Polling error:', error);
        }
      };
      fetchArticles();
    }, POLLER_INTERVAL);
  }, [addArticle, isArticleSeen, getClient]);

  // Try to establish AppSync subscription
  const trySubscribe = useCallback(async () => {
    if (unsubscribeRef.current || subscriptionEstablishedRef.current) {
      console.log('[NewsManager] Subscription already established, skipping trySubscribe');
      return;
    }
    try {
      console.log('[NewsManager] 🔁 Attempting to establish AppSync subscription...');
      const client = getClient();
      const subscription = (client.graphql({
        query: onCreateArticle,
      }) as any).subscribe({
        next: ({ data }: { data: any }) => {
          if (!isComponentMountedRef.current) return;
          const newArticle = data.onCreateArticle;
          if (newArticle && !isArticleSeen(newArticle.id)) {
            // Mark subscription as established only when we receive the first article
            if (!subscriptionEstablishedRef.current) {
              subscriptionEstablishedRef.current = true;
              console.log('[NewsManager] ✅ AppSync subscription confirmed working (first article received)');
            }
            // Mark that AppSync has received at least one article
            appSyncHasReceivedArticlesRef.current = true;
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
            console.log('[NewsManager] 🟢 AppSync live: receiving news (via WebSocket):', newArticle.id);
          } else {
            console.log('[NewsManager] AppSync received duplicate or already seen article:', newArticle?.id);
          }
        },
        error: (error: any) => {
          console.error('[NewsManager] Subscription error:', error);
          subscriptionEstablishedRef.current = false;
          if (isComponentMountedRef.current) {
            startPolling();
          }
        },
      });
      unsubscribeRef.current = () => subscription.unsubscribe();
      // Start shadow poller to detect missed articles
      if (!shadowPollerRef.current && !shadowPollerStoppedRef.current) {
        console.log('[NewsManager] 🟣 Starting shadow poller to verify WebSocket reliability...');
        shadowPollerRef.current = setInterval(async () => {
          if (!isComponentMountedRef.current || shadowPollerStoppedRef.current) {
            console.log('[NewsManager] Shadow poller fired but component is unmounted or stopped');
            return;
          }
          try {
            const client = getClient();
            const result = await client.graphql({ query: listArticles });
            const articlesFromServer: Article[] = (result as any).data?.listArticles?.items || [];
            // Wait for WebSocket latency buffer to allow AppSync to deliver any pending articles
            setTimeout(() => {
              if (!isComponentMountedRef.current || shadowPollerStoppedRef.current) return;
              
              // Check for articles in database that are NOT in local state (AppSync missed them)
              const missedArticles = articlesFromServer.filter(
                serverArticle => !articlesRef.current.find(localArticle => localArticle.id === serverArticle.id) && !isArticleSeen(serverArticle.id)
              );
              
              if (missedArticles.length > 0) {
                console.log('[NewsManager] ⚠️ Shadow poller found articles missed by AppSync:', missedArticles.map(a => a.id));
                console.log('[NewsManager] Switching from AppSync to polling due to missed articles');
                // Stop AppSync subscription
                if (unsubscribeRef.current) {
                  unsubscribeRef.current();
                  unsubscribeRef.current = null;
                }
                subscriptionEstablishedRef.current = false;
                // Start polling
                startPolling();
                // Stop shadow poller
                shadowPollerStoppedRef.current = true;
                if (shadowPollerRef.current) {
                  clearInterval(shadowPollerRef.current);
                  shadowPollerRef.current = null;
                }
              } else {
                // Only stop shadow poller if AppSync has received at least one article (proving it works)
                if (appSyncHasReceivedArticlesRef.current) {
                  console.log('[NewsManager] ✅ Shadow poller confirms AppSync is reliable - no articles missed and AppSync has proven itself');
                  // Stop shadow poller, keep AppSync
                  shadowPollerStoppedRef.current = true;
                  if (shadowPollerRef.current) {
                    clearInterval(shadowPollerRef.current);
                    shadowPollerRef.current = null;
                  }
                } else {
                  console.log('[NewsManager] Shadow poller: No missed articles found, but AppSync has not received any articles yet - continuing to monitor');
                }
              }
            }, WEBSOCKET_LATENCY_BUFFER);
          } catch (err) {
            console.error('[NewsManager] Shadow poller error:', err);
          }
        }, POLLER_INTERVAL);
      }
    } catch (err) {
      console.error('[NewsManager] Subscription setup failed, falling back to polling:', err);
      subscriptionEstablishedRef.current = false;
      if (isComponentMountedRef.current) {
        startPolling();
      }
    }
  }, [addArticle, isArticleSeen, startPolling, getClient]);

  // Initialize when user changes
  useEffect(() => {
    console.log('[NewsManager] useEffect triggered - user?.userId:', user?.userId, 'previousUserId:', previousUserIdRef.current);
    
    if (isInitializingRef.current) {
      console.log('[NewsManager] Initialization already in progress, skipping');
      return;
    }
    if (!user?.userId) {
      console.log('[NewsManager] No user detected, skipping initialization');
      return;
    }
    
    // Check if user actually changed
    if (previousUserIdRef.current === user.userId) {
      console.log('[NewsManager] User ID unchanged, skipping re-initialization');
      return;
    }
    
    previousUserIdRef.current = user.userId;
    isComponentMountedRef.current = true;
    isInitializingRef.current = true;
    cleanupResources();
    console.log('[NewsManager] Initializing for user:', user.userId);
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
      previousUserIdRef.current = undefined;
      // Reset initialization state for React Strict Mode remounts
      setIsInitialized(false);
      cleanupResources();
      console.log('[NewsManager] Component unmounted or user changed, cleanup complete');
    };
  }, [user?.userId]); // Only depend on user ID, not the callback functions

  // This component doesn't render anything, it just manages the news state
  return null;
}; 