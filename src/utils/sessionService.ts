import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';

// Session storage keys
const SESSION_ID_KEY = 'roark_session_id';
const SESSION_START_TIME_KEY = 'roark_session_start_time';
const SESSION_RECORD_ID_KEY = 'roark_session_record_id';
const ARTICLE_READ_STATES_KEY = 'roark_article_read_states';

// Session expiration constants
const SESSION_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes - session ends if tab not visible
const LOGOUT_TIMEOUT_MS = 120 * 60 * 1000; // 120 minutes (2 hours) - user logged out after total inactivity

export interface SessionInfo {
  sessionId: string;
  recordId: string;
  startTime: Date;
  lastUserActivity: Date; // Track last user interaction (for session expiration)
  lastTabHiddenTime?: Date; // Track when tab was last hidden (for visibility-based expiration)
}

export interface ArticleReadState {
  articleId: string;
  timestamp: number;
}

/**
 * SessionService - Centralized session management
 * Handles session persistence, restoration, and lifecycle
 */
export class SessionService {
  private static client: ReturnType<typeof generateClient<Schema>> | null = null;
  private static currentSession: SessionInfo | null = null;
  private static storageListener: ((e: StorageEvent) => void) | null = null;
  private static activityCheckInterval: NodeJS.Timeout | null = null;
  private static visibilityHandler: (() => void) | null = null;

  private static getClient(): ReturnType<typeof generateClient<Schema>> {
    if (!this.client) {
      this.client = generateClient<Schema>();
    }
    return this.client;
  }

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store session info in localStorage
   */
  static storeSessionInfo(sessionId: string, recordId: string, startTime: Date): void {
    try {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      localStorage.setItem(SESSION_RECORD_ID_KEY, recordId);
      localStorage.setItem(SESSION_START_TIME_KEY, startTime.toISOString());
    } catch (error) {
      console.error('Failed to store session info:', error);
    }
  }

  /**
   * Get stored session info from localStorage
   */
  static getStoredSessionInfo(): { sessionId: string; recordId: string; startTime: Date } | null {
    try {
      const sessionId = localStorage.getItem(SESSION_ID_KEY);
      const recordId = localStorage.getItem(SESSION_RECORD_ID_KEY);
      const startTimeStr = localStorage.getItem(SESSION_START_TIME_KEY);

      if (sessionId && recordId && startTimeStr) {
        return {
          sessionId,
          recordId,
          startTime: new Date(startTimeStr),
        };
      }
    } catch (error) {
      console.error('Failed to get stored session info:', error);
    }
    return null;
  }

  /**
   * Clear session info from localStorage
   */
  static clearStoredSessionInfo(): void {
    try {
      localStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem(SESSION_RECORD_ID_KEY);
      localStorage.removeItem(SESSION_START_TIME_KEY);
    } catch (error) {
      console.error('Failed to clear session info:', error);
    }
  }

  /**
   * Query database for active session by sessionId
   */
  static async getActiveSessionFromDB(
    sessionId: string,
    userId: string
  ): Promise<{ id: string; startTime: string; isActive: boolean } | null> {
    try {
      const client = this.getClient();
      const listUserActivitiesQuery = /* GraphQL */ `
        query ListUserActivities($filter: ModelUserActivityFilterInput) {
          listUserActivities(filter: $filter) {
            items {
              id
              sessionId
              startTime
              isActive
              owner
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listUserActivitiesQuery,
        variables: {
          filter: {
            sessionId: { eq: sessionId },
            owner: { eq: userId },
            isActive: { eq: true },
          },
        },
      }) as any;

      const items = result.data?.listUserActivities?.items || [];
      if (items.length > 0) {
        const session = items[0];
        return {
          id: session.id,
          startTime: session.startTime,
          isActive: session.isActive,
        };
      }
    } catch (error) {
      console.error('Failed to get active session from DB:', error);
    }
    return null;
  }

  /**
   * Check if a stored session is still valid
   */
  static async validateStoredSession(userId: string): Promise<SessionInfo | null> {
    const stored = this.getStoredSessionInfo();
    if (!stored) {
      return null;
    }

    // Check if session is expired based on localStorage timestamp (use 2-hour threshold for restoration)
    // Note: 30-minute expiration is for active sessions, but we allow restoration up to 2 hours
    const now = new Date();
    const timeSinceStart = now.getTime() - stored.startTime.getTime();
    if (timeSinceStart > LOGOUT_TIMEOUT_MS) {
      // Session expired (older than 2 hours), clear it
      this.clearStoredSessionInfo();
      return null;
    }

    // Verify session exists and is active in database
    const dbSession = await this.getActiveSessionFromDB(stored.sessionId, userId);
    if (!dbSession || !dbSession.isActive) {
      // Session not found or inactive in DB, clear localStorage
      this.clearStoredSessionInfo();
      return null;
    }

    // Session is valid
    const sessionInfo: SessionInfo = {
      sessionId: stored.sessionId,
      recordId: stored.recordId,
      startTime: stored.startTime,
      lastUserActivity: now, // Initialize with current time on restore
      lastTabHiddenTime: undefined, // Reset on restore (tab is visible)
    };

    // Start user activity tracking and visibility tracking for restored session
    this.startActivityTracking();
    this.startVisibilityTracking();

    return sessionInfo;
  }

  /**
   * Create a new session in the database
   */
  static async createSession(
    sessionId: string,
    _userId: string, // User ID for validation/logging (owner is set automatically by Amplify)
    deviceInfo: string,
    userAgent: string
  ): Promise<{ id: string; sessionId: string } | null> {
    try {
      const client = this.getClient();
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

      const startTime = new Date();
      const result = await client.graphql({
        query: createUserActivityMutation,
        variables: {
          input: {
            sessionId,
            startTime: startTime.toISOString(),
            deviceInfo,
            userAgent,
            isActive: true,
            // owner is automatically set by Amplify from JWT 'sub' claim
          },
        },
      }) as any;

      if (result.data?.createUserActivity) {
        const record = result.data.createUserActivity;
        const now = new Date();
        const sessionInfo: SessionInfo = {
          sessionId,
          recordId: record.id,
          startTime,
          lastUserActivity: now,
          lastTabHiddenTime: undefined, // Initialize as undefined (tab is visible on creation)
        };

        // Store in localStorage
        this.storeSessionInfo(sessionId, record.id, startTime);
        this.currentSession = sessionInfo;

        // Start user activity tracking and visibility tracking
        this.startActivityTracking();
        this.startVisibilityTracking();

        return {
          id: record.id,
          sessionId: record.sessionId,
        };
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
    return null;
  }


  /**
   * Record user activity (called on user interactions)
   */
  static recordUserActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastUserActivity = new Date();
    }
  }

  /**
   * Start user activity tracking (same events as inactivity timer)
   */
  static startActivityTracking(): void {
    // Remove existing listeners if any
    this.stopActivityTracking();

    const handleActivity = () => {
      this.recordUserActivity();
    };

    // Same activity events as useInactivityTimer
    const activityEvents = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Store handlers for cleanup
    (this as any).activityHandlers = activityEvents.map((event) => ({
      event,
      handler: handleActivity,
    }));

    // Check for session expiration periodically (every 5 minutes)
    this.activityCheckInterval = setInterval(() => {
      this.checkSessionExpiration();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Stop user activity tracking
   */
  static stopActivityTracking(): void {
    const handlers = (this as any).activityHandlers;
    if (handlers) {
      handlers.forEach(({ event, handler }: { event: string; handler: () => void }) => {
        window.removeEventListener(event, handler);
      });
      (this as any).activityHandlers = null;
    }

    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }

    // Also stop visibility tracking when activity tracking stops
    this.stopVisibilityTracking();
  }

  /**
   * Check if session should be expired based on user activity or tab visibility
   */
  static checkSessionExpiration(): void {
    if (!this.currentSession) {
      return;
    }

    const now = new Date();
    
    // Check tab visibility expiration (30 minutes)
    if (this.currentSession.lastTabHiddenTime) {
      const timeHidden = now.getTime() - this.currentSession.lastTabHiddenTime.getTime();
      if (timeHidden >= SESSION_EXPIRATION_MS) {
        // Tab has been hidden for 30+ minutes, expire session
        this.expireCurrentSession();
        return;
      }
    }

    // Check user activity expiration (30 minutes of no activity)
    const timeSinceLastActivity = now.getTime() - this.currentSession.lastUserActivity.getTime();
    if (timeSinceLastActivity >= SESSION_EXPIRATION_MS) {
      // User inactive for 30+ minutes, expire session
      // Note: We don't log the user out here - that's handled by useInactivityTimer
      // We just mark the session as expired in the database
      this.expireCurrentSession();
    }
  }

  /**
   * Expire the current session (mark as inactive in database)
   * This is called when session expires due to inactivity (2 hours)
   * Note: This does NOT log the user out - that's handled by useInactivityTimer
   * When inactivity logout fires, it will call endSession() which properly ends the session
   */
  static async expireCurrentSession(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    try {
      const client = this.getClient();
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
      const duration = Math.floor((endTime.getTime() - this.currentSession.startTime.getTime()) / 1000);

      await client.graphql({
        query: updateUserActivityMutation,
        variables: {
          input: {
            id: this.currentSession.recordId,
            endTime: endTime.toISOString(),
            duration,
            isActive: false,
          },
        },
      }) as any;

      // Stop tracking (but don't clear session info yet - inactivity logout will handle full cleanup)
      this.stopActivityTracking();

      // Note: We don't clear session info here because inactivity logout will handle it
      // This ensures proper coordination between session expiration and logout
    } catch (error) {
      console.error('Failed to expire current session:', error);
    }
  }

  /**
   * End session in database
   */
  static async endSession(recordId: string, startTime: Date): Promise<void> {
    try {
      this.stopActivityTracking();

      const client = this.getClient();
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
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      await client.graphql({
        query: updateUserActivityMutation,
        variables: {
          input: {
            id: recordId,
            endTime: endTime.toISOString(),
            duration,
            isActive: false,
          },
        },
      }) as any;

      // Clear session info (full cleanup on logout)
      this.clearStoredSessionInfo();
      this.currentSession = null;
    } catch (error) {
      console.error('Failed to end session:', error);
      // Even if database update fails, clear local state
      this.clearStoredSessionInfo();
      this.currentSession = null;
    }
  }

  /**
   * Expire stale sessions (sessions with no activity for 2+ hours)
   * This is called on page load to clean up old sessions
   */
  static async expireStaleSessions(userId: string): Promise<void> {
    try {
      const client = this.getClient();
      const listUserActivitiesQuery = /* GraphQL */ `
        query ListUserActivities($filter: ModelUserActivityFilterInput) {
          listUserActivities(filter: $filter) {
            items {
              id
              sessionId
              startTime
              isActive
              owner
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listUserActivitiesQuery,
        variables: {
          filter: {
            owner: { eq: userId },
            isActive: { eq: true },
          },
        },
      }) as any;

      const items = result.data?.listUserActivities?.items || [];
      const now = new Date();
      const expirationThreshold = LOGOUT_TIMEOUT_MS; // 2 hours - for stale session cleanup

      const updateUserActivityMutation = /* GraphQL */ `
        mutation UpdateUserActivity($input: UpdateUserActivityInput!) {
          updateUserActivity(input: $input) {
            id
            isActive
            endTime
            duration
          }
        }
      `;

      for (const session of items) {
        const startTime = new Date(session.startTime);
        const timeSinceStart = now.getTime() - startTime.getTime();

        // If session is older than expiration threshold (2 hours), mark as inactive
        // This handles abandoned sessions (browser closed, computer shut down)
        if (timeSinceStart > expirationThreshold) {
          try {
            await client.graphql({
              query: updateUserActivityMutation,
              variables: {
                input: {
                  id: session.id,
                  isActive: false,
                  endTime: now.toISOString(),
                  duration: Math.floor(timeSinceStart / 1000),
                },
              },
            }) as any;
          } catch (error) {
            console.error(`Failed to expire session ${session.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to expire stale sessions:', error);
    }
  }

  /**
   * Store article read state
   */
  static storeArticleReadState(articleId: string, sessionId: string): void {
    try {
      const key = `${ARTICLE_READ_STATES_KEY}_${sessionId}`;
      const stored = localStorage.getItem(key);
      const readStates: ArticleReadState[] = stored ? JSON.parse(stored) : [];

      // Check if already stored
      if (!readStates.find((rs) => rs.articleId === articleId)) {
        readStates.push({
          articleId,
          timestamp: Date.now(),
        });

        // Keep only last 1000 articles to prevent localStorage bloat
        if (readStates.length > 1000) {
          readStates.shift();
        }

        localStorage.setItem(key, JSON.stringify(readStates));
      }
    } catch (error) {
      console.error('Failed to store article read state:', error);
    }
  }

  /**
   * Get article read states for a session
   */
  static getArticleReadStates(sessionId: string): Set<string> {
    try {
      const key = `${ARTICLE_READ_STATES_KEY}_${sessionId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const readStates: ArticleReadState[] = JSON.parse(stored);
        return new Set(readStates.map((rs) => rs.articleId));
      }
    } catch (error) {
      console.error('Failed to get article read states:', error);
    }
    return new Set();
  }

  /**
   * Clear article read states for a session
   */
  static clearArticleReadStates(sessionId: string): void {
    try {
      const key = `${ARTICLE_READ_STATES_KEY}_${sessionId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear article read states:', error);
    }
  }

  /**
   * Clear ALL article read states (for cleanup on logout)
   */
  static clearAllArticleReadStates(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(ARTICLE_READ_STATES_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all article read states:', error);
    }
  }

  /**
   * Get current session info
   */
  static getCurrentSession(): SessionInfo | null {
    return this.currentSession;
  }

  /**
   * Set current session info
   */
  static setCurrentSession(session: SessionInfo): void {
    this.currentSession = session;
    // Ensure activity tracking is running when session is set
    // Check if handlers exist to avoid duplicate listeners
    if (!(this as any).activityHandlers) {
      this.startActivityTracking();
    }
    // Start visibility tracking when session is set
    this.startVisibilityTracking();
  }

  /**
   * Record when tab becomes hidden
   */
  static recordTabHidden(): void {
    if (this.currentSession) {
      this.currentSession.lastTabHiddenTime = new Date();
    }
  }

  /**
   * Handle tab becoming visible - check if session needs restart
   * Returns true if session was restarted, false otherwise
   */
  static async handleTabVisible(userId?: string, deviceInfo?: string, userAgent?: string): Promise<boolean> {
    if (!this.currentSession || !this.currentSession.lastTabHiddenTime) {
      // No session or tab was never hidden, nothing to do
      return false;
    }

    const now = new Date();
    const timeHidden = now.getTime() - this.currentSession.lastTabHiddenTime.getTime();

    // If tab was hidden for less than 30 minutes, session is still valid
    if (timeHidden < SESSION_EXPIRATION_MS) {
      // Session still valid, just clear the hidden time
      this.currentSession.lastTabHiddenTime = undefined;
      return false;
    }

    // Tab was hidden for 30+ minutes
    // Check if user should be logged out (2 hours total inactivity)
    if (timeHidden >= LOGOUT_TIMEOUT_MS) {
      // User should be logged out - let inactivity timer handle it
      // Just clear the session state
      this.currentSession.lastTabHiddenTime = undefined;
      return false;
    }

    // Tab was hidden 30 minutes - 2 hours: Session expired but user still authenticated
    // RESTART SESSION (end old, create new)
    if (userId && deviceInfo && userAgent) {
      const restarted = await this.restartSession(userId, deviceInfo, userAgent);
      if (restarted) {
        this.currentSession.lastTabHiddenTime = undefined;
      }
      return restarted;
    }
    
    // If we don't have user info, just expire the session
    // The calling code will handle creating a new session
    await this.expireCurrentSession();
    this.currentSession.lastTabHiddenTime = undefined;
    return false;
  }

  /**
   * Restart session - end old session and create new one
   * This is called when tab becomes visible after being hidden for 30+ minutes
   * Returns true if restart was successful, false otherwise
   */
  static async restartSession(userId: string, deviceInfo: string, userAgent: string): Promise<boolean> {
    const oldSession = this.currentSession;
    if (!oldSession) {
      return false;
    }

    try {
      // 1. Migrate article read states from old session to new session
      const oldReadStates = this.getArticleReadStates(oldSession.sessionId);
      
      // 2. End old session in database (properly close it for analytics)
      await this.endSession(oldSession.recordId, oldSession.startTime);

      // 3. Create new session
      const newSessionId = this.generateSessionId();
      const result = await this.createSession(newSessionId, userId, deviceInfo, userAgent);

      if (result) {
        // 4. Migrate read states to new session
        if (oldReadStates.size > 0) {
          oldReadStates.forEach(articleId => {
            this.storeArticleReadState(articleId, newSessionId);
          });
          console.log(`📦 Migrated ${oldReadStates.size} article read states to new session`);
        }

        console.log('🔄 Session restarted:', {
          oldSessionId: oldSession.sessionId,
          newSessionId: result.sessionId,
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to restart session:', error);
    }
    return false;
  }

  /**
   * Start visibility change tracking
   */
  static startVisibilityTracking(): void {
    // Remove existing handler if any
    this.stopVisibilityTracking();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - just record the timestamp
        // The actual restart logic will be handled by useActivityTracking
        // which has access to user info
        this.recordTabHidden();
      }
      // Note: Tab visible handling is done in useActivityTracking
      // because it needs userId, deviceInfo, and userAgent
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.visibilityHandler = handleVisibilityChange;
  }

  /**
   * Stop visibility change tracking
   */
  static stopVisibilityTracking(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  /**
   * Listen for storage changes (cross-tab communication)
   * This allows tabs to detect when another tab logs out or session changes
   */
  static setupStorageListener(onSessionCleared: () => void): void {
    // Remove existing listener if any
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }

    this.storageListener = (e: StorageEvent) => {
      // Check if session was cleared by another tab
      if (e.key === SESSION_ID_KEY && e.newValue === null && e.oldValue !== null) {
        // Session was cleared in another tab
        this.currentSession = null;
        this.stopActivityTracking();
        onSessionCleared();
      }
      // Check if session was updated by another tab
      else if (e.key === SESSION_ID_KEY && e.newValue && e.newValue !== e.oldValue) {
        // Session was updated in another tab, reload to sync
        const stored = this.getStoredSessionInfo();
        if (stored) {
          // Update current session if it matches
          if (this.currentSession && this.currentSession.sessionId === stored.sessionId) {
            // Same session, just update
            this.currentSession = {
              ...this.currentSession,
              startTime: stored.startTime,
            };
          }
        }
      }
    };

    window.addEventListener('storage', this.storageListener);
  }

  /**
   * Remove storage listener
   */
  static removeStorageListener(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  }

  /**
   * Debug helper: Get current session info (for testing)
   * Expose to window for console access
   */
  static getDebugInfo(): {
    currentSession: SessionInfo | null;
    storedSession: { sessionId: string; recordId: string; startTime: Date } | null;
    localStorageKeys: string[];
    articleReadStatesCount: number;
  } {
    const currentSession = this.getCurrentSession();
    const storedSession = this.getStoredSessionInfo();
    const localStorageKeys = Object.keys(localStorage).filter(k => k.startsWith('roark_'));
    const currentSessionId = currentSession?.sessionId || storedSession?.sessionId;
    const readStatesKey = currentSessionId 
      ? `roark_article_read_states_${currentSessionId}` 
      : null;
    const articleReadStatesCount = readStatesKey 
      ? (JSON.parse(localStorage.getItem(readStatesKey) || '[]') as any[]).length 
      : 0;

    return {
      currentSession,
      storedSession,
      localStorageKeys,
      articleReadStatesCount,
    };
  }
}

// Expose debug helper to window for console access (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__sessionDebug = () => {
    const info = SessionService.getDebugInfo();
    console.log('=== SESSION DEBUG INFO ===');
    console.log('Current Session:', info.currentSession);
    console.log('Stored Session:', info.storedSession);
    console.log('LocalStorage Keys:', info.localStorageKeys);
    console.log('Article Read States Count:', info.articleReadStatesCount);
    console.log('========================');
    return info;
  };

  // Helper to query sessions from database
  (window as any).__checkSessions = async (userId?: string) => {
    try {
      const { generateClient } = await import('aws-amplify/api');
      // Schema is already imported at the top of the file, use it directly
      const client = generateClient<Schema>();
      
      const query = /* GraphQL */ `
        query ListUserActivities($filter: ModelUserActivityFilterInput, $limit: Int) {
          listUserActivities(filter: $filter, limit: $limit) {
            items {
              id
              sessionId
              owner
              startTime
              endTime
              duration
              isActive
              deviceInfo
              userAgent
              createdAt
              updatedAt
            }
          }
        }
      `;

      const filter: any = {};
      if (userId) {
        filter.owner = { eq: userId };
      }

      const result = await client.graphql({
        query,
        variables: { filter: Object.keys(filter).length > 0 ? filter : undefined, limit: 100 },
      }) as any;

      const sessions = result.data?.listUserActivities?.items || [];
      
      console.log('=== SESSION DATABASE RECORDS ===');
      console.log(`Found ${sessions.length} session(s)`);
      console.log('\nRecent Sessions (sorted by startTime):');
      
      const sorted = sessions.sort((a: any, b: any) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      sorted.forEach((session: any, index: number) => {
        console.log(`\n--- Session ${index + 1} ---`);
        console.log('Session ID:', session.sessionId);
        console.log('Owner:', session.owner);
        console.log('Start Time:', new Date(session.startTime).toLocaleString());
        console.log('End Time:', session.endTime ? new Date(session.endTime).toLocaleString() : 'null (still active)');
        console.log('Duration:', session.duration ? `${session.duration}s (${Math.floor(session.duration / 60)}m ${session.duration % 60}s)` : 'null');
        console.log('Is Active:', session.isActive);
        console.log('Device Info:', session.deviceInfo);
        console.log('Created:', new Date(session.createdAt).toLocaleString());
        console.log('Updated:', new Date(session.updatedAt).toLocaleString());
      });
      
      // Check for active sessions
      const activeSessions = sessions.filter((s: any) => s.isActive);
      if (activeSessions.length > 0) {
        console.log(`\n⚠️  WARNING: ${activeSessions.length} active session(s) found:`);
        activeSessions.forEach((s: any) => {
          console.log(`  - ${s.sessionId} (started: ${new Date(s.startTime).toLocaleString()})`);
        });
      } else {
        console.log('\n✅ No active sessions found (all properly ended)');
      }
      
      console.log('\n=== END SESSION CHECK ===');
      return sessions;
    } catch (error) {
      console.error('Failed to check sessions:', error);
      return null;
    }
  };

  console.log('💡 Session debug helpers available:');
  console.log('   - __sessionDebug() - Check current session state');
  console.log('   - __checkSessions() - Query all sessions from database');
  console.log('   - __checkSessions("USER_ID") - Query sessions for specific user');
}

