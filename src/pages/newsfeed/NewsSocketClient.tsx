import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "./NewsSocketClient.css"

const WEBSOCKET_URL = 'wss://wi6tjpl49b.execute-api.us-east-1.amazonaws.com/dev';

interface Article {
  timestamp?: string;
  source: string;
  title: string;
  industry: string;
  summary: string;
  link: string;
  companies: string;
  seen?: boolean;
}

interface WebSocketMessage {
  type: string;
  article: Article;
} 

function NewsSocketClient() {
  const [messages, setMessages] = useState<Article[]>([]);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(!document.hidden);


  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('newsMessages');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Mark unseen articles as seen after X seconds when user returns
  useEffect(() => {
    if (isTabVisible) {
      const timer = setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => msg.seen ? msg : { ...msg, seen: true })
        );
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isTabVisible]);

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);
    
    const cleanup = () => {
      ws.close();
    };
    window.addEventListener('beforeunload', cleanup);

    ws.onopen = () => console.log('🔌 WebSocket connected');

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.type === 'NEW_ARTICLE') {
          const newArticle = {
            ...data.article,
            seen: document.hidden ? false : true, // Mark as unseen if tab is hidden
            timestamp: formatTime(), // Add timestamp upon receiving
          };
          setMessages(prev => {
            const updated = [newArticle, ...prev];
            localStorage.setItem('newsMessages', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error('❌ Failed to parse WebSocket message', err);
      }
    };

    ws.onclose = () => console.log('🔌 WebSocket disconnected');
    ws.onerror = error => console.error('❌ WebSocket error:', error);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      ws.close();
    }
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
            {messages.map((msg, i) => (
              <a href={msg.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <motion.div
                  key={`${msg.title}-${i}`}
                  className={`article-card ${msg.seen ? '' : 'unseen'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 2, delay: 1 }}
                >
                  <p className="article-line" title={`${msg.industry} ${msg.title} ${msg.summary}`}>
                    <span className={`article-timestamp-wrapper ${!msg.seen ? 'unseen' : ''}`}>
                      <span className="article-timestamp">{msg.timestamp}</span>
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