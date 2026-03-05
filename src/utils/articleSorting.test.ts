import { describe, it, expect } from 'vitest';
import { isArticlePriority, sortArticlesByPriority } from './articleSorting';
import type { ArticleForState } from '../context/NewsContext';

function makeArticle(overrides: Partial<ArticleForState> = {}): ArticleForState {
  return {
    id: 'test-' + Math.random().toString(36).slice(2, 8),
    source: 'Test Source',
    title: 'Test Title',
    link: 'https://example.com',
    language: 'en',
    seen: false,
    receivedAt: Date.now(),
    ...overrides,
  };
}

describe('isArticlePriority', () => {
  const now = new Date('2025-06-15T12:00:00Z').getTime();

  it('returns true for SPONSORED article within priority window', () => {
    const article = makeArticle({
      category: 'SPONSORED',
      priorityUntil: '2025-06-15T13:00:00Z',
    });
    expect(isArticlePriority(article, now)).toBe(true);
  });

  it('returns true for STATISTICS article within priority window', () => {
    const article = makeArticle({
      category: 'STATISTICS',
      priorityUntil: '2025-06-15T13:00:00Z',
    });
    expect(isArticlePriority(article, now)).toBe(true);
  });

  it('returns false for SPONSORED article past priority window', () => {
    const article = makeArticle({
      category: 'SPONSORED',
      priorityUntil: '2025-06-15T11:00:00Z',
    });
    expect(isArticlePriority(article, now)).toBe(false);
  });

  it('returns false for regular NEWS article even with priorityUntil', () => {
    const article = makeArticle({
      category: 'NEWS',
      priorityUntil: '2025-06-15T13:00:00Z',
    });
    expect(isArticlePriority(article, now)).toBe(false);
  });

  it('returns false when priorityUntil is null', () => {
    const article = makeArticle({
      category: 'SPONSORED',
      priorityUntil: null,
    });
    expect(isArticlePriority(article, now)).toBe(false);
  });

  it('returns false for article with no category', () => {
    const article = makeArticle({ category: null });
    expect(isArticlePriority(article, now)).toBe(false);
  });
});

describe('sortArticlesByPriority', () => {
  const now = Date.now();
  const oneHourFromNow = new Date(now + 60 * 60 * 1000).toISOString();

  it('places priority articles before non-priority articles', () => {
    const regular = makeArticle({ receivedAt: now + 1000 });
    const priority = makeArticle({
      category: 'SPONSORED',
      priorityUntil: oneHourFromNow,
      receivedAt: now - 5000,
    });

    const sorted = sortArticlesByPriority([regular, priority]);
    expect(sorted[0].category).toBe('SPONSORED');
  });

  it('places SPONSORED above STATISTICS when both are priority', () => {
    const stats = makeArticle({
      category: 'STATISTICS',
      priorityUntil: oneHourFromNow,
      receivedAt: now,
    });
    const sponsored = makeArticle({
      category: 'SPONSORED',
      priorityUntil: oneHourFromNow,
      receivedAt: now - 1000,
    });

    const sorted = sortArticlesByPriority([stats, sponsored]);
    expect(sorted[0].category).toBe('SPONSORED');
    expect(sorted[1].category).toBe('STATISTICS');
  });

  it('sorts non-priority articles by receivedAt descending (newest first)', () => {
    const older = makeArticle({ receivedAt: now - 2000 });
    const newer = makeArticle({ receivedAt: now });

    const sorted = sortArticlesByPriority([older, newer]);
    expect(sorted[0].receivedAt).toBe(now);
    expect(sorted[1].receivedAt).toBe(now - 2000);
  });

  it('handles an empty array', () => {
    expect(sortArticlesByPriority([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    const article = makeArticle();
    const sorted = sortArticlesByPriority([article]);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe(article.id);
  });
});
