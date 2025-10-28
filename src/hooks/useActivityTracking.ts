import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';

interface SessionInfo {
  sessionId: string;
  startTime: Date;
  deviceInfo: string;
  userAgent: string;
  recordId?: string;
}

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
    if (!user?.userId || sessionRef.current) return;

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
            isActive: true,
            owner: user.userId,
          }
        }
      }) as any;

      if (result.data?.createUserActivity) {
        // Store the actual database record ID, not just the sessionId
        sessionRef.current.recordId = result.data.createUserActivity.id;
        setIsTracking(true);
        console.log('✅ Activity tracking started:', {
          sessionId: sessionRef.current.sessionId,
          recordId: sessionRef.current.recordId,
          startTime: sessionRef.current.startTime.toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Failed to start activity session', error);
      console.error('Error details:', error);
    }
  }, [user?.userId, getClient, generateSessionId, getDeviceInfo]);

  // End session (only on logout)
  const endSession = useCallback(async () => {
    if (!sessionRef.current || !user?.userId) return;

    try {
      const client = getClient();
      
      // Update UserActivity to mark session as ended
      if (sessionRef.current && sessionRef.current.recordId) {
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
              id: sessionRef.current.recordId, // Use the actual database record ID
              endTime: endTime.toISOString(),
              duration,
              isActive: false,
            }
          }
        }) as any;
        console.log('✅ Activity session ended:', { duration, recordId: sessionRef.current.recordId });
      }
    } catch (error) {
      console.error('❌ Failed to end activity session', error);
      console.error('Error details:', error);
    } finally {
      sessionRef.current = null;
      setIsTracking(false);
    }
  }, [user?.userId, getClient]);

  // Clean up session when user logs out or component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only attempt cleanup if user is logged in and session exists
      if (user?.userId && sessionRef.current) {
        // Use sendBeacon for reliable cleanup on page unload
        if (navigator.sendBeacon && sessionRef.current.recordId) {
          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - sessionRef.current.startTime.getTime()) / 1000);
          
          const cleanupData = JSON.stringify({
            id: sessionRef.current.recordId,
            endTime: endTime.toISOString(),
            duration,
            isActive: false,
          });
          
          // Send cleanup data via beacon (more reliable than fetch on unload)
          navigator.sendBeacon('/api/cleanup-session', cleanupData);
        }
        
        // Fallback: try to end session synchronously (may not complete)
        try {
          endSession();
        } catch (error) {
          console.warn('Session cleanup failed on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up session on component unmount if user is no longer logged in
      if (!user?.userId && sessionRef.current) {
        endSession();
      }
    };
  }, [endSession, user?.userId]);

  return {
    isTracking,
    startSession,
    endSession,
    currentSessionId: sessionRef.current?.sessionId,
  };
}; 