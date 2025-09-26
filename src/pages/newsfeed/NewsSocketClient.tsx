import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useNews } from '../../context/NewsContext';
import WelcomeScreen from '../../components/WelcomeScreen/WelcomeScreen';
import { useTranslation } from '../../i18n';
import { COUNTRY_OPTIONS } from '../../constants/countries';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { GracePeriodBanner } from '../../components/GracePeriodBanner';
import './NewsSocketClient.css';

function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function NewsSocketClient() {
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() => !document.hidden);
  const [displayedCount, setDisplayedCount] = useState<number>(50);
  const { preferences, isLoading, userProfileId } = useUserPreferences();
  const { articles, markArticleAsSeen } = useNews();
  const { t } = useTranslation();
  
  // Subscription management
  const {
    isInGracePeriod,
    gracePeriodDaysRemaining,
  } = useSubscriptionManager();

  // Memoize the country matching logic to avoid recreating functions on every render
  const countryMatcher = useMemo(() => {
    const hasGlobalSelected = preferences.countries.includes('global');
    const selectedCountryIdSet = new Set<string>(
      hasGlobalSelected 
        ? preferences.countries.filter(id => id !== 'global')
        : preferences.countries
    );
    
    return {
      hasGlobalSelected,
      selectedCountryIdSet,
      hasCountryFilters: preferences.countries.length > 0 && !(preferences.countries.length === COUNTRY_OPTIONS.length)
    };
  }, [preferences.countries]);

  // Memoize the industry matching logic
  const industryMatcher = useMemo(() => {
    const hasIndustryFilters = preferences.industries.length > 0;
    const industrySet = new Set(preferences.industries);
    
    return {
      hasIndustryFilters,
      industrySet
    };
  }, [preferences.industries]);

  // Optimized filtering logic using useMemo to prevent recalculation on every render
  const filteredMessages = useMemo(() => {
    // While preferences are loading, show nothing to avoid a flicker of unfiltered content.
    if (isLoading) {
      return [];
    }

    // Debug: Log total articles and categories before filtering
    const totalCategoryCounts = articles.reduce((acc, article) => {
      const category = article.category || 'NEWS';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`[NewsSocketClient] Total articles before filtering: ${articles.length}`, totalCategoryCounts);

    // Early return if no filters are set
    if (!industryMatcher.hasIndustryFilters && !countryMatcher.hasCountryFilters) {
      return articles;
    }

    // Pre-compute country matching helper function
    const toCountryId = (value: unknown): string | null => {
      const v = String(value).trim().toLowerCase();
      const opt = COUNTRY_OPTIONS.find(
        c => c.id.toLowerCase() === v || c.code.toLowerCase() === v
      );
      return opt ? opt.id : null;
    };

    const filtered = articles.filter(msg => {
      // Industry matching
      const industryMatches = !industryMatcher.hasIndustryFilters || 
        (msg.industry && industryMatcher.industrySet.has(msg.industry));

      // Early return if industry doesn't match
      if (industryMatcher.hasIndustryFilters && !industryMatches) {
        return false;
      }

      // Country matching
      if (countryMatcher.hasCountryFilters) {
        let countryMatches = false;
        
        if (countryMatcher.hasGlobalSelected) {
          // Global option logic: show articles with no country value OR with country values NOT in COUNTRY_OPTIONS
          const rawCountriesArr = Array.isArray(msg.countries)
            ? msg.countries
            : (msg.countries && typeof msg.countries === 'object')
              ? Object.keys(msg.countries)
              : [];
          
          const articleCountryIds = rawCountriesArr
            .map(toCountryId)
            .filter((id): id is string => id !== null);
          
          const allUnknown = rawCountriesArr.length > 0 && articleCountryIds.length === 0;
          const hasNoCountries = rawCountriesArr.length === 0;
          
          // Check if article matches any explicitly selected country IDs
          const matchesSelectedCountries = countryMatcher.selectedCountryIdSet.size > 0 &&
            articleCountryIds.some(id => countryMatcher.selectedCountryIdSet.has(id));
          
          countryMatches = matchesSelectedCountries || hasNoCountries || allUnknown;
        } else {
          // Regular country matching
          const rawCountriesArr = Array.isArray(msg.countries)
            ? msg.countries
            : (msg.countries && typeof msg.countries === 'object')
              ? Object.keys(msg.countries)
              : [];
          
          const articleCountryIds = rawCountriesArr
            .map(toCountryId)
            .filter((id): id is string => id !== null);
          
          countryMatches = countryMatcher.selectedCountryIdSet.size > 0 && 
            articleCountryIds.some(id => countryMatcher.selectedCountryIdSet.has(id));
        }

        return countryMatches;
      }

      return true;
    });
    
    // Debug: Log filtered results
    const filteredCategoryCounts = filtered.reduce((acc: Record<string, number>, article) => {
      const category = article.category || 'NEWS';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`[NewsSocketClient] Articles after filtering: ${filtered.length}`, filteredCategoryCounts);
    
    return filtered;
  }, [articles, isLoading, industryMatcher, countryMatcher]);

  // Limit the number of articles rendered to prevent performance issues
  const displayedMessages = useMemo(() => {
    const messages = filteredMessages.slice(0, displayedCount);
    
    // Debug: Log SPONSORED and STATISTICS articles being displayed
    const sponsoredMessages = messages.filter((msg: any) => msg.category === 'SPONSORED');
    const statisticsMessages = messages.filter((msg: any) => msg.category === 'STATISTICS');
    
    if (sponsoredMessages.length > 0) {
      console.log(`[NewsSocketClient] Displaying ${sponsoredMessages.length} SPONSORED articles:`, 
        sponsoredMessages.map((msg: any) => ({ 
          id: msg.id, 
          title: msg.title, 
          category: msg.category,
          callToAction: msg.callToAction,
          sponsorLink: msg.sponsorLink,
          seen: msg.seen 
        })));
    }
    
    if (statisticsMessages.length > 0) {
      console.log(`[NewsSocketClient] Displaying ${statisticsMessages.length} STATISTICS articles:`, 
        statisticsMessages.map((msg: any) => ({ 
          id: msg.id, 
          title: msg.title, 
          category: msg.category,
          seen: msg.seen 
        })));
    }
    
    return messages;
  }, [filteredMessages, displayedCount]);

  // Show message if there are more articles than displayed
  const hasMoreArticles = filteredMessages.length > displayedMessages.length;

  // Tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handles opening the article link to a new tab.
  const handleArticleClick = useCallback(async (event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    event.preventDefault();
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }, []);

  // Optimize company click handler
  const handleCompanyClick = useCallback((url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
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

  const handleActNow = () => {
    window.location.href = '/settings/referral';
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 50);
  };

  return (
    <div className="news-feed">
      {/* Grace Period Banner */}
      {isInGracePeriod && (
        <GracePeriodBanner
          gracePeriodDaysRemaining={gracePeriodDaysRemaining}
          onActNow={handleActNow}
        />
      )}
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
            {displayedMessages.map((msg: any) => {
              // Debug: Log individual article rendering for SPONSORED and STATISTICS
              if (msg.category === 'SPONSORED' || msg.category === 'STATISTICS') {
                console.log(`[NewsSocketClient] Rendering ${msg.category} article:`, {
                  id: msg.id,
                  title: msg.title,
                  category: msg.category,
                  seen: msg.seen,
                  hasCallToAction: !!msg.callToAction,
                  hasSponsorLink: !!msg.sponsorLink,
                  className: `article-card ${msg.seen ? '' : 'unseen'} ${msg.category?.toLowerCase() || 'news'}`
                });
              }
              
              return (
                <motion.div
                  key={msg.id}
                  layout="position"
                  className={`article-card ${msg.seen ? '' : 'unseen'} ${msg.category?.toLowerCase() || 'news'}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  layoutId={msg.id}
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
                              handleCompanyClick(String(url));
                            }}
                            title={`Google > ${name}`}
                          >
                            {name}
                          </span>
                        ))}
                      </>
                    )}
                  </p>
                  
                  {/* Add call-to-action for sponsored articles */}
                  {msg.category === 'SPONSORED' && (
                    <>
                      {msg.callToAction && msg.sponsorLink ? (
                        <div className="sponsored-cta" onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleArticleClick(e as any, String(msg.sponsorLink || '#'));
                        }}>
                          {msg.callToAction}
                        </div>
                      ) : (
                        <div className="sponsored-cta" style={{ backgroundColor: '#ef4444', fontSize: '12px' }}>
                          Missing CTA Data
                        </div>
                      )}
                      
                      {/* Debug info for sponsored articles */}
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                        Debug: CTA="{msg.callToAction || 'none'}" Link="{msg.sponsorLink || 'none'}"
                      </div>
                    </>
                  )}
                </a>
              </motion.div>
            );
          })}
          </AnimatePresence>
          
          {/* Show message if there are more articles */}
          {hasMoreArticles && (
            <div className="more-articles-message">
              <p>
                {t('common.moreArticles')
                  .replace('{displayed}', String(displayedMessages.length))
                  .replace('{count}', String(filteredMessages.length - displayedMessages.length))}
                <button className="disclaimer-dismiss-btn" onClick={handleLoadMore}>
                  {t('common.loadMore')}
                </button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsSocketClient;