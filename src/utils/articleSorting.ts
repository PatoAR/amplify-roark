import { ArticleForState } from '../context/NewsContext';

// Helper function to check if an article is currently in priority period
export function isArticlePriority(article: ArticleForState, now: number = new Date().getTime()): boolean {
  return Boolean((article.category === 'STATISTICS' || article.category === 'SPONSORED') && 
         article.priorityUntil && new Date(article.priorityUntil).getTime() > now);
}

// Shared sorting function for articles with priority hierarchy
export function sortArticlesByPriority(articles: ArticleForState[]): ArticleForState[] {
  const now = new Date().getTime();
  return articles.sort((a, b) => {
    const aIsPriority = isArticlePriority(a, now);
    const bIsPriority = isArticlePriority(b, now);
    
    // Priority articles stay at top
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    
    // Within priority level, SPONSORED takes precedence over STATISTICS
    if (aIsPriority && bIsPriority) {
      if (a.category === 'SPONSORED' && b.category === 'STATISTICS') return -1;
      if (a.category === 'STATISTICS' && b.category === 'SPONSORED') return 1;
    }
    
    // Within same priority level and category, sort by receivedAt (newest first)
    return b.receivedAt - a.receivedAt;
  });
}
