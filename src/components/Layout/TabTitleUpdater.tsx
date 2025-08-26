import React, { useEffect, useMemo } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNews } from '../../context/NewsContext';
import { useSession } from '../../context/SessionContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { COUNTRY_OPTIONS } from '../../constants/countries';

export const TabTitleUpdater: React.FC = () => {
  const { authStatus } = useAuthenticator();
  const { isAuthenticated } = useSession();
  const { articles } = useNews();
  const { preferences, isLoading } = useUserPreferences();

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

  // Count only unseen articles that match user preferences
  const filteredUnreadCount = useMemo(() => {
    // While preferences are loading, count all unseen articles
    if (isLoading) {
      return articles.filter(article => !article.seen).length;
    }

    // Early return if no filters are set
    if (!industryMatcher.hasIndustryFilters && !countryMatcher.hasCountryFilters) {
      return articles.filter(article => !article.seen).length;
    }

    // Pre-compute country matching helper function
    const toCountryId = (value: unknown): string | null => {
      const v = String(value).trim().toLowerCase();
      const opt = COUNTRY_OPTIONS.find(
        c => c.id.toLowerCase() === v || c.code.toLowerCase() === v
      );
      return opt ? opt.id : null;
    };

    return articles.filter(article => {
      // Only count unseen articles
      if (article.seen) {
        return false;
      }

      // Industry matching
      const industryMatches = !industryMatcher.hasIndustryFilters || 
        (article.industry && industryMatcher.industrySet.has(article.industry));

      // Early return if industry doesn't match
      if (industryMatcher.hasIndustryFilters && !industryMatches) {
        return false;
      }

      // Country matching
      if (countryMatcher.hasCountryFilters) {
        let countryMatches = false;
        
        if (countryMatcher.hasGlobalSelected) {
          // Global option logic: show articles with no country value OR with country values NOT in COUNTRY_OPTIONS
          const rawCountriesArr = Array.isArray(article.countries)
            ? article.countries
            : (article.countries && typeof article.countries === 'object')
              ? Object.keys(article.countries)
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
          const rawCountriesArr = Array.isArray(article.countries)
            ? article.countries
            : (article.countries && typeof article.countries === 'object')
              ? Object.keys(article.countries)
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
    }).length;
  }, [articles, isLoading, industryMatcher, countryMatcher]);

  // Update tab title based on filtered unread count and authentication status
  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    
    // Reset title if not authenticated
    if (!isAuthenticated || authStatus === 'unauthenticated') {
      document.title = baseTitle;
      return;
    }

    // Always update title regardless of tab visibility
    document.title = filteredUnreadCount > 0 ? `(${filteredUnreadCount}) 🔥 ${baseTitle}` : baseTitle;
  }, [filteredUnreadCount, isAuthenticated, authStatus]);

  // Additional effect to ensure document title is reset when authentication state changes
  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    if (!isAuthenticated || authStatus === 'unauthenticated') {
      document.title = baseTitle;
    }
  }, [isAuthenticated, authStatus]);

  // Cleanup effect to reset document title when component unmounts
  useEffect(() => {
    return () => {
      document.title = 'Perkins Live Feed';
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};
