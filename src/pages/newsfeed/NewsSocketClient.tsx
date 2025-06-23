import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listArticles } from '../../graphql/queries';
import { onCreateArticle } from '../../graphql/subscriptions';
import { Article } from '../../API';
import { publicClient } from "./../../amplify-client"
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
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
  //countries?: Record<string, string> | null;
  //language: string;
  seen: boolean;
}

function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

function NewsSocketClient() {
  const [messages, setMessages] = useState<ArticleForState[]>([]);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() => !document.hidden);

  const messagesRef = useRef<ArticleForState[]>([]);
  const articleIdsFromSubscriptionRef = useRef<Set<string>>(new Set());
  const { user } = useAuthenticator(); 
  const { isLoading } = useUserPreferences();

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

  // Unread counter in tab
  const unreadCount = messages.filter(msg => !msg.seen).length;  
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) 🔥 Live News Feed` : 'Live News Feed';
  }, [unreadCount]);

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
          //countries: normalizeCountries(a.countries),
          //language: a.language ?? 'N/A',
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
              //countries: normalizeCountries(a.countries),
              //language: a.language ?? 'N/A',
              seen: !document.hidden,
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
                //countries: normalizeCountries(article.countries),
                //language: article.language ?? 'N/A',
                seen: !document.hidden,
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

            // If any of these new articles were NOT received via WebSocket
            const missedArticle = newServerArticles.find(
              a => !articleIdsFromSubscriptionRef.current.has(a.id)
            );
      
            if (missedArticle) {
              console.warn(`⚠️ WebSocket missed article ${missedArticle.id}. Switching to polling.`);
              unsubscribe?.(); // Stop the failing subscription
              startPolling();   // Start the reliable polling
              
              shadowPollerStopped = true; // Stop this shadow poller
              clearInterval(shadowPoller!);
              return;
            }
            // SUCCESS CASE: If we have recent articles, check if the latest one came via WebSocket.
            // This confirms the WebSocket is reliable.
            if (newServerArticles.length > 0) {
                 console.log('✅ WebSocket appears reliable. Stopping shadow poller.');
                 shadowPollerStopped = true;
                 clearInterval(shadowPoller!);
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

  const filteredMessages = messages;


  return (
    <div className="news-feed">
      {filteredMessages.length === 0 ? (
        <div className="articles-container">
          <h1 className="news-feed-title">📡 Live News Feed</h1>
          <p className="no-news">
            {isLoading 
              ? "Loading preferences..." 
              : (messages.length > 0 ? "No articles match your current filters." : "🕓 Waiting for news...")
            }
          </p>
        </div>
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
                <p className="article-line">
                  <span className="article-industry">{msg.industry}</span>{" "}
                  <span className={`article-timestamp-wrapper ${!msg.seen ? 'unseen' : ''}`}>
                    <span className="article-timestamp">{formatLocalTime(msg.timestamp)}</span>
                  </span>
                  <a href={msg.link} target="_blank" rel="noopener noreferrer" className="article-title-link">
                    <strong className="article-source">| {msg.source} - </strong>{" "}
                    <strong className="article-title">{msg.title}</strong>
                    <span className="article-summary">{msg.summary}</span>{" "}
                  </a>
                  {msg.companies && typeof msg.companies === 'object' && (
                    <>
                      {Object.entries(msg.companies).map(([name, url]) => (
                        <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="article-companies">
                          {name}
                        </a>
                      ))}
                    </>
                  )}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default NewsSocketClient;