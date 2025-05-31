import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NewsSocketClient.css';

import { generateClient } from 'aws-amplify/api';
import { onCreateArticle } from '../../graphql/subscriptions';
import { OnCreateArticleSubscription } from '../../API';
import { listArticles } from '../../graphql/queries';

// Define a client
const client = generateClient();

// Interface for articles in your component's state
interface ArticleForState {
  id: string; 
  timestamp?: string | null;
  source: string;
  title: string; 
  industry?: string | null; 
  summary?: string | null; 
  link: string; 
  companies?: Record<string, string> | null;
  seen: boolean; // local UI state, non-optional for consistency in state
}

// Utility: Format timestamp into local time
function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function NewsSocketClient() {
  const [messages, setMessages] = useState<ArticleForState[]>([]);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() => !document.hidden); // Initial state from document.hidden

  // Load articles from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('newsMessages');
    if (saved) {
      try {
        const parsedMessages: ArticleForState[] = JSON.parse(saved);
        setMessages(parsedMessages);
      } catch (e) {
        console.error("Failed to parse messages from localStorage", e);
        localStorage.removeItem('newsMessages'); // Clear corrupted data
      }
    }
  }, []);

  // Persist messages to localStorage
  useEffect(() => {
    if(messages.length > 0 || localStorage.getItem('newsMessages') !== null) {
        localStorage.setItem('newsMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Update the document title whenever the unread count or tab visibility changes
  const unreadCount = messages.filter(msg => !msg.seen).length;
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) 🔥 Live News Feed`;
    } else {
      document.title = 'Live News Feed';
    }
  }, [unreadCount]);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Mark unseen articles as seen when tab becomes visible
  useEffect(() => {
    if (isTabVisible && messages.some(msg => !msg.seen)) {
      const timer = setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => (msg.seen ? msg : { ...msg, seen: true }))
        );
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isTabVisible, messages]);

  // Subscribe to new articles
  useEffect(() => {
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    let cleanupFn: (() => void) | undefined;

    const subscribeOrPoll = async () => {
      console.log('🔁 Attempting to establish AppSync subscription...');      
      const subscription = client
        .graphql({query: onCreateArticle,})
        .subscribe({
          next: (payload: { data?: OnCreateArticleSubscription | null; errors?: any[] }) => {
            console.log('✅ AppSync subscription active.');
            const newArticleData = payload.data?.onCreateArticle;
            console.log('📡 New article:', newArticleData);

            if (newArticleData) {
              const newArticleForState: ArticleForState = {
                id: newArticleData.id,
                timestamp: newArticleData.timestamp,
                source: newArticleData.source,
                title: newArticleData.title,
                industry: newArticleData.industry,
                summary: newArticleData.summary,
                link: newArticleData.link ?? '#',
                companies: newArticleData.companies || null,
                seen: !document.hidden,
              };

              setMessages((prevMessages) => {
                if (prevMessages.find(msg => msg.id === newArticleForState.id)) {
                  return prevMessages;
                }
                return [newArticleForState, ...prevMessages];
              });
            }
          },
          error: async (err: any) => {
            console.error('❌ Subscription failed, falling back to polling:', JSON.stringify(err, null, 2));
            // Start polling
            pollingInterval = setInterval(async () => {
              try {
                const result: any = await client.graphql({ query: listArticles });
                const articles: ArticleForState[] = result.data?.listArticles?.items || [];

                setMessages(prevMessages => {
                  const newMessages = articles.filter((a: ArticleForState) => 
                    !prevMessages.some(m => m.id === a.id)
                  );

                  if (newMessages.length === 0) return prevMessages;
                  
  
                  const formatted = newMessages.map((a: ArticleForState) => ({
                    id: a.id,
                    timestamp: a.timestamp,
                    source: a.source,
                    title: a.title,
                    industry: a.industry,
                    summary: a.summary,
                    link: a.link ?? '#',
                    companies: a.companies || null,
                    seen: !document.hidden,
                  }));

                  return [...formatted, ...prevMessages];
                });
              } catch (pollErr) {
                console.error('Polling error:', pollErr);
              }
            }, 20000); // Poll every 20 seconds
          },
          complete: () => {
            console.log('Subscription ended.');
          },
        });
    
      return () => {
        console.log('Cleaning up subscription and polling fallback...');
        subscription.unsubscribe();
        if (pollingInterval) clearInterval(pollingInterval);
      };
    };
  
    const run = async () => {
      cleanupFn = await subscribeOrPoll();
    };

    run();

    return () => {
      if (cleanupFn) cleanupFn();
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
              <a key={msg.id} href={msg.link} target="_blank" rel="noopener noreferrer" className="article-link">
                <motion.div
                  layout="position"
                  className={`article-card ${msg.seen ? '' : 'unseen'}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.5}}
                >
                  <p className="article-line">
                    <span className={`article-timestamp-wrapper ${!msg.seen ? 'unseen' : ''}`}>
                      <span className="article-timestamp">{formatLocalTime(msg.timestamp)}</span>
                    </span>
                    <span className="article-industry">{msg.industry}</span>{" "}
                    <strong className="article-source"> - {msg.source} - </strong>{" "}
                    <strong className="article-title">{msg.title}</strong>{" "}
                    <span className="article-summary">{msg.summary}</span>
                    {msg.companies && typeof msg.companies === 'object' && (
                      <span className="article-companies">
                        {Object.entries(msg.companies).map(([name, url]) => (
                          <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="company-link">
                            {name}
                          </a>
                        ))}
                      </span>
                    )}
                  </p>
                </motion.div>
              </a>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default NewsSocketClient;