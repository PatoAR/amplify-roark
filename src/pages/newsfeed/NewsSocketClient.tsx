import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useNews } from '../../context/NewsContext';
import { useSession } from '../../context/SessionContext';
import WelcomeScreen from '../../components/WelcomeScreen/WelcomeScreen';
import { useTranslation } from '../../i18n';
import { COUNTRY_OPTIONS } from '../../constants/countries';
import './NewsSocketClient.css';

function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function NewsSocketClient() {
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() => !document.hidden);
  const { preferences, isLoading, userProfileId } = useUserPreferences();
  const { articles, markArticleAsSeen } = useNews();
  const { trackArticleClick, isAuthenticated } = useSession();
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
    const hasGlobalSelected = preferences.countries.includes('global');
    
    // Console log the countries variable for each article being processed (muted)
    // console.log(`[Article Filter] Article ID: ${msg.id}, Countries:`, articleCountryCodes, 'Type:', typeof msg.countries);
    
    // New global option logic: when global is selected, show articles with no country value OR with country values NOT in COUNTRY_OPTIONS
    let countryMatches = false;
    if (hasGlobalSelected) {
      // Helper to map any value (id or code) to a known country ID
      const toCountryId = (value: unknown): string | null => {
        const v = String(value).trim().toLowerCase();
        const opt = COUNTRY_OPTIONS.find(
          c => c.id.toLowerCase() === v || c.code.toLowerCase() === v
        );
        return opt ? opt.id : null;
      };

      // Derive article country IDs and unknowns
      const rawArticleCountries = Array.isArray(msg.countries) ? msg.countries : [];
      const articleCountryIds = rawArticleCountries
        .map(toCountryId)
        .filter((id): id is string => id !== null);
      const allUnknown = rawArticleCountries.length > 0 && articleCountryIds.length === 0;

      // Selected countries (IDs only), excluding 'global'
      const selectedCountryIdSet = new Set<string>(
        preferences.countries.filter(id => id !== 'global')
      );

      const matchesSelectedCountries = (
        selectedCountryIdSet.size > 0 &&
        articleCountryIds.some(id => selectedCountryIdSet.has(id))
      );

      // Article matches if:
      // - It matches any explicitly selected country IDs, OR
      // - It has no countries, OR
      // - All its countries are unknown (not in COUNTRY_OPTIONS)
      const hasNoCountries = rawArticleCountries.length === 0;

      countryMatches = matchesSelectedCountries || hasNoCountries || allUnknown;

      // console.log(
      //   `[Article Filter] Global selected - hasNoCountries: ${hasNoCountries}, allUnknown: ${allUnknown}, matchesSelected (ids): ${matchesSelectedCountries}`
      // );
    } else {
      // Global option not selected - only show articles matching selected country IDs
      const toCountryId = (value: unknown): string | null => {
        const v = String(value).trim().toLowerCase();
        const opt = COUNTRY_OPTIONS.find(
          c => c.id.toLowerCase() === v || c.code.toLowerCase() === v
        );
        return opt ? opt.id : null;
      };
      const rawArticleCountries = Array.isArray(msg.countries) ? msg.countries : [];
      const articleCountryIds = rawArticleCountries
        .map(toCountryId)
        .filter((id): id is string => id !== null);

      const selectedCountryIdSet = new Set<string>(preferences.countries);

      countryMatches = selectedCountryIdSet.size > 0 && articleCountryIds.some(id => selectedCountryIdSet.has(id));
    }

    // Case 1: Filters are set for BOTH Industries and Countries.
    // An article must match one of each.
    if (hasIndustryFilters && effectiveHasCountryFilters) {
      const result = industryMatches && countryMatches;
      // console.log(`[Article Filter] Case 1 (Both filters): Industry: ${industryMatches}, Country: ${countryMatches}, Result: ${result}`);
      return result;
    }

    // Case 2: Filters are set for Industries ONLY.
    // An article only needs to match an industry.
    if (hasIndustryFilters) {
      const result = industryMatches;
      // console.log(`[Article Filter] Case 2 (Industry only): Industry: ${industryMatches}, Result: ${result}`);
      return result;
    }

    // Case 3: Filters are set for Countries ONLY (but not "all countries").
    // An article only needs to match a country.
    if (effectiveHasCountryFilters) {
      const result = countryMatches;
      // console.log(`[Article Filter] Case 3 (Country only): Country: ${countryMatches}, Result: ${result}`);
      return result;
    }

    // Case 4: No filters are set OR "all countries" is selected.
    // Show all articles.
    // console.log(`[Article Filter] Case 4 (No filters): Showing all articles`);
    return true;
  });

  // Unread counter in tab
  const unreadCount = filteredMessages.filter(msg => !msg.seen).length;  
  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    if (!isAuthenticated) {
      document.title = baseTitle;
      return;
    }
    document.title = unreadCount > 0 ? `(${unreadCount}) 🔥 ${baseTitle}` : baseTitle;
  }, [unreadCount, isAuthenticated]);

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
            {filteredMessages.map((msg) => {
              // Console log the countries for each displayed article (muted)
              // console.log(`[Displayed Article] ID: ${msg.id}, Title: ${msg.title}, Countries:`, msg.countries, 'Type:', typeof msg.countries);
              
              return (
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
            );
          })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default NewsSocketClient;