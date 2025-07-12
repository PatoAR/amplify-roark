import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useNews } from '../../context/NewsContext';
import { useSession } from '../../context/SessionContext';
import WelcomeScreen from '../../components/WelcomeScreen/WelcomeScreen';
import { useTranslation } from '../../i18n';
import './NewsSocketClient.css';

// Constants for filtering logic
const COUNTRY_OPTIONS = [
  { id: 'Q414', label: 'ARG', code:'ar' },
  { id: 'Q155', label: 'BRA', code: 'br' },
  { id: 'Q298', label: 'CHL', code: 'cl' },
  { id: 'Q733', label: 'PAR', code: 'py' },
  { id: 'Q77', label: 'URU', code: 'uy' },
];

function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function NewsSocketClient() {
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() => !document.hidden);
  const { preferences, isLoading, userProfileId } = useUserPreferences();
  const { articles, markArticleAsSeen } = useNews();
  const { trackArticleClick } = useSession();
  const { t } = useTranslation();

  // Handles opening the article link to a new tab.
  const handleArticleClick = async (event: React.MouseEvent<HTMLAnchorElement>, link: string, articleId: string, articleTitle: string) => {
    event.preventDefault();
    
    // Track article click
    trackArticleClick(articleId, articleTitle);
    
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  // Tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Timer for new messages
  useEffect(() => {
    if (isTabVisible && articles.some(msg => !msg.seen)) {
      const timer = setTimeout(() => {
        articles.forEach(article => {
          if (!article.seen) {
            markArticleAsSeen(article.id);
          }
        });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isTabVisible, articles, markArticleAsSeen]);

  const filteredMessages = articles.filter(msg => {
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
    
    // Check if "all countries" is selected (all available countries are selected)
    const allCountriesSelected = preferences.countries.length === COUNTRY_OPTIONS.length;
    
    // When all countries are selected, treat it as having no country filters
    const effectiveHasCountryFilters = hasCountryFilters && !allCountriesSelected;

    // Determine if the current article matches the selected filters.
    const industryMatches = !!(msg.industry && preferences.industries.includes(msg.industry));
    const articleCountryCodes = Array.isArray(msg.countries) ? msg.countries : []
    const countryMatches = articleCountryCodes.some(code => preferences.countries.includes(code));

    // Case 1: Filters are set for BOTH Industries and Countries.
    // An article must match one of each.
    if (hasIndustryFilters && effectiveHasCountryFilters) {
      return industryMatches && countryMatches;
    }

    // Case 2: Filters are set for Industries ONLY.
    // An article only needs to match an industry.
    if (hasIndustryFilters) {
      return industryMatches;
    }

    // Case 3: Filters are set for Countries ONLY (but not "all countries").
    // An article only needs to match a country.
    if (effectiveHasCountryFilters) {
      return countryMatches;
    }

    // Case 4: No filters are set OR "all countries" is selected.
    // Show all articles.
    return true;
  });

  // Unread counter in tab
  const unreadCount = filteredMessages.filter(msg => !msg.seen).length;  
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) 🔥 Perkins Live Feed` : 'Perkins Live Feed';
  }, [unreadCount]);

  return (
    <div className="news-feed">
      {isLoading ? (
        <p className="no-news">{t('common.loadingPreferences')}</p>
      
      ) : userProfileId === null ? (
        <WelcomeScreen />
      
      ) : filteredMessages.length === 0 ? (
        <p className="no-news">
          {articles.length > 0
            ? t('common.noArticles')
            : t('common.waitingForNews')
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
                  onClick={(e) => handleArticleClick(e, msg.link, msg.id, msg.title)} 
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