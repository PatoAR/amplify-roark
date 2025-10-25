import { useEffect, useRef, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../../amplify/data/resource';
import { useNews } from '../../context/NewsContext';
import { useSession } from '../../context/SessionContext';
import { listArticles } from '../../graphql/queries';
import { onCreateArticle } from '../../graphql/subscriptions';
import { isArticlePriority, sortArticlesByPriority } from '../../utils/articleSorting';

// Constants
const MAX_ARTICLES_IN_MEMORY = 100;
const WEBSOCKET_LATENCY_BUFFER = 5000; // 5 seconds
const POLLER_INTERVAL = 60000; // 60 seconds
const POLL_LOOKBACK_WINDOW = 5 * 60 * 1000; // 5 minutes - buffer for polling queries
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
  category?: string | null;
  priorityDuration?: number | null;
  callToAction?: string | null;
  sponsorLink?: string | null;
  priorityUntil?: string | null;
  createdAt: string;
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
  category?: string | null;
  priorityDuration?: number | null;
  callToAction?: string | null;
  sponsorLink?: string | null;
  priorityUntil?: string | null;
  receivedAt: number; // Timestamp when article was received by the client
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

// Calculate priority expiration time using article creation time
function calculatePriorityUntil(article: Article): string | null {
  // Only calculate if article has priority duration and is STATISTICS or SPONSORED
  if (!article.priorityDuration || 
      (article.category !== 'STATISTICS' && article.category !== 'SPONSORED')) {
    return null;
  }
  
  // Use article creation time (when Perkins received it) as the base
  const articleCreatedAt = new Date(article.createdAt);
  const priorityUntil = new Date(articleCreatedAt.getTime() + (article.priorityDuration * 60 * 1000));
  return priorityUntil.toISOString();
}

// Helper function to process an article into ArticleForState format
function processArticle(a: Article, receivedAt: number): ArticleForState {
  const category = a.category || 'NEWS';
  const priorityUntil = calculatePriorityUntil(a);
  
  return {
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
    category,
    priorityDuration: a.priorityDuration || null,
    callToAction: a.callToAction || null,
    sponsorLink: a.sponsorLink || null,
    priorityUntil,
    receivedAt,
  };
}

export const NewsManager: React.FC = () => {
  const { authStatus, userId } = useSession();
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
    // Only log when articles actually change, not on every render
    if (articles.length !== articlesRef.current.length) {
    }
  }, [articles]);

  // Check for expired priorities and clean them up
  useEffect(() => {
    const checkExpiredPriorities = () => {
      const now = new Date().getTime();
      let hasExpiredPriorities = false;
      
      const updatedArticles = articlesRef.current.map(article => {
        // Only check articles that have priorityUntil field
        if (article.priorityUntil && new Date(article.priorityUntil).getTime() <= now) {
          hasExpiredPriorities = true;
          return { ...article, priorityUntil: null };
        }
        return article;
      });
      
      if (hasExpiredPriorities) {
        // Re-sort articles after priority expiration to maintain correct order
        const sorted = sortArticlesByPriority(updatedArticles);
        setArticles(sorted);
      }
    };

    const interval = setInterval(checkExpiredPriorities, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [setArticles]);

  // Cleanup function to prevent memory leaks
  const cleanupResources = useCallback(() => {
    // Idempotent cleanup
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
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
    appSyncHasReceivedArticlesRef.current = false;
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
  }, [seenArticlesRef]);

  // Fetch initial articles
  const fetchInitialArticles = useCallback(async () => {
    if (!isComponentMountedRef.current) {
            return;
    }
    if (isInitialized) {
            return;
    }
    
        // Fetching initial articles
    try {
      const client = getClient();
      const result = await client.graphql({ query: listArticles });
      const articles: Article[] = (result as any).data?.listArticles?.items || [];
            
      // Debug: Log article categories
      const categoryCounts = articles.reduce((acc, article) => {
        const category = article.category || 'NEWS';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('[NewsManager] Initial article categories:', categoryCounts);
            
      // Debug: Log SPONSORED and STATISTICS articles specifically
      const sponsoredArticles = articles.filter(a => a.category === 'SPONSORED');
      const statisticsArticles = articles.filter(a => a.category === 'STATISTICS');
      if (sponsoredArticles.length > 0) {
        console.log(`[NewsManager] Found ${sponsoredArticles.length} SPONSORED articles`);
      }
      if (statisticsArticles.length > 0) {
        console.log(`[NewsManager] Found ${statisticsArticles.length} STATISTICS articles`);
      }
      

      
      // Initial articles fetched
      
      const now = Date.now();
      const formatted = articles.map(a => processArticle(a, now));

      // Initial fetch: Sort by timestamp within each category (reverse chronological)
      const sorted = formatted.sort((a, b) => {
        const aIsPriority = isArticlePriority(a, now);
        const bIsPriority = isArticlePriority(b, now);
        
        // Priority articles stay at top
        if (aIsPriority && !bIsPriority) return -1;
        if (!aIsPriority && bIsPriority) return 1;
        
        // Within priority level, SPONSORED takes precedence over STATISTICS
        if (aIsPriority && bIsPriority) {
          if (a.category === 'SPONSORED' && b.category === 'STATISTICS') return -1;
          if (a.category === 'STATISTICS' && b.category === 'SPONSORED') return 1;
        }
        
        // Within same priority level and category, sort by timestamp (newest first)
        const aTime = new Date(a.timestamp || '').getTime();
        const bTime = new Date(b.timestamp || '').getTime();
        return bTime - aTime;
      });

      const managedArticles = manageMemory(sorted);
      
      // Debug: Log final article counts by category after sorting
      const finalCategoryCounts = managedArticles.reduce((acc, article) => {
        const category = article.category || 'NEWS';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('[NewsManager] Final article categories after sorting:', finalCategoryCounts);
            
      // Debug: Log priority articles specifically
      const priorityArticles = managedArticles.filter(a => isArticlePriority(a));
      console.log(`[NewsManager] Found ${priorityArticles.length} priority articles`);
      
      setArticles(managedArticles);
      setIsInitialized(true);
            // Initial articles loaded
    } catch (error) {
      console.error('[NewsManager] Failed to fetch initial articles', error);
    }
  }, [isInitialized, setArticles, setIsInitialized, manageMemory, getClient]);

  // Start polling for new articles
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return;
    }
    pollingIntervalRef.current = setInterval(async () => {
          if (!isComponentMountedRef.current) {
            return;
          }
      const fetchArticles = async () => {
        try {
          const client = getClient();
          // Only fetch articles created in the last 5 minutes to avoid pagination issues
          const lookbackTime = new Date(Date.now() - POLL_LOOKBACK_WINDOW).toISOString();
          const result = await client.graphql({ 
            query: listArticles,
            variables: {
              filter: {
                createdAt: { gt: lookbackTime }
              },
              limit: 250  // Safety buffer for high-volume periods
            }
          });
          const articles: Article[] = (result as any).data?.listArticles?.items || [];
          const nextToken = (result as any).data?.listArticles?.nextToken;
          
          // Debug logging to detect pagination issues
          if (nextToken) {
            console.warn('[NewsManager] ⚠️ PAGINATION: More articles exist beyond limit. Consider increasing lookback window.');
          }
          
          const newArticles = articles.filter(
            a => !articlesRef.current.find(existing => existing.id === a.id) && !isArticleSeen(a.id)
          );
          if (newArticles.length > 0) {
                        
            // Debug: Log new article categories
            const newCategoryCounts = newArticles.reduce((acc, article) => {
              const category = article.category || 'NEWS';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            console.log('[NewsManager] New article categories:', newCategoryCounts);
                        
            // Debug: Log SPONSORED and STATISTICS articles specifically
            const newSponsoredArticles = newArticles.filter(a => a.category === 'SPONSORED');
            const newStatisticsArticles = newArticles.filter(a => a.category === 'STATISTICS');
            if (newSponsoredArticles.length > 0) {
              console.log(`[NewsManager] Found ${newSponsoredArticles.length} new SPONSORED articles`);
            }
            if (newStatisticsArticles.length > 0) {
              console.log(`[NewsManager] Found ${newStatisticsArticles.length} new STATISTICS articles`);
            }
            const receivedAt = Date.now();
            const formatted = newArticles.map(a => processArticle(a, receivedAt));
            // Sort new articles with enhanced priority logic
            const sorted = sortArticlesByPriority(formatted);
            sorted.forEach(article => addArticle(article));
                        // Polling added new articles
          } else {
                        // No new articles found
          }
        } catch (error) {
          console.error('[NewsManager] Polling error', error);
        }
      };
      fetchArticles();
    }, POLLER_INTERVAL);
      }, [addArticle, isArticleSeen, getClient]);

  // Try to establish AppSync subscription
  const trySubscribe = useCallback(async () => {
    if (unsubscribeRef.current || subscriptionEstablishedRef.current) {
            return;
    }
        try {
      // Attempt subscription
      const client = getClient();
      const subscription = (client.graphql({
        query: onCreateArticle,
      }) as any).subscribe({
        next: ({ data }: { data: any }) => {
          if (!isComponentMountedRef.current) return;
          const newArticle = data.onCreateArticle;
          

          
          if (newArticle && !isArticleSeen(newArticle.id)) {
                        
            // Debug: Log article category for SPONSORED and STATISTICS
            const category = newArticle.category || 'NEWS';
            if (category === 'SPONSORED' || category === 'STATISTICS') {
                          }
            
            // Check if article has null category (potential race condition)
            if (newArticle.category === null) {
                            
              // Wait a short delay and fetch the article again to get complete data
              setTimeout(async () => {
                // Check if user is still authenticated before making GraphQL call
                if (!isComponentMountedRef.current || authStatus !== 'authenticated') {
                                    return;
                }
                
                try {
                  const client = getClient();
                  const result = await client.graphql({ 
                    query: listArticles,
                    variables: {
                      filter: { id: { eq: newArticle.id } }
                    }
                  });
                  const articles: Article[] = (result as any).data?.listArticles?.items || [];
                  
                  if (articles.length > 0 && articles[0].category) {
                    const formatted: ArticleForState = processArticle(articles[0], Date.now());
                    articleIdsFromSubscriptionRef.current.add(articles[0].id);
                    addArticle(formatted);
                  } else {
                    console.warn(`[NewsManager] Could not retrieve complete data for article ${newArticle.id}, using subscription data`);
                    // Fallback to original subscription data
                    const formatted: ArticleForState = processArticle(newArticle, Date.now());
                    articleIdsFromSubscriptionRef.current.add(newArticle.id);
                    addArticle(formatted);
                  }
                } catch (error) {
                  // Don't log auth errors as they're expected during logout
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  if (!errorMessage.includes('NoValidAuthTokens') && !errorMessage.includes('No federated jwt')) {
                    console.error(`[NewsManager] Error fetching complete article data for ${newArticle.id}:`, error);
                  }
                  // Fallback to original subscription data
                  const formatted: ArticleForState = processArticle(newArticle, Date.now());
                  articleIdsFromSubscriptionRef.current.add(newArticle.id);
                  addArticle(formatted);
                }
              }, 1000); // Wait 1 second for data consistency
              
              return; // Exit early, we'll handle this article in the setTimeout
            }
            
            // Mark subscription as established only when we receive the first article
            if (!subscriptionEstablishedRef.current) {
              subscriptionEstablishedRef.current = true;
                          }
            // Mark that AppSync has received at least one article
            appSyncHasReceivedArticlesRef.current = true;
            const formatted: ArticleForState = processArticle(newArticle, Date.now());
            articleIdsFromSubscriptionRef.current.add(newArticle.id);
            addArticle(formatted);
                        // AppSync live: receiving news
          } else {
                        // Duplicate or seen article
          }
        },
        error: (error: any) => {
          console.error('[NewsManager] Subscription error', error);
          subscriptionEstablishedRef.current = false;
                    if (isComponentMountedRef.current) {
            startPolling();
          }
        },
      });
      unsubscribeRef.current = () => subscription.unsubscribe();
            // Start shadow poller to detect missed articles
      if (!shadowPollerRef.current && !shadowPollerStoppedRef.current) {
                // Start shadow poller
        shadowPollerRef.current = setInterval(async () => {
          if (!isComponentMountedRef.current || shadowPollerStoppedRef.current) {
            return;
          }
          try {
            const client = getClient();
            // Only check recent articles to avoid pagination issues
            const lookbackTime = new Date(Date.now() - POLL_LOOKBACK_WINDOW).toISOString();
            const result = await client.graphql({ 
              query: listArticles,
              variables: {
                filter: {
                  createdAt: { gt: lookbackTime }
                },
                limit: 250
              }
            });
            const articlesFromServer: Article[] = (result as any).data?.listArticles?.items || [];
            // Wait for WebSocket latency buffer to allow AppSync to deliver any pending articles
            setTimeout(() => {
              if (!isComponentMountedRef.current || shadowPollerStoppedRef.current) return;
              
              // Check for articles in database that are NOT in local state (AppSync missed them)
              const missedArticles = articlesFromServer.filter(
                serverArticle => !articlesRef.current.find(localArticle => localArticle.id === serverArticle.id) && !isArticleSeen(serverArticle.id)
              );
              
              if (missedArticles.length > 0) {
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
                                    // AppSync reliable
                  // Stop shadow poller, keep AppSync
                  shadowPollerStoppedRef.current = true;
                  if (shadowPollerRef.current) {
                    clearInterval(shadowPollerRef.current);
                    shadowPollerRef.current = null;
                  }
                } else {
                                    // Continue monitoring
                }
              }
            }, WEBSOCKET_LATENCY_BUFFER);
          } catch (err) {
            // Don't log auth errors as they're expected during logout
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (!errorMessage.includes('NoValidAuthTokens') && !errorMessage.includes('No federated jwt')) {
              console.error('[NewsManager] Shadow poller error', err);
            }
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
  }, [addArticle, isArticleSeen, startPolling, getClient, authStatus]);

  // Initialize when user changes
  useEffect(() => {
    // Add a small delay to prevent rapid re-initialization
    const timeoutId = setTimeout(() => {
      if (isInitializingRef.current) {
        return;
      }
      if (authStatus !== 'authenticated' || !userId) {
        // User logged out - cleanup and reset
        if (previousUserIdRef.current) {
                    cleanupResources();
          previousUserIdRef.current = undefined;
          isInitializingRef.current = false;
          setIsInitialized(false); // Reset initialization state
        }
        return;
      }
      // Check if user actually changed
      if (previousUserIdRef.current === userId) {
        return;
      }
    
            previousUserIdRef.current = userId;
      isComponentMountedRef.current = true;
      isInitializingRef.current = true;
      // Don't cleanup during login - only during logout
      // Initializing for user
      const initialize = async () => {
                await fetchInitialArticles();
        if (isComponentMountedRef.current) {
          trySubscribe();
        }
              };
      initialize();
    }, 100); // 100ms delay to prevent rapid re-initialization

    return () => {
      clearTimeout(timeoutId);
    };
  }, [userId, authStatus, cleanupResources, fetchInitialArticles, trySubscribe, setIsInitialized]); // Depend on user ID and auth status

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup if component is actually unmounting (not during login)
      if (!isComponentMountedRef.current) {
                isComponentMountedRef.current = false;
        isInitializingRef.current = false;
        setIsInitialized(false);
        cleanupResources();
      }
    };
  }, [cleanupResources, setIsInitialized]);

  // This component doesn't render anything, it just manages the news state
  return null;
}; 