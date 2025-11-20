import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useNews } from '../../context/NewsContext';
import WelcomeScreen from '../../components/WelcomeScreen/WelcomeScreen';
import { useTranslation } from '../../i18n';
import { COUNTRY_OPTIONS, getCountryName } from '../../constants/countries';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { GracePeriodBanner } from '../../components/GracePeriodBanner';
import './NewsSocketClient.css';

function formatLocalTime(timestamp?: string | null): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function removeEmojis(text: string): string {
  if (!text) return text;
  // Remove emojis (including variation selectors U+FE00-FE0F) and trim leading/trailing spaces
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F100}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]/gu, '').trim();
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
    const countries = preferences.countries || [];
    const hasGlobalSelected = countries.includes('global');
    const selectedCountryIdSet = new Set<string>(
      hasGlobalSelected 
        ? countries.filter(id => id !== 'global')
        : countries
    );
    
    return {
      hasGlobalSelected,
      selectedCountryIdSet,
      hasCountryFilters: countries.length > 0 && !(countries.length === COUNTRY_OPTIONS.length)
    };
  }, [preferences.countries]);

  // Memoize the industry matching logic
  const industryMatcher = useMemo(() => {
    const industries = preferences.industries || [];
    const hasIndustryFilters = industries.length > 0;
    const industrySet = new Set(industries);
    
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
    
    return filtered;
  }, [articles, isLoading, industryMatcher, countryMatcher]);

  // Limit the number of articles rendered to prevent performance issues
  const displayedMessages = useMemo(() => {
    const messages = filteredMessages.slice(0, displayedCount);
    
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

  // Helper function to check if a country is in user's preferences
  const isCountryInUserPreferences = useCallback((countryKey: string, url: string): boolean => {
    // If no country filters are set (showing all countries), show all country pills
    if (!countryMatcher.hasCountryFilters) {
      return true;
    }

    // Try to find the country option
    const countryOption = COUNTRY_OPTIONS.find(
      c => c.id.toLowerCase() === countryKey.toLowerCase() ||
           c.label.toLowerCase() === countryKey.toLowerCase() ||
           c.code.toLowerCase() === countryKey.toLowerCase() ||
           (typeof url === 'string' && (
             c.id.toLowerCase() === url.toLowerCase() ||
             c.label.toLowerCase() === url.toLowerCase() ||
             c.code.toLowerCase() === url.toLowerCase()
           ))
    );

    if (!countryOption) return false;

    // Check if this country is in the user's selected countries
    return countryMatcher.selectedCountryIdSet.has(countryOption.id);
  }, [countryMatcher]);

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
                    {msg.category === 'SPONSORED' && (
                      <span className="article-sponsored-label">SPONSORED</span>
                    )}
                    <span className="article-industry">{removeEmojis(msg.industry)}</span>{" "}
                    <span className="article-timestamp-wrapper">
                      <span className="article-timestamp">{formatLocalTime(msg.timestamp)}</span>
                    </span>
                    <strong className="article-source">| {msg.source} - </strong>{" "}
                    
                    {/* Country pills - show only for countries in user preferences and if source doesn't include country code */}
                    {(() => {
                      const renderedCountries = msg.countries && typeof msg.countries === 'object' && Object.keys(msg.countries).length > 0 
                        ? (() => {
                            // First, process all entries and collect unique countries by their resolved country ID
                            const processedCountries = Object.entries(msg.countries)
                              .map(([countryKey, url]) => {
                                // Get country name - try countryKey as ID/label/code first
                                let countryName = getCountryName(countryKey);
                                
                                // If not found, try using the value (url) as country identifier
                                if (!countryName && typeof url === 'string') {
                                  countryName = getCountryName(url);
                                }
                                
                                if (!countryName) return null;
                                
                                // Find the country option to get the code/label for source checking
                                const countryOption = COUNTRY_OPTIONS.find(
                                  c => c.id.toLowerCase() === countryKey.toLowerCase() ||
                                       c.label.toLowerCase() === countryKey.toLowerCase() ||
                                       c.code.toLowerCase() === countryKey.toLowerCase() ||
                                       (typeof url === 'string' && (
                                         c.id.toLowerCase() === url.toLowerCase() ||
                                         c.label.toLowerCase() === url.toLowerCase() ||
                                         c.code.toLowerCase() === url.toLowerCase()
                                       ))
                                );
                                
                                if (!countryOption) return null;
                                
                                // Only show if country is in user's preferences
                                if (!isCountryInUserPreferences(countryKey, url as string)) {
                                  return null;
                                }
                                
                                // Check if source contains country code (ARG, BRA, CHL, etc.) or full country name
                                const sourceUpper = msg.source.toUpperCase();
                                const hasCountryCode = sourceUpper.includes(countryOption.label) || 
                                                      sourceUpper.includes(countryOption.code.toUpperCase()) ||
                                                      msg.source.toLowerCase().includes(countryName.toLowerCase());
                                
                                // Only show if source doesn't already contain the country code or name
                                if (hasCountryCode) {
                                  return null;
                                }
                                
                                return {
                                  countryId: countryOption.id,
                                  countryName,
                                  countryKey
                                };
                              })
                              .filter(Boolean) as Array<{ countryId: string; countryName: string; countryKey: string }>;
                            
                            // Deduplicate by countryId
                            const uniqueCountriesMap = new Map<string, { countryId: string; countryName: string; countryKey: string }>();
                            processedCountries.forEach(country => {
                              if (!uniqueCountriesMap.has(country.countryId)) {
                                uniqueCountriesMap.set(country.countryId, country);
                              }
                            });
                            
                            // Convert to JSX elements
                            return Array.from(uniqueCountriesMap.values()).map((country) => (
                              <span
                                key={country.countryKey}
                                className="article-countries"
                                title={country.countryName}
                              >
                                {country.countryName}
                              </span>
                            ));
                          })()
                        : [];
                      
                      return renderedCountries.length > 0 ? (
                        <>
                          {renderedCountries}
                          {" - "}
                        </>
                      ) : null;
                    })()}
                    
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
                    
                    {/* Add call-to-action for sponsored articles - inline after companies */}
                    {msg.category === 'SPONSORED' && (
                      <span className="sponsored-cta" onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleArticleClick(e as any, String(msg.sponsorLink || msg.link || '#'));
                      }}>
                        {msg.callToAction || 'Learn More'}
                      </span>
                    )}
                  </p>
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