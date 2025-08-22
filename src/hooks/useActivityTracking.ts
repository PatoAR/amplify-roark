import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';
import { ActivityEvent, SessionInfo, isValidEventType, validateEventData, validateMetadata } from '../types/activity';

export const useActivityTracking = () => {
  const { user } = useAuthenticator();
  const sessionRef = useRef<SessionInfo | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const clientRef = useRef<ReturnType<typeof generateClient<Schema>> | null>(null);

  // Initialize client when needed
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = generateClient<Schema>();
    }
    return clientRef.current;
  }, []);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get minimal device information
  const getDeviceInfo = useCallback(() => {
    const { platform } = navigator;
    return JSON.stringify({ platform });
  }, []);

  // Start a new session (only on login)
  const startSession = useCallback(async () => {
    if (!user?.userId) return;

    const client = getClient();
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
      // Create UserActivity record
      const createUserActivityMutation = /* GraphQL */ `
        mutation CreateUserActivity($input: CreateUserActivityInput!) {
          createUserActivity(input: $input) {
            id
            sessionId
            startTime
            isActive
          }
        }
      `;

      const result = await client.graphql({
        query: createUserActivityMutation,
        variables: {
          input: {
            sessionId,
            startTime: sessionRef.current.startTime.toISOString(),
            deviceInfo,
            userAgent,
            pageViews: 0,
            interactions: 0,
            isActive: true,
            owner: user.userId,
          }
        }
      }) as any;

      if (result.data?.createUserActivity) {
        setIsTracking(true);
        // Track login event
        await trackEvent({
          eventType: 'login',
          eventData: { userId: user.userId, timestamp: new Date().toISOString() },
          metadata: { userAgent, platform: navigator.platform }
        });
      }
    } catch (error) {
      console.error('Failed to start activity session', error);
    }
  }, [user?.userId, getClient, generateSessionId, getDeviceInfo]);

  // End session (only on logout)
  const endSession = useCallback(async () => {
    if (!sessionRef.current || !user?.userId) return;

    try {
      const client = getClient();
      
      // Track logout event first
      await trackEvent({
        eventType: 'logout',
        eventData: { userId: user.userId, timestamp: new Date().toISOString() },
        metadata: { userAgent: navigator.userAgent, platform: navigator.platform }
      });

      // Update UserActivity to mark session as ended
      if (sessionRef.current) {
        const updateUserActivityMutation = /* GraphQL */ `
          mutation UpdateUserActivity($input: UpdateUserActivityInput!) {
            updateUserActivity(input: $input) {
              id
              endTime
              duration
              isActive
            }
          }
        `;

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - sessionRef.current.startTime.getTime()) / 1000);

        await client.graphql({
          query: updateUserActivityMutation,
          variables: {
            input: {
              id: sessionRef.current.sessionId,
              endTime: endTime.toISOString(),
              duration,
              isActive: false,
            }
          }
        }) as any;
      }
    } catch (error) {
      console.error('Failed to end activity session', error);
    } finally {
      sessionRef.current = null;
      setIsTracking(false);
    }
  }, [user?.userId, getClient]);

  // Track only login/logout events
  const trackEvent = useCallback(async (event: ActivityEvent) => {
    if (!sessionRef.current || !user?.userId) return;

    const client = getClient();
    if (!client) {
      console.error('Cannot track event: Amplify client not available');
      return;
    }

    // Validate event type
    if (!isValidEventType(event.eventType)) {
      console.error('Invalid event type', event.eventType);
      return;
    }

    // Validate event data if present
    if (event.eventData && !validateEventData(event.eventData)) {
      console.error('Invalid event data', event.eventData);
      return;
    }

    // Validate metadata if present
    if (event.metadata && !validateMetadata(event.metadata)) {
      console.error('Invalid metadata', event.metadata);
      return;
    }

    const { sessionId } = sessionRef.current;
    
    try {
      // Create UserEvent via GraphQL
      const createUserEventMutation = /* GraphQL */ `
        mutation CreateUserEvent($input: CreateUserEventInput!) {
          createUserEvent(input: $input) {
            id
            sessionId
            eventType
            timestamp
          }
        }
      `;

      await client.graphql({
        query: createUserEventMutation,
        variables: {
          input: {
            sessionId,
            eventType: event.eventType,
            eventData: event.eventData ? JSON.stringify(event.eventData) : undefined,
            timestamp: new Date().toISOString(),
            pageUrl: window.location.pathname,
            elementId: `event-${event.eventType}`,
            metadata: event.metadata ? JSON.stringify(event.metadata) : undefined,
            owner: user.userId,
          }
        }
      }) as any;

      console.log(`Tracked ${event.eventType} event`);
    } catch (error) {
      console.error('Failed to track event', error);
    }
  }, [user?.userId, getClient]);

  // Clean up session when user logs out or component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!user?.userId) {
        endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!user?.userId) {
        endSession();
      }
    };
  }, [endSession, user?.userId]);

  return {
    isTracking,
    trackEvent,
    startSession,
    endSession,
  };
}; 