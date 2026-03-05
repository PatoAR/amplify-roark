import { useMemo } from 'react';
import { COUNTRY_OPTIONS } from '../constants/countries';
import type { ArticleForState } from '../context/NewsContext';

interface UserPreferences {
  countries: string[];
  industries: string[];
}

interface CountryMatcher {
  hasGlobalSelected: boolean;
  selectedCountryIdSet: Set<string>;
  hasCountryFilters: boolean;
}

interface IndustryMatcher {
  hasIndustryFilters: boolean;
  industrySet: Set<string>;
}

function toCountryId(value: unknown): string | null {
  const v = String(value).trim().toLowerCase();
  const opt = COUNTRY_OPTIONS.find(
    c => c.id.toLowerCase() === v || c.code.toLowerCase() === v
  );
  return opt ? opt.id : null;
}

function matchesCountryFilters(
  article: ArticleForState,
  countryMatcher: CountryMatcher
): boolean {
  const rawCountriesArr = Array.isArray(article.countries)
    ? article.countries
    : (article.countries && typeof article.countries === 'object')
      ? Object.keys(article.countries)
      : [];

  const articleCountryIds = rawCountriesArr
    .map(toCountryId)
    .filter((id): id is string => id !== null);

  if (countryMatcher.hasGlobalSelected) {
    const allUnknown = rawCountriesArr.length > 0 && articleCountryIds.length === 0;
    const hasNoCountries = rawCountriesArr.length === 0;
    const matchesSelected = countryMatcher.selectedCountryIdSet.size > 0 &&
      articleCountryIds.some(id => countryMatcher.selectedCountryIdSet.has(id));
    return matchesSelected || hasNoCountries || allUnknown;
  }

  return countryMatcher.selectedCountryIdSet.size > 0 &&
    articleCountryIds.some(id => countryMatcher.selectedCountryIdSet.has(id));
}

export function useCountryMatcher(countries: string[]): CountryMatcher {
  return useMemo(() => {
    const hasGlobalSelected = countries.includes('global');
    const selectedCountryIdSet = new Set<string>(
      hasGlobalSelected
        ? countries.filter(id => id !== 'global')
        : countries
    );
    return {
      hasGlobalSelected,
      selectedCountryIdSet,
      hasCountryFilters: countries.length > 0 && !(countries.length === COUNTRY_OPTIONS.length),
    };
  }, [countries]);
}

export function useIndustryMatcher(industries: string[]): IndustryMatcher {
  return useMemo(() => ({
    hasIndustryFilters: industries.length > 0,
    industrySet: new Set(industries),
  }), [industries]);
}

/**
 * Filters articles by industry and country preferences.
 * Returns filtered articles. Returns empty array while preferences are loading.
 */
export function useFilteredArticles(
  articles: ArticleForState[],
  preferences: UserPreferences,
  isLoading: boolean
): ArticleForState[] {
  const countryMatcher = useCountryMatcher(preferences.countries || []);
  const industryMatcher = useIndustryMatcher(preferences.industries || []);

  return useMemo(() => {
    if (isLoading) return [];

    if (!industryMatcher.hasIndustryFilters && !countryMatcher.hasCountryFilters) {
      return articles;
    }

    return articles.filter(article => {
      const industryMatches = !industryMatcher.hasIndustryFilters ||
        (article.industry && industryMatcher.industrySet.has(article.industry));

      if (industryMatcher.hasIndustryFilters && !industryMatches) {
        return false;
      }

      if (countryMatcher.hasCountryFilters) {
        return matchesCountryFilters(article, countryMatcher);
      }

      return true;
    });
  }, [articles, isLoading, industryMatcher, countryMatcher]);
}

/**
 * Counts unread articles matching user preferences.
 * While loading, counts all unseen articles.
 */
export function useFilteredUnreadCount(
  articles: ArticleForState[],
  preferences: UserPreferences,
  isLoading: boolean
): number {
  const countryMatcher = useCountryMatcher(preferences.countries || []);
  const industryMatcher = useIndustryMatcher(preferences.industries || []);

  return useMemo(() => {
    if (isLoading) {
      return articles.filter(a => !a.seen).length;
    }

    if (!industryMatcher.hasIndustryFilters && !countryMatcher.hasCountryFilters) {
      return articles.filter(a => !a.seen).length;
    }

    return articles.filter(article => {
      if (article.seen) return false;

      const industryMatches = !industryMatcher.hasIndustryFilters ||
        (article.industry && industryMatcher.industrySet.has(article.industry));

      if (industryMatcher.hasIndustryFilters && !industryMatches) {
        return false;
      }

      if (countryMatcher.hasCountryFilters) {
        return matchesCountryFilters(article, countryMatcher);
      }

      return true;
    }).length;
  }, [articles, isLoading, industryMatcher, countryMatcher]);
}
