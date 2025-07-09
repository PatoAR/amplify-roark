// Activity tracking specific types

export interface EventData {
  // Page view specific data
  pageViews?: number;
  
  // Article click specific data
  articleId?: string;
  articleTitle?: string;
  
  // Filter change specific data
  filterType?: string;
  filterValue?: string;
  
  // Preference update specific data
  preferenceType?: string;
  preferenceValue?: string | string[] | boolean | number;
  
  // Referral specific data
  referralCode?: string;
  
  // Search specific data
  searchQuery?: string;
  searchResults?: number;
  
  // Generic data
  [key: string]: unknown;
}

export interface EventMetadata {
  // Device information
  userAgent?: string;
  screenSize?: string;
  viewport?: string;
  
  // Session information
  sessionId?: string;
  userId?: string;
  
  // Performance metrics
  loadTime?: number;
  responseTime?: number;
  
  // Generic metadata
  [key: string]: unknown;
}

export interface ActivityEvent {
  eventType: 'page_view' | 'article_click' | 'article_share' | 'filter_change' | 
            'preference_update' | 'referral_generated' | 'referral_shared' | 
            'settings_accessed' | 'search_performed' | 'logout' | 'login';
  eventData?: EventData;
  pageUrl?: string;
  elementId?: string;
  metadata?: EventMetadata;
}

export interface SessionInfo {
  sessionId: string;
  startTime: Date;
  deviceInfo: string;
  userAgent: string;
}

export interface ActivityCounters {
  pageViews: number;
  interactions: number;
}

// Validation functions
export const isValidEventType = (eventType: string): eventType is ActivityEvent['eventType'] => {
  const validTypes = [
    'page_view', 'article_click', 'article_share', 'filter_change',
    'preference_update', 'referral_generated', 'referral_shared',
    'settings_accessed', 'search_performed', 'logout', 'login'
  ];
  return validTypes.includes(eventType);
};

export const validateEventData = (data: unknown): data is EventData => {
  return typeof data === 'object' && data !== null;
};

export const validateMetadata = (metadata: unknown): metadata is EventMetadata => {
  return typeof metadata === 'object' && metadata !== null;
}; 