import fetch from 'node-fetch';
import { EventBridgeEvent } from 'aws-lambda';

const LOGOUT_TIMEOUT_MS = 120 * 60 * 1000; // 2 hours in milliseconds

// Type declaration for process.env
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

interface UserActivity {
  id: string;
  sessionId: string;
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  isActive?: boolean | null;
  owner?: string | null;
}

/**
 * Lambda function to clean up abandoned sessions
 * Runs on a schedule (EventBridge/CloudWatch Events) to expire sessions older than 2 hours
 * This handles requirement 5: Session ends even if browser/computer is shut down
 */
export const handler = async (
  event: EventBridgeEvent<'Scheduled Event', {}>
): Promise<{ success: boolean; expiredCount: number; error?: string }> => {
  console.log('Session cleanup triggered:', new Date().toISOString());

  try {
    const now = new Date();
    const expirationThreshold = LOGOUT_TIMEOUT_MS;
    let expiredCount = 0;
    let nextToken: string | undefined = undefined;

    // Query all active sessions in batches
    do {
      const listQuery = `
        query ListUserActivities($filter: ModelUserActivityFilterInput, $limit: Int, $nextToken: String) {
          listUserActivities(filter: $filter, limit: $limit, nextToken: $nextToken) {
            items {
              id
              sessionId
              startTime
              endTime
              duration
              isActive
              owner
            }
            nextToken
          }
        }
      `;

      const result: {
        listUserActivities: {
          items: UserActivity[];
          nextToken?: string;
        };
      } = await appsyncRequest<{
        listUserActivities: {
          items: UserActivity[];
          nextToken?: string;
        };
      }>(listQuery, {
        filter: {
          isActive: { eq: true },
        },
        limit: 100,
        nextToken: nextToken,
      });

      const activities = result.listUserActivities.items || [];
      nextToken = result.listUserActivities.nextToken;

      // Process each active session
      for (const activity of activities) {
        const startTime = new Date(activity.startTime);
        const timeSinceStart = now.getTime() - startTime.getTime();

        // If session is older than 2 hours, expire it
        if (timeSinceStart > expirationThreshold) {
          const endTime = new Date();
          const duration = Math.floor(timeSinceStart / 1000); // Duration in seconds

          const updateMutation = `
            mutation UpdateUserActivity($input: UpdateUserActivityInput!) {
              updateUserActivity(input: $input) {
                id
                endTime
                duration
                isActive
              }
            }
          `;

          try {
            await appsyncRequest(updateMutation, {
              input: {
                id: activity.id,
                endTime: endTime.toISOString(),
                duration,
                isActive: false,
              },
            });

            expiredCount++;
            console.log(`Expired session: ${activity.sessionId} (${activity.owner})`);
          } catch (error) {
            console.error(`Failed to expire session ${activity.id}:`, error);
          }
        }
      }
    } while (nextToken);

    console.log(`Session cleanup completed. Expired ${expiredCount} sessions.`);

    return {
      success: true,
      expiredCount,
    };
  } catch (error) {
    console.error('Session cleanup error:', error);
    return {
      success: false,
      expiredCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

