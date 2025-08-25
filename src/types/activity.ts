// Simplified activity tracking types - only login/logout

export interface EventData {
  // Only essential data for login/logout
  userId?: string;
  timestamp?: string;
}

export interface EventMetadata {
  // Device information (minimal)
  userAgent?: string;
  platform?: string;
}

export interface ActivityEvent {
  // Only login and logout events
  eventType: 'login' | 'logout';
  eventData?: EventData;
  metadata?: EventMetadata;
}

export interface SessionInfo {
  sessionId: string;
  startTime: Date;
  deviceInfo: string;
  userAgent: string;
}

// Simplified validation
export const isValidEventType = (eventType: string): eventType is ActivityEvent['eventType'] => {
  return eventType === 'login' || eventType === 'logout';
};

export const validateEventData = (data: unknown): data is EventData => {
  return typeof data === 'object' && data !== null;
};

export const validateMetadata = (metadata: unknown): metadata is EventMetadata => {
  return typeof metadata === 'object' && metadata !== null;
}; 