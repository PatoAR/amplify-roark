import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listArticles } from '../../graphql/queries';
import { onCreateArticle } from '../../graphql/subscriptions';
import { Article } from '../../graphql/API';
import { publicClient } from "./../../amplify-client"
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import WelcomeScreen from '../../components/WelcomeScreen/WelcomeScreen'; 
import './NewsSocketClient.css';

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

function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options: { width: number; height: number }) => Promise<Window>;
    };
  }
}

// Handles opening the article link to a new tab.
const handleArticleClick = async (event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
  event.preventDefault();
  const a = document.createElement('a');
  a.href = link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
};

function NewsSocketClient() {
  const [messages, setMessages] = useState<ArticleForState[]>([]);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() => !document.hidden);

  const messagesRef = useRef<ArticleForState[]>([]);
  const articleIdsFromSubscriptionRef = useRef<Set<string>>(new Set());
  const { user } = useAuthenticator(); 
  const { preferences, isLoading, userProfileId } = useUserPreferences();

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // When a new user logs in, clear the old cache and message state.
  useEffect(() => {
    setMessages([]);
    localStorage.removeItem('newsMessages');
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0 || localStorage.getItem('newsMessages') !== null) {
      const sorted = [...messages]
        .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      localStorage.setItem('newsMessages', JSON.stringify(sorted));
    }
  }, [messages]);

  // Tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Timer for new messages
  useEffect(() => {
    if (isTabVisible && messages.some(msg => !msg.seen)) {
      const timer = setTimeout(() => {
        setMessages(prev => prev.map(msg => (msg.seen ? msg : { ...msg, seen: true })));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isTabVisible, messages]);

  // Polling for articles
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    let shadowPoller: ReturnType<typeof setInterval> | null = null;
    let shadowPollerStopped = false;

    const fetchInitialArticles = async () => {
      console.log('📰 Fetching initial articles to establish a baseline...');
      try {
        const result: any = await publicClient.graphql({ query: listArticles });
        const articles: Article[] = result.data?.listArticles?.items || [];
        
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
            
        setMessages(sorted);
        console.log(`✅ Baseline established with ${formatted.length} articles.`);
      } catch (err) {
        console.error('Initial article fetch failed:', err);
      }
    };

    const startPolling = () => {
      console.log('🔄 Starting polling mode.');
      const fetchArticles = async () => {
        try {
          const result: any = await publicClient.graphql({ query: listArticles });
          const articles: Article[] = result.data?.listArticles?.items || [];
          
          setMessages(prevMessages => {
            const existingIds = new Set(prevMessages.map(m => m.id));
            const newMessages = articles.filter(a => !existingIds.has(a.id));

            if (newMessages.length === 0) return prevMessages;

            const formatted = newMessages.map(a => ({
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

            const now = Date.now();
            const sorted = formatted.sort((a, b) =>
              new Date(b.timestamp ?? now).getTime() - new Date(a.timestamp ?? now).getTime()
            );
            return [...sorted, ...prevMessages];
          });
        } catch (err) {
          console.error('Polling error:', err);
        }
      };
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(fetchArticles, 20000);
    };
    
    const trySubscribe = () => {
      console.log('🔁 Attempting to establish AppSync subscription...');
      try {
        const sub = publicClient.graphql({ query: onCreateArticle }).subscribe({
          next: ({ data }) => {
            console.log('🟢 AppSync live: receiving news...');
            const article = data?.onCreateArticle;
            if (!article) return;
            
            if (!messagesRef.current.some(msg => msg.id === article.id) && !articleIdsFromSubscriptionRef.current.has(article.id)) {

              articleIdsFromSubscriptionRef.current.add(article.id);

              const formatted = {
                id: article.id,
                timestamp: article.timestamp,
                source: article.source,
                title: article.title,
                industry: article.industry,
                summary: article.summary,
                link: article.link ?? '#',
                companies: normalizeCompanies(article.companies),
                countries: normalizeCountries(article.countries),
                language: article.language ?? 'N/A',
                seen: false,
              };
              setMessages(prev => [formatted, ...prev]);
            }
          },
          error: (err) => {
            console.error('WebSocket error:', err);
            startPolling();
          }
        });
        
        unsubscribe = () => sub.unsubscribe();

        // Start shadow poller to verify WebSocket reliability
        shadowPoller = setInterval(async () => {
          if (shadowPollerStopped) {
            clearInterval(shadowPoller!);
            return;
          }
          try {
            // Fetch the latest articles from the server (the ground truth)
            const result: any = await publicClient.graphql({ query: listArticles });
            const articlesFromServer: Article[] = result.data?.listArticles?.items || [];
           
            // Identify new articles that are not yet known
            const newServerArticles = articlesFromServer.filter(
              a => !messagesRef.current.find(m => m.id === a.id)
            );

            // If we have recent articles, check if the latest one came via WebSocket.
            if (newServerArticles.length > 0) {
              // Wait a brief moment to allow any in-flight WebSocket messages to arrive
              setTimeout(() => {
                // Find if any new server article was NOT received by the subscription
                const missedArticle = newServerArticles.find(
                  a => !articleIdsFromSubscriptionRef.current.has(a.id)
                );
                if (missedArticle) {
                  console.warn(`⚠️ WebSocket missed article ${missedArticle.id}. Switching to polling.`);
                  unsubscribe?.(); // Stop the failing subscription
                  startPolling();   // Start the reliable polling                  
                  shadowPollerStopped = true;
                  clearInterval(shadowPoller!);
                } else {
                  // If all new articles were received via WebSocket, it's working reliably.
                  console.log('✅ WebSocket appears reliable. Stopping shadow poller.');
                  shadowPollerStopped = true;
                  clearInterval(shadowPoller!);
                }
              }, 2000); // 2-second buffer to account for WebSocket latency
            }
          } catch (err) {
            console.error('Shadow poller error:', err);
          }
        }, 60000); // Keep the polling interval
      } catch (err) {
        console.error('Subscription setup failed, falling back to polling:', err);
        startPolling();
      }
    };
  
    const initialize = async () => {
      await fetchInitialArticles();
      trySubscribe();
    };

    initialize();

    return () => {
      unsubscribe?.();
      if (pollingInterval) clearInterval(pollingInterval);
      if (shadowPoller) clearInterval(shadowPoller);
    };
  }, []);

  const filteredMessages = messages.filter(msg => {
    // While preferences are loading, show nothing to avoid a flicker of unfiltered content.
    if (isLoading) {
      return false;
    }

    // If the user has no profile yet (is a new user), show nothing.
    // if (userProfileId === null) {
    //  return false;
    //}

    // --- Filtering Logic ---
    const hasIndustryFilters = preferences.industries.length > 0;
    const hasCountryFilters = preferences.countries.length > 0;

    // Determine if the current article matches the selected filters.
    const industryMatches = !!(msg.industry && preferences.industries.includes(msg.industry));
    const articleCountryCodes = Array.isArray(msg.countries) ? msg.countries : []
    const countryMatches = articleCountryCodes.some(code => preferences.countries.includes(code));

    // Case 1: Filters are set for BOTH Industries and Countries.
    // An article must match one of each.
    if (hasIndustryFilters && hasCountryFilters) {
      return industryMatches && countryMatches;
    }

    // Case 2: Filters are set for Industries ONLY.
    // An article only needs to match an industry.
    if (hasIndustryFilters) {
      return industryMatches;
    }

    // Case 3: Filters are set for Countries ONLY.
    // An article only needs to match a country.
    if (hasCountryFilters) {
      return countryMatches;
    }

    // Case 4: No filters are set.
    // An existing user wants to see all news, so show everything.
    return true;
  });

  // Unread counter in tab
  const unreadCount = filteredMessages.filter(msg => !msg.seen).length;  
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) 🔥 Live News Feed` : 'Live News Feed';
  }, [unreadCount]);

  return (
    <div className="news-feed">
      {isLoading ? (
        <p className="no-news">Loading preferences...</p>
      
      ) : userProfileId === null ? (
        <WelcomeScreen />
      
      ) : filteredMessages.length === 0 ? (
        <p className="no-news">
          {messages.length > 0
            ? "No articles match your current filters."
            : "🕓 Waiting for news..."
          }
        </p>
  
      ) : (
        <div className="articles-container">
          <AnimatePresence initial={false}>
            {filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                layout="position"
                className={`article-card ${msg.seen ? '' : 'unseen'}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                transition={{ duration: 0.5 }}
              >
                <a 
                  href={msg.link} 
                  onClick={(e) => handleArticleClick(e, msg.link)} 
                  className="article-line-link"
                >
                  <p className="article-line">
                    <span className="article-industry">{msg.industry}</span>{" "}
                    <span className="article-timestamp-wrapper">
                      <span className="article-timestamp">{formatLocalTime(msg.timestamp)}</span>
                    </span>
                    <strong className="article-source">| {msg.source} - </strong>{" "}
                    <strong className="article-title">{msg.title}</strong>
                    <span className="article-summary">{msg.summary}</span>{" "}
                    {msg.companies && typeof msg.companies === 'object' && (
                      <>
                        {Object.entries(msg.companies).map(([name, url]) => (
                          <span
                            key={name}
                            className="article-companies"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents bubbling to outer <a>
                              e.preventDefault();  // Prevents any anchor behavior just in case
                              const a = document.createElement('a');
                              a.href = url;
                              a.target = '_blank';
                              a.rel = 'noopener noreferrer';
                              a.click();
                            }}
                            title={`Google > ${name}`}
                          >
                            {name}
                          </span>
                        ))}
                      </>
                    )}
                  </p>
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default NewsSocketClient;