import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';
import { ActivityEvent, SessionInfo, EventData, isValidEventType, validateEventData, validateMetadata } from '../types/activity';
import { ErrorContext } from '../types/errors';

const client = generateClient<Schema>();

export const useActivityTracking = () => {
  const { user } = useAuthenticator();
  const sessionRef = useRef<SessionInfo | null>(null);
  const activityRef = useRef<{ pageViews: number; interactions: number }>({ pageViews: 0, interactions: 0 });
  const [isTracking, setIsTracking] = useState(false);
  const isUnmountingRef = useRef<boolean>(false);
  const shouldEndSessionRef = useRef<boolean>(false);

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

  // Create error context for better debugging
  const createErrorContext = useCallback((action: string): ErrorContext => ({
    component: 'useActivityTracking',
    action,
    userId: user?.userId,
    sessionId: sessionRef.current?.sessionId,
    timestamp: new Date().toISOString(),
  }), [user?.userId]);

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
      const errorContext = createErrorContext('startSession');
      console.error('Failed to start activity session:', error, errorContext);
    }
  }, [user?.userId, generateSessionId, getDeviceInfo, createErrorContext]);

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
      const errorContext = createErrorContext('endSession');
      console.error('Failed to end activity session:', error, errorContext);
    } finally {
      sessionRef.current = null;
      activityRef.current = { pageViews: 0, interactions: 0 };
      setIsTracking(false);
    }
  }, [user?.userId, createErrorContext]);

  // Safe end session - only ends if user is actually logging out
  const safeEndSession = useCallback(async () => {
    // Only end session if user is no longer authenticated or component is unmounting
    if ((!user?.userId || isUnmountingRef.current) && sessionRef.current && shouldEndSessionRef.current) {
      console.log('🔍 Safe end session called:', {
        userAuthenticated: !!user?.userId,
        isUnmounting: isUnmountingRef.current,
        hasSession: !!sessionRef.current,
        shouldEnd: shouldEndSessionRef.current
      });
      await endSession();
    } else {
      console.log('🔍 Safe end session prevented:', {
        userAuthenticated: !!user?.userId,
        isUnmounting: isUnmountingRef.current,
        hasSession: !!sessionRef.current,
        shouldEnd: shouldEndSessionRef.current
      });
    }
  }, [user?.userId, endSession]);

  // Track if component is unmounting
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      shouldEndSessionRef.current = true;
    };
  }, []);

  // Track when user becomes unauthenticated
  useEffect(() => {
    if (!user?.userId && sessionRef.current) {
      shouldEndSessionRef.current = true;
    } else if (user?.userId) {
      shouldEndSessionRef.current = false;
    }
  }, [user?.userId]);

  // Track a specific event
  const trackEvent = useCallback(async (event: ActivityEvent) => {
    if (!sessionRef.current || !user?.userId) return;

    // Validate event type
    if (!isValidEventType(event.eventType)) {
      const errorContext = createErrorContext('trackEvent');
      console.error('Invalid event type:', event.eventType, errorContext);
      return;
    }

    // Validate event data if present
    if (event.eventData && !validateEventData(event.eventData)) {
      const errorContext = createErrorContext('trackEvent');
      console.error('Invalid event data:', event.eventData, errorContext);
      return;
    }

    // Validate metadata if present
    if (event.metadata && !validateMetadata(event.metadata)) {
      const errorContext = createErrorContext('trackEvent');
      console.error('Invalid metadata:', event.metadata, errorContext);
      return;
    }

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
      const errorContext = createErrorContext('trackEvent');
      console.error('Failed to track event:', error, errorContext);
    }
  }, [user?.userId, createErrorContext]);

  // Track page view
  const trackPageView = useCallback(async (pageUrl?: string) => {
    if (!sessionRef.current) return;

    activityRef.current.pageViews++;
    
    const eventData: EventData = { pageViews: activityRef.current.pageViews };
    
    await trackEvent({
      eventType: 'page_view',
      pageUrl: pageUrl || window.location.pathname,
      eventData,
    });
  }, [trackEvent]);

  // Track article click
  const trackArticleClick = useCallback(async (articleId: string, articleTitle: string) => {
    const eventData: EventData = { articleId, articleTitle };
    
    await trackEvent({
      eventType: 'article_click',
      elementId: `article-${articleId}`,
      eventData,
    });
  }, [trackEvent]);

  // Track filter change
  const trackFilterChange = useCallback(async (filterType: string, filterValue: string) => {
    const eventData: EventData = { filterType, filterValue };
    
    await trackEvent({
      eventType: 'filter_change',
      eventData,
    });
  }, [trackEvent]);

  // Track preference update
  const trackPreferenceUpdate = useCallback(async (preferenceType: string, preferenceValue: string | string[] | boolean | number) => {
    const eventData: EventData = { preferenceType, preferenceValue };
    
    await trackEvent({
      eventType: 'preference_update',
      eventData,
    });
  }, [trackEvent]);

  // Track referral activity
  const trackReferralActivity = useCallback(async (action: 'generated' | 'shared', referralCode?: string) => {
    const eventData: EventData = { referralCode };
    
    await trackEvent({
      eventType: action === 'generated' ? 'referral_generated' : 'referral_shared',
      eventData,
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
      // Only end session if user is not authenticated
      if (!user?.userId) {
        safeEndSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Only end session if component is actually unmounting and user is not authenticated
      if (isUnmountingRef.current && !user?.userId) {
        safeEndSession();
      }
    };
  }, [safeEndSession, user?.userId]);

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
    safeEndSession,
  };
}; 