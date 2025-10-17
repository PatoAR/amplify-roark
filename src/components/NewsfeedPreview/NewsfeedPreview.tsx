import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n';
import './NewsfeedPreview.css';

interface MockArticle {
  id: string;
  timestamp: string;
  source: string;
  title: string;
  industry: string;
  summary: string;
  link: string;
  companies?: Record<string, string>;
  seen: boolean;
  receivedAt: number;
}

// Mock article data pool
const MOCK_ARTICLES_POOL: Omit<MockArticle, 'id' | 'timestamp' | 'seen' | 'receivedAt'>[] = [
  {
    source: 'TechCrunch',
    title: 'AI-Powered Analytics Platform Raises $50M Series B',
    industry: 'Technology',
    summary: 'Leading data analytics company secures major funding round to expand AI capabilities and enterprise solutions.',
    link: '#',
    companies: { 'DataCorp': '#', 'Venture Capital Inc': '#' }
  },
  {
    source: 'Healthcare Today',
    title: 'Breakthrough in Personalized Medicine Shows Promise',
    industry: 'Healthcare',
    summary: 'New research demonstrates significant improvements in patient outcomes through genomic-based treatment approaches.',
    link: '#',
    companies: { 'GeneMed': '#', 'BioPharma Labs': '#' }
  },
  {
    source: 'Financial Times',
    title: 'Global Markets React to Economic Policy Changes',
    industry: 'Finance',
    summary: 'Major indices show volatility as central banks announce new monetary policies affecting global trade.',
    link: '#',
    companies: { 'Goldman Sachs': '#', 'JP Morgan': '#' }
  },
  {
    source: 'Retail Wire',
    title: 'E-commerce Giant Launches Sustainability Initiative',
    industry: 'Retail',
    summary: 'Major retailer announces comprehensive plan to achieve carbon neutrality by 2030.',
    link: '#',
    companies: { 'Amazon': '#', 'Shopify': '#' }
  },
  {
    source: 'Energy Weekly',
    title: 'Renewable Energy Investments Reach Record High',
    industry: 'Energy',
    summary: 'Solar and wind projects attract unprecedented levels of investment as costs continue to decline.',
    link: '#',
    companies: { 'NextEra Energy': '#', 'Tesla Energy': '#' }
  },
  {
    source: 'Manufacturing News',
    title: 'Smart Factory Technology Drives 40% Efficiency Gain',
    industry: 'Manufacturing',
    summary: 'IoT sensors and AI optimization systems transform traditional manufacturing processes.',
    link: '#',
    companies: { 'Siemens': '#', 'GE Digital': '#' }
  },
  {
    source: 'Real Estate Daily',
    title: 'Commercial Property Demand Shifts to Hybrid Spaces',
    industry: 'Real Estate',
    summary: 'Flexible office designs gain traction as companies adapt to new work patterns.',
    link: '#',
    companies: { 'WeWork': '#', 'CBRE': '#' }
  },
  {
    source: 'Automotive World',
    title: 'Electric Vehicle Sales Surge 150% Year-Over-Year',
    industry: 'Automotive',
    summary: 'Consumer adoption of EVs accelerates as charging infrastructure expands nationwide.',
    link: '#',
    companies: { 'Tesla': '#', 'Ford': '#', 'Rivian': '#' }
  },
  {
    source: 'Telecom Insider',
    title: '5G Network Expansion Reaches 80% of Urban Markets',
    industry: 'Telecommunications',
    summary: 'Major carriers complete infrastructure upgrades enabling next-generation mobile services.',
    link: '#',
    companies: { 'Verizon': '#', 'AT&T': '#' }
  },
  {
    source: 'AgTech Today',
    title: 'Precision Agriculture Tools Boost Crop Yields 25%',
    industry: 'Agriculture',
    summary: 'AI-driven farming solutions help growers optimize water usage and increase productivity.',
    link: '#',
    companies: { 'John Deere': '#', 'Climate Corp': '#' }
  },
  {
    source: 'EdTech Review',
    title: 'Online Learning Platform User Base Doubles',
    industry: 'Education',
    summary: 'Digital education continues growth trajectory with new interactive features and global reach.',
    link: '#',
    companies: { 'Coursera': '#', 'Khan Academy': '#' }
  },
  {
    source: 'Hospitality Business',
    title: 'Travel Industry Recovery Exceeds Pre-Pandemic Levels',
    industry: 'Hospitality',
    summary: 'Hotels and airlines report strong bookings as international travel rebounds.',
    link: '#',
    companies: { 'Marriott': '#', 'Airbnb': '#' }
  }
];

function formatLocalTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const NewsfeedPreview: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<MockArticle[]>([]);
  const [nextArticleIndex, setNextArticleIndex] = useState(0);

  // Initialize with first 9 articles
  useEffect(() => {
    const initialArticles = MOCK_ARTICLES_POOL.slice(0, 9).map((article, index) => ({
      ...article,
      id: `preview-${index}`,
      timestamp: new Date(Date.now() - (9 - index) * 60000).toISOString(), // Stagger by 1 min each
      seen: true,
      receivedAt: Date.now() - (9 - index) * 60000
    }));
    setArticles(initialArticles);
    setNextArticleIndex(9);
  }, []);

  // Simulate new articles arriving every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextArticleIndex < MOCK_ARTICLES_POOL.length) {
        const newArticle: MockArticle = {
          ...MOCK_ARTICLES_POOL[nextArticleIndex],
          id: `preview-${nextArticleIndex}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          seen: false,
          receivedAt: Date.now()
        };

        setArticles(prev => [newArticle, ...prev].slice(0, 9)); // Keep max 9 visible
        setNextArticleIndex(prev => (prev + 1) % MOCK_ARTICLES_POOL.length);

        // Mark as seen after 3 seconds
        setTimeout(() => {
          setArticles(current => 
            current.map(article => 
              article.id === newArticle.id ? { ...article, seen: true } : article
            )
          );
        }, 3000);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [nextArticleIndex]);

  const handleArticleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Do nothing for preview - it's just a demo
  };

  const handleCompanyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Do nothing for preview
  };

  return (
    <div className="newsfeed-preview">
      <div className="newsfeed-preview-header">
        <h3 className="newsfeed-preview-title">{t('newsfeedPreview.title')}</h3>
        <p className="newsfeed-preview-subtitle">{t('newsfeedPreview.subtitle')}</p>
      </div>
      
      <div className="newsfeed-preview-content">
        <AnimatePresence initial={false}>
          {articles.map((article) => (
            <motion.div
              key={article.id}
              layout="position"
              className={`preview-article-card ${article.seen ? '' : 'unseen'}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              layoutId={article.id}
            >
              <a 
                href={article.link} 
                onClick={handleArticleClick}
                className="preview-article-link"
              >
                <p className="preview-article-line">
                  <span className="preview-article-industry">{article.industry}</span>{" "}
                  <span className="preview-article-timestamp-wrapper">
                    <span className="preview-article-timestamp">{formatLocalTime(article.timestamp)}</span>
                  </span>
                  <strong className="preview-article-source">| {article.source} - </strong>{" "}
                  <strong className="preview-article-title">{article.title}</strong>
                  <span className="preview-article-summary">{article.summary}</span>{" "}
                  {article.companies && (
                    <>
                      {Object.entries(article.companies).map(([name]) => (
                        <span
                          key={name}
                          className="preview-article-companies"
                          onClick={handleCompanyClick}
                          title={`${name}`}
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
    </div>
  );
};

export default NewsfeedPreview;

