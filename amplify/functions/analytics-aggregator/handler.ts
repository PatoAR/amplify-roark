import fetch from 'node-fetch';

// Type declaration for process.env to avoid @types/node dependency
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION?: string;
      GRAPHQL_API_URL?: string;
      GRAPHQL_API_KEY?: string;
      API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT?: string;
    }
  }
}

function getAppSyncUrl(): string {
  const url = process.env.GRAPHQL_API_URL || process.env.API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT;
  if (!url) {
    throw new Error('AppSync URL not configured. Ensure GRAPHQL_API_URL is set for the function.');
  }
  return url;
}

function getApiKey(): string {
  const apiKey = process.env.GRAPHQL_API_KEY;
  if (!apiKey) {
    throw new Error('AppSync API Key not configured. Ensure GRAPHQL_API_KEY is set.');
  }
  return apiKey;
}

interface AppSyncResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

async function appsyncRequest<T = any>(query: string, variables?: any): Promise<T> {
  const url = getAppSyncUrl();
  const apiKey = getApiKey();
  const body = JSON.stringify({ query, variables });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AppSync request failed: ${response.status} ${response.statusText}`);
    console.error(`Response body: ${errorText}`);
    throw new Error(`AppSync request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json() as AppSyncResponse<T>;
  
  if (result.errors) {
    console.error('AppSync GraphQL errors:', result.errors);
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data as T;
}

interface AnalyticsEvent {
  httpMethod?: string;
  path?: string;
  body?: string;
  headers?: Record<string, string>;
  requestContext?: {
    authorizer?: {
      claims?: {
        email?: string;
      };
    };
    identity?: {
      cognitoIdentityId?: string;
    };
    http?: {
      method?: string;
      path?: string;
    };
  };
  rawQueryString?: string;
  // For direct Lambda invocations from Amplify
  identity?: {
    sub?: string;
  };
  // Cognito user attributes from Amplify function invocation
  request?: {
    userAttributes?: {
      email?: string;
    };
  };
  // For Function URL events (direct invocation via invoke())
  timeRange?: '7d' | '30d' | '90d';
  userEmail?: string;
}

// AppSync resolver event format
interface AppSyncResolverEvent {
  arguments: {
    timeRange?: '7d' | '30d' | '90d';
  };
  identity?: {
    sub?: string;
    claims?: {
      email?: string;
      'cognito:username'?: string;
    };
  };
  request?: {
    userAttributes?: {
      email?: string;
      sub?: string;
    };
  };
}

interface AnalyticsResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

interface AggregatedAnalytics {
  registeredUsers: number;
  totalSessions: number;
  averageSessionsPerUser: number;
  averageSessionDuration: number;
  totalTimeSpent: number;
  activeUsers: number;
  subscriptionStatusBreakdown: {
    free_trial: number;
    active: number;
    expired: number;
    cancelled: number;
  };
  sessionsPerUser: Array<{
    userId: string;
    sessionCount: number;
  }>;
}

const MASTER_EMAIL = 'master@perkinsintel.com';

async function getAllUserActivities(startDate?: string): Promise<any[]> {
  const query = `
    query ListUserActivities($filter: ModelUserActivityFilterInput, $limit: Int, $nextToken: String) {
      listUserActivities(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
          id
          owner
          sessionId
          startTime
          endTime
          duration
          isActive
        }
        nextToken
      }
    }
  `;

  const filter: any = {};
  if (startDate) {
    filter.startTime = { ge: startDate };
  }

  let allActivities: any[] = [];
  let nextToken: string | null = null;

  do {
    const result: any = await appsyncRequest(query, {
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: 1000,
      nextToken,
    });

    if (result?.listUserActivities?.items) {
      allActivities = allActivities.concat(result.listUserActivities.items);
    }
    nextToken = result?.listUserActivities?.nextToken || null;
  } while (nextToken);

  return allActivities;
}

async function getAllUserSubscriptions(): Promise<any[]> {
  const query = `
    query ListUserSubscriptions($limit: Int, $nextToken: String) {
      listUserSubscriptions(limit: $limit, nextToken: $nextToken) {
        items {
          id
          owner
          subscriptionStatus
          trialStartDate
          trialEndDate
        }
        nextToken
      }
    }
  `;

  let allSubscriptions: any[] = [];
  let nextToken: string | null = null;

  do {
    const result: any = await appsyncRequest(query, {
      limit: 1000,
      nextToken,
    });

    if (result?.listUserSubscriptions?.items) {
      allSubscriptions = allSubscriptions.concat(result.listUserSubscriptions.items);
    }
    nextToken = result?.listUserSubscriptions?.nextToken || null;
  } while (nextToken);

  return allSubscriptions;
}

function verifyMasterUser(event: AnalyticsEvent | AppSyncResolverEvent | any): boolean {
  let email: string | undefined;
  
  // PRIORITY 1: Check identity claims from AppSync/Cognito (most secure - cannot be spoofed)
  // For AppSync resolver events, identity claims are the authoritative source
  if (event.identity?.claims?.email) {
    email = event.identity.claims.email;
  }
  
  // PRIORITY 2: Check request userAttributes (Amplify function invocation)
  if (!email && event.request?.userAttributes?.email) {
    email = event.request.userAttributes.email;
  }
  
  // PRIORITY 3: Check email from request context (Cognito authorizer - API Gateway)
  if (!email && event.requestContext?.authorizer?.claims?.email) {
    email = event.requestContext.authorizer.claims.email;
  }
  
  // PRIORITY 4: Check from headers (for direct Lambda invocation)
  if (!email && event.headers) {
    email = event.headers['x-user-email'] || event.headers['X-User-Email'];
  }
  
  // PRIORITY 5: Check from request body (for HTTP events)
  if (!email && event.body) {
    try {
      const bodyData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      email = bodyData.userEmail;
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // PRIORITY 6: Check userEmail property (for direct Lambda invocations - least secure)
  // This should only be used if no identity information is available
  if (!email && event.userEmail) {
    email = event.userEmail;
  }
  
  if (!email) {
    console.error('No user email found in request');
    console.error('Event structure:', JSON.stringify(event, null, 2));
    return false;
  }

  const isMaster = email.toLowerCase() === MASTER_EMAIL.toLowerCase();
  console.log(`User email: ${email}, Is master: ${isMaster}`);
  return isMaster;
}

async function aggregateAnalytics(timeRange?: '7d' | '30d' | '90d'): Promise<AggregatedAnalytics> {
  // Calculate date range if provided
  let startDate: string | undefined;
  if (timeRange) {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const start = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    startDate = start.toISOString();
  }

  // Fetch all data
  const [activities, subscriptions] = await Promise.all([
    getAllUserActivities(startDate),
    getAllUserSubscriptions(),
  ]);

  // Calculate registered users
  const uniqueUserIds = new Set(subscriptions.map((sub: any) => sub.owner).filter(Boolean));
  const registeredUsers = uniqueUserIds.size;

  // Calculate sessions per user
  const sessionsByUser = new Map<string, number>();
  activities.forEach((activity: any) => {
    if (activity.owner) {
      sessionsByUser.set(activity.owner, (sessionsByUser.get(activity.owner) || 0) + 1);
    }
  });

  const totalSessions = activities.length;
  const averageSessionsPerUser = registeredUsers > 0 ? totalSessions / registeredUsers : 0;

  // Calculate session durations
  const now = new Date();
  let totalDuration = 0;
  let validDurations = 0;

  activities.forEach((activity: any) => {
    if (activity.duration) {
      totalDuration += activity.duration;
      validDurations++;
    } else if (activity.isActive && activity.startTime) {
      // Calculate duration for active sessions
      const sessionStart = new Date(activity.startTime);
      const seconds = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      if (seconds > 0) {
        totalDuration += seconds;
        validDurations++;
      }
    }
  });

  const averageSessionDuration = validDurations > 0 ? Math.round(totalDuration / validDurations) : 0;

  // Calculate active users (users with active sessions or recent activity)
  const activeUserIds = new Set<string>();
  const recentActivityThreshold = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // Last 7 days
  
  activities.forEach((activity: any) => {
    if (activity.owner) {
      if (activity.isActive) {
        activeUserIds.add(activity.owner);
      } else if (activity.startTime) {
        const activityDate = new Date(activity.startTime);
        if (activityDate >= recentActivityThreshold) {
          activeUserIds.add(activity.owner);
        }
      }
    }
  });

  const activeUsers = activeUserIds.size;

  // Calculate subscription status breakdown
  const statusBreakdown = {
    free_trial: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
  };

  subscriptions.forEach((sub: any) => {
    const status = sub.subscriptionStatus;
    if (status && statusBreakdown.hasOwnProperty(status)) {
      statusBreakdown[status as keyof typeof statusBreakdown]++;
    }
  });

  // Get sessions per user (top users)
  const sessionsPerUser = Array.from(sessionsByUser.entries())
    .map(([userId, sessionCount]) => ({ userId, sessionCount }))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  return {
    registeredUsers,
    totalSessions,
    averageSessionsPerUser: Math.round(averageSessionsPerUser * 100) / 100,
    averageSessionDuration,
    totalTimeSpent: totalDuration,
    activeUsers,
    subscriptionStatusBreakdown: statusBreakdown,
    sessionsPerUser,
  };
}

export const handler = async (event: AnalyticsEvent | AppSyncResolverEvent | any): Promise<AnalyticsResponse | AggregatedAnalytics> => {
  // Handle HTTP events (Function URL / API Gateway) - return HTTP response
  if ('httpMethod' in event || ('requestContext' in event && !('arguments' in event))) {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    // Handle CORS preflight (for HTTP events)
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    try {
      // Verify master user
      if (!verifyMasterUser(event)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Access denied. Master user access required.' }),
        };
      }

      // Parse request body for time range
      let timeRange: '7d' | '30d' | '90d' | undefined;
      
      // For HTTP events (Function URL or API Gateway), parse body
      let bodyData: any = null;
      if (event.body) {
        try {
          bodyData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
          timeRange = bodyData.timeRange;
        } catch (e) {
          // Ignore parse errors, use default
        }
      }

      // Also check query parameters (for HTTP events)
      if (!timeRange && event.rawQueryString) {
        const params = new URLSearchParams(event.rawQueryString);
        const range = params.get('timeRange');
        if (range === '7d' || range === '30d' || range === '90d') {
          timeRange = range;
        }
      }

      // Aggregate analytics
      const analytics = await aggregateAnalytics(timeRange);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(analytics),
      };
    } catch (error) {
      console.error('Analytics aggregator error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
      };
    }
  }

  // Handle AppSync resolver events - return data directly
  try {
    let timeRange: '7d' | '30d' | '90d' | undefined;

    // AppSync resolver format
    if ('arguments' in event) {
      const args = (event as AppSyncResolverEvent).arguments;
      timeRange = args.timeRange;
      
      // Verify master user using identity claims (cannot be spoofed)
      if (!verifyMasterUser(event)) {
        throw new Error('Access denied. Master user access required.');
      }
    } 
    // Direct Lambda invocation format
    else if ('timeRange' in event || 'userEmail' in event) {
      timeRange = event.timeRange;
      
      if (!verifyMasterUser(event)) {
        throw new Error('Access denied. Master user access required.');
      }
    } else {
      throw new Error('Invalid event format');
    }

    // Aggregate analytics
    return await aggregateAnalytics(timeRange);
  } catch (error) {
    console.error('Analytics aggregator error:', error);
    throw error;
  }
};

