import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NewsSocketClient.css';

import { generateClient } from 'aws-amplify/api';
import { onCreateArticle } from '../../graphql/subscriptions';
import { OnCreateArticleSubscription } from '../../API';

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
  companies?: string | null; 
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
    console.log('Attempting to subscribe to onCreateArticle...');
    const subscription = client
      .graphql({
        query: onCreateArticle,
      })
      .subscribe({
        next: (payload: { data?: OnCreateArticleSubscription | null; errors?: any[] }) => {
          console.log('✅ Subscription to onCreateArticle is active.');
          const newArticleData = payload.data?.onCreateArticle;
          console.log('📡 New article received from subscription:', newArticleData);

          if (newArticleData) {
            const newArticleForState: ArticleForState = {
              id: newArticleData.id,
              timestamp: newArticleData.timestamp,
              source: newArticleData.source,
              title: newArticleData.title,
              industry: newArticleData.industry,
              summary: newArticleData.summary,
              link: newArticleData.link ?? '#',
              companies: newArticleData.companies,
              seen: document.hidden,
            };

            setMessages((prevMessages) => {
              if (prevMessages.find(msg => msg.id === newArticleForState.id)) {
                return prevMessages;
              }
              return [newArticleForState, ...prevMessages];
            });
          }
        },
        error: (err: any) => {
          console.error('Subscription error:', JSON.stringify(err, null, 2));
        },
        complete: () => {
          console.log('Subscription ended.');
        },
      });

    return () => {
      console.log('Unsubscribing from onCreateArticle...');
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount 

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