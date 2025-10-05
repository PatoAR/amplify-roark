import React, { useEffect, useMemo } from 'react';
import { useNews } from '../../context/NewsContext';
import { useSession } from '../../context/SessionContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { COUNTRY_OPTIONS } from '../../constants/countries';

export const TabTitleUpdater: React.FC = () => {
  const { isAuthenticated } = useSession();
  
  // Always call hooks at the top level, but conditionally use their values
  let articles: any[] = [];
  let preferences: any = { countries: [], industries: [] };
  let isLoading = false;
  
  try {
    const newsContext = useNews();
    articles = newsContext.articles;
  } catch (error) {
    // If useNews fails, we're not within NewsProvider context yet
    console.log('[TabTitleUpdater] NewsProvider not available yet, using empty articles array');
    articles = [];
  }
  
  try {
    const userPrefsContext = useUserPreferences();
    preferences = userPrefsContext.preferences;
    isLoading = userPrefsContext.isLoading;
  } catch (error) {
    // If useUserPreferences fails, use defaults
    console.log('[TabTitleUpdater] UserPreferencesProvider not available yet, using defaults');
    preferences = { countries: [], industries: [] };
    isLoading = false;
  }

  // Memoize the country matching logic to avoid recreating functions on every render
  const countryMatcher = useMemo(() => {
    const countries = preferences.countries || [];
    const hasGlobalSelected = countries.includes('global');
    const selectedCountryIdSet = new Set<string>(
      hasGlobalSelected 
        ? countries.filter((id: string) => id !== 'global')
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
            .filter((id: string | null): id is string => id !== null);
          
          const allUnknown = rawCountriesArr.length > 0 && articleCountryIds.length === 0;
          const hasNoCountries = rawCountriesArr.length === 0;
          
          // Check if article matches any explicitly selected country IDs
          const matchesSelectedCountries = countryMatcher.selectedCountryIdSet.size > 0 &&
            articleCountryIds.some((id: string) => countryMatcher.selectedCountryIdSet.has(id));
          
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
            .filter((id: string | null): id is string => id !== null);
          
          countryMatches = countryMatcher.selectedCountryIdSet.size > 0 && 
            articleCountryIds.some((id: string) => countryMatcher.selectedCountryIdSet.has(id));
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
    if (!isAuthenticated) {
      document.title = baseTitle;
      return;
    }

    // Always update title regardless of tab visibility
    document.title = filteredUnreadCount > 0 ? `(${filteredUnreadCount}) 🔥 ${baseTitle}` : baseTitle;
  }, [filteredUnreadCount, isAuthenticated]);

  // Additional effect to ensure document title is reset when authentication state changes
  useEffect(() => {
    const baseTitle = 'Perkins Live Feed';
    if (!isAuthenticated) {
      document.title = baseTitle;
    }
  }, [isAuthenticated]);

  // Cleanup effect to reset document title when component unmounts
  useEffect(() => {
    return () => {
      document.title = 'Perkins Live Feed';
    };
  }, []);

  // Early return if not authenticated (after all hooks are called)
  if (!isAuthenticated) {
    return null;
  }

  // This component doesn't render anything visible
  return null;
};
