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
// Seen cache limits to prevent unbounded growth
const SEEN_CACHE_MAX_SIZE = 2000;
const SEEN_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
      console.log('[NewsManager] Initializing GraphQL client');
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
    console.log(`[NewsManager] Articles state updated: ${articles.length} articles in memory`);
  }, [articles]);

  // Cleanup function to prevent memory leaks
  const cleanupResources = useCallback(() => {
    console.log('[NewsManager] Cleaning up resources');
    // Idempotent cleanup
    if (unsubscribeRef.current) {
      console.log('[NewsManager] Unsubscribing from AppSync subscription');
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (pollingIntervalRef.current) {
      console.log('[NewsManager] Clearing polling interval');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (shadowPollerRef.current) {
      console.log('[NewsManager] Clearing shadow poller');
      clearInterval(shadowPollerRef.current);
      shadowPollerRef.current = null;
    }
    // Reset flags
    shadowPollerStoppedRef.current = false;
    articleIdsFromSubscriptionRef.current.clear();
    subscriptionEstablishedRef.current = false;
    appSyncHasReceivedArticlesRef.current = false;
    console.log('[NewsManager] Resource cleanup completed');
  }, []);

  // Memory management: limit articles in memory while preserving seen tracking
  const manageMemory = useCallback((articles: ArticleForState[]) => {
    if (articles.length > MAX_ARTICLES_IN_MEMORY) {
      console.log(`[NewsManager] Memory management: trimming from ${articles.length} to ${MAX_ARTICLES_IN_MEMORY} articles`);
      const trimmed = articles.slice(0, MAX_ARTICLES_IN_MEMORY);
      
      // Update seen tracking for articles being removed from memory
      const removedArticles = articles.slice(MAX_ARTICLES_IN_MEMORY);
      const now = Date.now();
      removedArticles.forEach(article => {
        if (article.seen) {
          seenArticlesRef.current.set(article.id, now);
        }
      });

      // Prune seen cache by TTL and max size
      const nowTs = Date.now();
      let ttlEvictions = 0;
      // TTL eviction
      for (const [id, ts] of seenArticlesRef.current) {
        if (nowTs - ts > SEEN_CACHE_TTL_MS) {
          seenArticlesRef.current.delete(id);
          ttlEvictions++;
        }
      }
      if (ttlEvictions > 0) {
        console.log(`[NewsManager] TTL eviction: removed ${ttlEvictions} expired seen articles`);
      }
      
      let sizeEvictions = 0;
      // Size cap eviction (oldest first; Map preserves insertion order)
      while (seenArticlesRef.current.size > SEEN_CACHE_MAX_SIZE) {
        const oldestKey = seenArticlesRef.current.keys().next().value as string | undefined;
        if (!oldestKey) break;
        seenArticlesRef.current.delete(oldestKey);
        sizeEvictions++;
      }
      if (sizeEvictions > 0) {
        console.log(`[NewsManager] Size eviction: removed ${sizeEvictions} oldest seen articles`);
      }

      // Memory management trimming
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
      console.log('[NewsManager] Skipping initial fetch: component not mounted or already initialized');
      return;
    }
    
    console.log('[NewsManager] Fetching initial articles...');
    // Fetching initial articles
    try {
      const client = getClient();
      const result = await client.graphql({ query: listArticles });
      const articles: Article[] = (result as any).data?.listArticles?.items || [];
      console.log(`[NewsManager] Initial articles fetched: ${articles.length} articles from server`);
      
      // Debug logging to understand the data structure
      if (articles.length > 0) {
        const firstArticle = articles[0];
        console.log('[NewsManager] First article from initial fetch:', firstArticle);
        console.log('[NewsManager] First article ID:', firstArticle.id);
        console.log('[NewsManager] First article ID type:', typeof firstArticle.id);
        console.log('[NewsManager] First article ID length:', firstArticle.id?.length || 'undefined');
        console.log('[NewsManager] First article ID looks like URL:', firstArticle.id?.startsWith('http') ? 'YES' : 'NO');
        console.log('[NewsManager] First article ID looks like UUID:', /^[0-9a-f]{32}$/i.test(firstArticle.id) ? 'YES' : 'NO');
      }
      
      // Initial articles fetched
      
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
      console.log(`[NewsManager] Initial articles loaded: ${managedArticles.length} articles in state`);
      // Initial articles loaded
    } catch (error) {
      console.error('[NewsManager] Failed to fetch initial articles', error);
    }
  }, [isInitialized, setArticles, setIsInitialized, manageMemory, getClient]);

  // Start polling for new articles
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[NewsManager] Polling already active, skipping start');
      return;
    }
    console.log('[NewsManager] Starting polling for new articles');
    pollingIntervalRef.current = setInterval(async () => {
          if (!isComponentMountedRef.current) {
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
            console.log(`[NewsManager] Polling found ${newArticles.length} new articles`);
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
            console.log(`[NewsManager] Polling added ${newArticles.length} new articles to state`);
            // Polling added new articles
          } else {
            console.log('[NewsManager] Polling: no new articles found');
            // No new articles found
          }
        } catch (error) {
          console.error('[NewsManager] Polling error', error);
        }
      };
      fetchArticles();
    }, POLLER_INTERVAL);
    console.log(`[NewsManager] Polling started with ${POLLER_INTERVAL}ms interval`);
  }, [addArticle, isArticleSeen, getClient]);

  // Try to establish AppSync subscription
  const trySubscribe = useCallback(async () => {
    if (unsubscribeRef.current || subscriptionEstablishedRef.current) {
      console.log('[NewsManager] Subscription already active or established, skipping');
      return;
    }
    console.log('[NewsManager] Attempting to establish AppSync subscription...');
    try {
      // Attempt subscription
      const client = getClient();
      const subscription = (client.graphql({
        query: onCreateArticle,
      }) as any).subscribe({
        next: ({ data }: { data: any }) => {
          if (!isComponentMountedRef.current) return;
          const newArticle = data.onCreateArticle;
          
          // Debug logging to understand the data structure
          console.log('[NewsManager] AppSync subscription raw data:', data);
          console.log('[NewsManager] AppSync subscription newArticle object:', newArticle);
          console.log('[NewsManager] AppSync subscription newArticle type:', typeof newArticle);
          console.log('[NewsManager] AppSync subscription newArticle keys:', newArticle ? Object.keys(newArticle) : 'null');
          
          if (newArticle && !isArticleSeen(newArticle.id)) {
            console.log(`[NewsManager] AppSync subscription received new article: ${newArticle.id}`);
            console.log(`[NewsManager] Article ID type: ${typeof newArticle.id}`);
            console.log(`[NewsManager] Article ID length: ${newArticle.id?.length || 'undefined'}`);
            console.log(`[NewsManager] Article ID looks like URL: ${newArticle.id?.startsWith('http') ? 'YES' : 'NO'}`);
            console.log(`[NewsManager] Article ID looks like UUID: ${/^[0-9a-f]{32}$/i.test(newArticle.id) ? 'YES' : 'NO'}`);
            
            // Mark subscription as established only when we receive the first article
            if (!subscriptionEstablishedRef.current) {
              subscriptionEstablishedRef.current = true;
              console.log('[NewsManager] AppSync subscription established successfully');
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
            console.log(`[NewsManager] AppSync live: article ${newArticle.id} added to state`);
            // AppSync live: receiving news
          } else {
            console.log(`[NewsManager] AppSync received duplicate/seen article: ${newArticle?.id || 'unknown'}`);
            // Duplicate or seen article
          }
        },
        error: (error: any) => {
          console.error('[NewsManager] Subscription error', error);
          subscriptionEstablishedRef.current = false;
          console.log('[NewsManager] AppSync subscription failed, falling back to polling');
          if (isComponentMountedRef.current) {
            startPolling();
          }
        },
      });
      unsubscribeRef.current = () => subscription.unsubscribe();
      console.log('[NewsManager] AppSync subscription setup completed, starting shadow poller');
      // Start shadow poller to detect missed articles
      if (!shadowPollerRef.current && !shadowPollerStoppedRef.current) {
        console.log('[NewsManager] Starting shadow poller to monitor AppSync reliability');
        // Start shadow poller
        shadowPollerRef.current = setInterval(async () => {
          if (!isComponentMountedRef.current || shadowPollerStoppedRef.current) {
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
                console.log(`[NewsManager] Shadow poller detected ${missedArticles.length} missed articles by AppSync, switching to polling`);
                // Missed articles by AppSync; switching to polling
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
                  console.log('[NewsManager] AppSync proven reliable, stopping shadow poller');
                  // AppSync reliable
                  // Stop shadow poller, keep AppSync
                  shadowPollerStoppedRef.current = true;
                  if (shadowPollerRef.current) {
                    clearInterval(shadowPollerRef.current);
                    shadowPollerRef.current = null;
                  }
                } else {
                  console.log('[NewsManager] Shadow poller: AppSync not yet proven reliable, continuing monitoring');
                  // Continue monitoring
                }
              }
            }, WEBSOCKET_LATENCY_BUFFER);
          } catch (err) {
            console.error('[NewsManager] Shadow poller error', err);
          }
        }, POLLER_INTERVAL);
      }
    } catch (err) {
      console.error('[NewsManager] Subscription setup failed, falling back to polling', err);
      subscriptionEstablishedRef.current = false;
      if (isComponentMountedRef.current) {
        startPolling();
      }
    }
  }, [addArticle, isArticleSeen, startPolling, getClient]);

  // Initialize when user changes
  useEffect(() => {
    if (isInitializingRef.current) {
      console.log('[NewsManager] Already initializing, skipping');
      return;
    }
    if (!user?.userId) {
      console.log('[NewsManager] No user ID, skipping initialization');
      return;
    }
    // Check if user actually changed
    if (previousUserIdRef.current === user.userId) {
      console.log('[NewsManager] User ID unchanged, skipping initialization');
      return;
    }
    
    console.log(`[NewsManager] User changed from ${previousUserIdRef.current || 'none'} to ${user.userId}, initializing...`);
    previousUserIdRef.current = user.userId;
    isComponentMountedRef.current = true;
    isInitializingRef.current = true;
    cleanupResources();
    // Initializing for user
    const initialize = async () => {
      console.log('[NewsManager] Starting initialization sequence...');
      await fetchInitialArticles();
      if (isComponentMountedRef.current) {
        trySubscribe();
      }
      console.log('[NewsManager] Initialization sequence completed');
    };
    initialize();
    return () => {
      console.log('[NewsManager] Cleanup: component unmounted or user changed');
      isComponentMountedRef.current = false;
      isInitializingRef.current = false;
      previousUserIdRef.current = undefined;
      // Reset initialization state for React Strict Mode remounts
      setIsInitialized(false);
      cleanupResources();
      // Component unmounted or user changed
    };
  }, [user?.userId]); // Only depend on user ID, not the callback functions

  // This component doesn't render anything, it just manages the news state
  return null;
}; 