import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NewsSocketClient.css';
import { generateClient } from 'aws-amplify/api';
import { listArticles } from '../../graphql/queries';
import { onCreateArticle } from '../../graphql/subscriptions';
import { Article } from '../../API';

const client = generateClient();
const ARTICLE_RETENTION_HOURS = 6;
const MAX_ARTICLES = 30;

interface ArticleForState {
  id: string;
  timestamp?: string | null;
  source: string;
  title: string;
  industry?: string | null;
  summary?: string | null;
  link: string;
  companies?: Record<string, string> | null;
  seen: boolean;
}

function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isRecent(timestamp: string | null | undefined, hours: number): boolean {
  if (!timestamp) return false;
  try {
    const messageTime = new Date(timestamp).getTime();
    if (isNaN(messageTime)) return false;
    const threshold = Date.now() - hours * 60 * 60 * 1000;
    return messageTime >= threshold;
  } catch {
    return false;
  }
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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('newsMessages');
    if (saved) {
      try {
        const parsedMessages: ArticleForState[] = JSON.parse(saved);
        const recentMessages = parsedMessages.filter(msg => isRecent(msg.timestamp, ARTICLE_RETENTION_HOURS));
        setMessages(recentMessages);
      } catch {
        localStorage.removeItem('newsMessages');
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0 || localStorage.getItem('newsMessages') !== null) {
      const sorted = [...messages]
        .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
        .slice(0, MAX_ARTICLES); // keep only the newest N articles
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

    const startPolling = () => {
      const fetchArticles = async () => {
        try {
          const result: any = await client.graphql({ query: listArticles });
          const articles: Article[] = result.data?.listArticles?.items || [];
          setMessages(prevMessages => {
            const newMessages = articles.filter(a => !prevMessages.some(m => m.id === a.id));
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
              seen: !document.hidden,
            }));
            return [...formatted, ...prevMessages];
          });
        } catch (err) {
          console.error('Polling error:', err);
        }
      };
      pollingInterval = setInterval(fetchArticles, 20000);
      fetchArticles(); // initial
    };
    
    const trySubscribe = () => {
      console.log('🔁 Attempting to establish AppSync subscription...');
      try {
        const sub = client.graphql({ query: onCreateArticle }).subscribe({
          next: ({ data }) => {
            console.log('🟢 AppSync live: waiting for news...');
            const article = data?.onCreateArticle;
            if (!article) return;
            const formatted = {
              id: article.id,
              timestamp: article.timestamp,
              source: article.source,
              title: article.title,
              industry: article.industry,
              summary: article.summary,
              link: article.link ?? '#',
              companies: normalizeCompanies(article.companies),
              seen: !document.hidden,
            };
            setMessages(prev => [formatted, ...prev]);
          },
          error: (err) => {
            console.error('WebSocket error, falling back to polling:', err);
            startPolling();
          }
        });
        unsubscribe = () => sub.unsubscribe();

      } catch (err) {
        console.error('Subscription setup failed, falling back to polling:', err);
        startPolling();
      }
    };
  
    trySubscribe();

    return () => {
      unsubscribe?.();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);

  return (
    <div className="news-feed">
      {messages.length === 0 ? (
        <>
          <h1 className="news-feed-title">📡 Live News Feed</h1>
          <p className="no-news">🕓 Waiting for news...</p>
        </>
      ) : (
        <div className="articles-container">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className="article-link"
                onClick={() => window.open(msg.link, '_blank')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') window.open(msg.link, '_blank');
                }}>
                <motion.div
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
                    <strong className="article-source">| {msg.source} - </strong>{" "}
                    <strong className="article-title">{msg.title}</strong>{" "}
                    <span className="article-summary">{msg.summary}</span>
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
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default NewsSocketClient;
