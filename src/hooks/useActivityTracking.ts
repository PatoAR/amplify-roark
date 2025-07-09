import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface ActivityEvent {
  eventType: 'page_view' | 'article_click' | 'article_share' | 'filter_change' | 
            'preference_update' | 'referral_generated' | 'referral_shared' | 
            'settings_accessed' | 'search_performed' | 'logout' | 'login';
  eventData?: Record<string, any>;
  pageUrl?: string;
  elementId?: string;
  metadata?: Record<string, any>;
}

interface SessionInfo {
  sessionId: string;
  startTime: Date;
  deviceInfo: string;
  userAgent: string;
}

export const useActivityTracking = () => {
  const { user } = useAuthenticator();
  const sessionRef = useRef<SessionInfo | null>(null);
  const activityRef = useRef<{ pageViews: number; interactions: number }>({ pageViews: 0, interactions: 0 });
  const [isTracking, setIsTracking] = useState(false);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get device information
  const getDeviceInfo = useCallback(() => {
    const { platform, language } = navigator;
    const { width, height } = screen;
    return JSON.stringify({
      platform,
      language,
      screenSize: `${width}x${height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
  }, []);

  // Start a new session
  const startSession = useCallback(async () => {
    if (!user?.userId) return;

    const sessionId = generateSessionId();
    const deviceInfo = getDeviceInfo();
    const userAgent = navigator.userAgent;

    sessionRef.current = {
      sessionId,
      startTime: new Date(),
      deviceInfo,
      userAgent,
    };

    try {
      await client.models.UserActivity.create({
        sessionId,
        startTime: sessionRef.current.startTime.toISOString(),
        deviceInfo,
        userAgent,
        pageViews: 0,
        interactions: 0,
        isActive: true,
      });

      setIsTracking(true);
      console.log('📊 Activity tracking session started');
    } catch (error) {
      console.error('Failed to start activity session:', error);
    }
  }, [user?.userId, generateSessionId, getDeviceInfo]);

  // End current session
  const endSession = useCallback(async () => {
    if (!sessionRef.current || !user?.userId) return;

    const session = sessionRef.current;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    try {
      // Update the session record
      const { data: activities } = await client.models.UserActivity.list({
        filter: { sessionId: { eq: session.sessionId } }
      });

      if (activities && activities.length > 0) {
        const activity = activities[0];
        await client.models.UserActivity.update({
          id: activity.id,
          endTime: endTime.toISOString(),
          duration,
          pageViews: activityRef.current.pageViews,
          interactions: activityRef.current.interactions,
          isActive: false,
        });
      }

      console.log('📊 Activity tracking session ended');
    } catch (error) {
      console.error('Failed to end activity session:', error);
    } finally {
      sessionRef.current = null;
      activityRef.current = { pageViews: 0, interactions: 0 };
      setIsTracking(false);
    }
  }, [user?.userId]);

  // Track a specific event
  const trackEvent = useCallback(async (event: ActivityEvent) => {
    if (!sessionRef.current || !user?.userId) return;

    const { sessionId } = sessionRef.current;
    
    try {
      await client.models.UserEvent.create({
        sessionId,
        eventType: event.eventType,
        eventData: event.eventData ? JSON.stringify(event.eventData) : undefined,
        timestamp: new Date().toISOString(),
        pageUrl: event.pageUrl || window.location.pathname,
        elementId: event.elementId,
        metadata: event.metadata ? JSON.stringify(event.metadata) : undefined,
      });

      // Update session counters
      activityRef.current.interactions++;
      
      // Update session record
      const { data: activities } = await client.models.UserActivity.list({
        filter: { sessionId: { eq: sessionId } }
      });

      if (activities && activities.length > 0) {
        const activity = activities[0];
        await client.models.UserActivity.update({
          id: activity.id,
          interactions: activityRef.current.interactions,
        });
      }

      console.log(`📊 Tracked event: ${event.eventType}`);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [user?.userId]);

  // Track page view
  const trackPageView = useCallback(async (pageUrl?: string) => {
    if (!sessionRef.current) return;

    activityRef.current.pageViews++;
    
    await trackEvent({
      eventType: 'page_view',
      pageUrl: pageUrl || window.location.pathname,
      eventData: { pageViews: activityRef.current.pageViews },
    });
  }, [trackEvent]);

  // Track article click
  const trackArticleClick = useCallback(async (articleId: string, articleTitle: string) => {
    await trackEvent({
      eventType: 'article_click',
      elementId: `article-${articleId}`,
      eventData: { articleId, articleTitle },
    });
  }, [trackEvent]);

  // Track filter change
  const trackFilterChange = useCallback(async (filterType: string, filterValue: string) => {
    await trackEvent({
      eventType: 'filter_change',
      eventData: { filterType, filterValue },
    });
  }, [trackEvent]);

  // Track preference update
  const trackPreferenceUpdate = useCallback(async (preferenceType: string, preferenceValue: any) => {
    await trackEvent({
      eventType: 'preference_update',
      eventData: { preferenceType, preferenceValue },
    });
  }, [trackEvent]);

  // Track referral activity
  const trackReferralActivity = useCallback(async (action: 'generated' | 'shared', referralCode?: string) => {
    await trackEvent({
      eventType: action === 'generated' ? 'referral_generated' : 'referral_shared',
      eventData: { referralCode },
    });
  }, [trackEvent]);

  // Initialize tracking when user logs in
  useEffect(() => {
    if (user?.userId && !sessionRef.current) {
      startSession();
    }
  }, [user?.userId, startSession]);

  // Clean up session when user logs out or component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [endSession]);

  // Track initial page view
  useEffect(() => {
    if (isTracking) {
      trackPageView();
    }
  }, [isTracking, trackPageView]);

  return {
    isTracking,
    trackEvent,
    trackPageView,
    trackArticleClick,
    trackFilterChange,
    trackPreferenceUpdate,
    trackReferralActivity,
    startSession,
    endSession,
  };
}; 