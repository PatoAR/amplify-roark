import fetch from 'node-fetch';
import { secret } from '@aws-amplify/backend';

// Type declaration for process.env to avoid @types/node dependency
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION?: string;
    }
  }
}

async function getAppSyncUrl(): Promise<string> {
  try {
    // Use Amplify Gen 2 secrets for secure configuration
    const urlSecret = await secret('GRAPHQL_API_URL');
    const url = urlSecret.toString();
    if (!url) {
      throw new Error('GRAPHQL_API_URL secret not configured');
    }
    return url;
  } catch (error) {
    console.error('Error accessing GRAPHQL_API_URL secret:', error);
    // Fallback to old environment variable for backward compatibility
    const fallbackUrl = process.env.API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT;
    if (fallbackUrl) {
      console.log('Using fallback API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT');
      return fallbackUrl;
    }
    throw new Error('AppSync URL not configured. Please set GRAPHQL_API_URL secret in Amplify console.');
  }
}

async function getApiKey(): Promise<string> {
  try {
    // Use Amplify Gen 2 secrets for secure configuration
    const apiKeySecret = await secret('GRAPHQL_API_KEY');
    const apiKey = apiKeySecret.toString();
    if (!apiKey) {
      throw new Error('GRAPHQL_API_KEY secret not configured');
    }
    return apiKey;
  } catch (error) {
    console.error('Error accessing GRAPHQL_API_KEY secret:', error);
    throw new Error('AppSync API Key not configured. Please set GRAPHQL_API_KEY secret in Amplify console.');
  }
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
  const url = await getAppSyncUrl();
  const apiKey = await getApiKey();
  const body = JSON.stringify({ query, variables });

  console.log(`Making AppSync request to: ${url}`);
  console.log(`Query: ${query}`);
  console.log(`Variables: ${JSON.stringify(variables)}`);

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



interface ReferralEvent {
  httpMethod: string;
  path: string;
  body?: string;
  headers?: Record<string, string>;
  rawQueryString?: string; // Added for query parameters
}

interface ReferralResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export const handler = async (event: ReferralEvent): Promise<ReferralResponse> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    
    switch (event.httpMethod) {
      case 'POST':
        return await handlePostRequest(body, headers);
      case 'GET':
        if (event.path === '/validate') {
          // Parse query parameters from the URL
          const url = new URL(`https://example.com${event.path}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);
          const code = url.searchParams.get('code');
          if (!code) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Referral code is required' }),
              headers: { 'Content-Type': 'application/json' }
            };
          }

          try {
            // Validate referral code without requiring owner authorization
            const listReferralCodesQuery = `
              query ListReferralCodes($filter: ModelReferralCodeFilterInput) {
                listReferralCodes(filter: $filter) {
                  items {
                    id
                    owner
                    code
                    isActive
                    totalReferrals
                    successfulReferrals
                  }
                }
              }
            `;

            const referralCodes = await appsyncRequest(listReferralCodesQuery, {
              filter: { code: { eq: code }, isActive: { eq: true } }
            });

            if (referralCodes.listReferralCodes.items.length > 0) {
              const referralCode = referralCodes.listReferralCodes.items[0];
              
              // Update totalReferrals for this validation attempt
              const updateReferralCodeMutation = `
                mutation UpdateReferralCode($input: UpdateReferralCodeInput!) {
                  updateReferralCode(input: $input) {
                    id
                    code
                    totalReferrals
                    successfulReferrals
                  }
                }
              `;

              await appsyncRequest(updateReferralCodeMutation, {
                input: {
                  id: referralCode.id,
                  totalReferrals: (referralCode.totalReferrals || 0) + 1,
                }
              });

              return {
                statusCode: 200,
                body: JSON.stringify({
                  valid: true,
                  referrerId: referralCode.owner,
                  totalReferrals: referralCode.totalReferrals + 1,
                  successfulReferrals: referralCode.successfulReferrals
                }),
                headers: { 'Content-Type': 'application/json' }
              };
            } else {
              return {
                statusCode: 200,
                body: JSON.stringify({ valid: false }),
                headers: { 'Content-Type': 'application/json' }
              };
            }
          } catch (error) {
            console.error('Error validating referral code:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ error: 'Failed to validate referral code' }),
              headers: { 'Content-Type': 'application/json' }
            };
          }
        }
        return await handleGetRequest(event.path, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function handlePostRequest(body: any, headers: Record<string, string>): Promise<ReferralResponse> {
  const { action, userId, referralCode, referrerId, referredId } = body;

  try {
    switch (action) {
      case 'generate_code':
        return await generateReferralCode(userId, headers);
      case 'validate_code':
        return await validateReferralCode(referralCode, headers);
      case 'process_referral':
        return await processReferral(referrerId, referredId, referralCode, headers);
      case 'extend_subscription':
        return await extendSubscription(userId, headers);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Post request error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function handleGetRequest(path: string, headers: Record<string, string>): Promise<ReferralResponse> {
  // Handle GET requests for referral stats, etc.
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'GET requests not implemented yet' }),
  };
}

async function generateReferralCode(userId: string, headers: Record<string, string>): Promise<ReferralResponse> {
  try {
    // Generate a unique 8-character code
    const code = generateUniqueCode();
    
    // Check if code already exists
    const listReferralCodesQuery = `
      query ListReferralCodes($filter: ModelReferralCodeFilterInput) {
        listReferralCodes(filter: $filter) {
          items {
            id
            code
          }
        }
      }
    `;
    
    const existingCodes = await appsyncRequest(listReferralCodesQuery, {
      filter: { code: { eq: code } }
    });
    
    if (existingCodes.listReferralCodes.items.length > 0) {
      // Retry with a new code
      return await generateReferralCode(userId, headers);
    }
    
    // Create the referral code
    const createReferralCodeMutation = `
      mutation CreateReferralCode($input: CreateReferralCodeInput!) {
        createReferralCode(input: $input) {
          id
          owner
          code
          isActive
          totalReferrals
          successfulReferrals
        }
      }
    `;
    
    const result = await appsyncRequest(createReferralCodeMutation, {
      input: {
        owner: userId,
        code,
        isActive: true,
        totalReferrals: 0,
        successfulReferrals: 0,
      }
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Referral code generated successfully',
        data: { code: code }
      }),
    };
  } catch (error) {
    console.error('Error generating referral code:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to generate referral code'
      }),
    };
  }
}

async function validateReferralCode(code: string, headers: Record<string, string>): Promise<ReferralResponse> {
  try {
    const listReferralCodesQuery = `
      query ListReferralCodes($filter: ModelReferralCodeFilterInput) {
        listReferralCodes(filter: $filter) {
          items {
            id
            owner
            code
            isActive
          }
        }
      }
    `;
    
    const result = await appsyncRequest(listReferralCodesQuery, {
      filter: { 
        code: { eq: code },
        isActive: { eq: true }
      }
    });
    
    if (result.listReferralCodes.items.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid or inactive referral code'
        }),
      };
    }
    
    const referralCode = result.listReferralCodes.items[0];
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Valid referral code',
        data: { 
          referrerId: referralCode.owner,
          code: referralCode.code
        }
      }),
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to validate referral code'
      }),
    };
  }
}

async function processReferral(referrerId: string, referredId: string, code: string, headers: Record<string, string>): Promise<ReferralResponse> {
  try {
    // Create referral record
    const createReferralMutation = `
      mutation CreateReferral($input: CreateReferralInput!) {
        createReferral(input: $input) {
          id
          referrerId
          referredId
          referralCode
          status
          completedAt
          freeMonthsEarned
        }
      }
    `;
    
    await appsyncRequest(createReferralMutation, {
      input: {
        referrerId,
        referredId,
        referralCode: code,
        status: 'completed',
        completedAt: new Date().toISOString(),
        freeMonthsEarned: 3,
      }
    });
    
    // Update referral code stats
    const listReferralCodesQuery = `
      query ListReferralCodes($filter: ModelReferralCodeFilterInput) {
        listReferralCodes(filter: $filter) {
          items {
            id
            totalReferrals
            successfulReferrals
          }
        }
      }
    `;
    
    const referralCodes = await appsyncRequest(listReferralCodesQuery, {
      filter: { code: { eq: code } }
    });
    
    if (referralCodes.listReferralCodes.items.length > 0) {
      const referralCode = referralCodes.listReferralCodes.items[0];
      
      const updateReferralCodeMutation = `
        mutation UpdateReferralCode($input: UpdateReferralCodeInput!) {
          updateReferralCode(input: $input) {
            id
            totalReferrals
            successfulReferrals
          }
        }
      `;
      
      await appsyncRequest(updateReferralCodeMutation, {
        input: {
          id: referralCode.id,
          successfulReferrals: (referralCode.successfulReferrals || 0) + 1,
        }
      });
    }
    
    // Extend referrer's subscription
    await extendSubscription(referrerId, headers);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Referral processed successfully',
        data: { freeMonthsEarned: 3 }
      }),
    };
  } catch (error) {
    console.error('Error processing referral:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to process referral'
      }),
    };
  }
}

async function extendSubscription(userId: string, headers: Record<string, string>): Promise<ReferralResponse> {
  try {
    // Get user's subscription
    const listUserSubscriptionsQuery = `
      query ListUserSubscriptions($filter: ModelUserSubscriptionFilterInput) {
        listUserSubscriptions(filter: $filter) {
          items {
            id
            owner
            subscriptionStatus
            trialStartDate
            trialEndDate
            totalFreeMonths
            earnedFreeMonths
          }
        }
      }
    `;
    
    const subscriptions = await appsyncRequest(listUserSubscriptionsQuery, {
      filter: { owner: { eq: userId } }
    });
    
    let subscription;
    if (subscriptions.listUserSubscriptions.items.length === 0) {
      // Create new subscription if none exists
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial
      
      const createUserSubscriptionMutation = `
        mutation CreateUserSubscription($input: CreateUserSubscriptionInput!) {
          createUserSubscription(input: $input) {
            id
            owner
            subscriptionStatus
            trialStartDate
            trialEndDate
            totalFreeMonths
            earnedFreeMonths
          }
        }
      `;
      
      subscription = await appsyncRequest(createUserSubscriptionMutation, {
        input: {
          owner: userId,
          subscriptionStatus: 'free_trial',
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          totalFreeMonths: 3,
          earnedFreeMonths: 3, // Bonus from referral
        }
      });
    } else {
      // Extend existing subscription
      subscription = subscriptions.listUserSubscriptions.items[0];
      const currentEarnedMonths = subscription.earnedFreeMonths || 0;
      const newEarnedMonths = currentEarnedMonths + 3;
      
      // Recalculate trial end date
      const trialStartDate = new Date(subscription.trialStartDate || new Date());
      const newTrialEndDate = new Date(trialStartDate);
      newTrialEndDate.setMonth(newTrialEndDate.getMonth() + (subscription.totalFreeMonths || 3) + newEarnedMonths);
      
      const updateUserSubscriptionMutation = `
        mutation UpdateUserSubscription($input: UpdateUserSubscriptionInput!) {
          updateUserSubscription(input: $input) {
            id
            owner
            earnedFreeMonths
            trialEndDate
          }
        }
      `;
      
      await appsyncRequest(updateUserSubscriptionMutation, {
        input: {
          id: subscription.id,
          earnedFreeMonths: newEarnedMonths,
          trialEndDate: newTrialEndDate.toISOString(),
        }
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Subscription extended successfully',
          data: { 
            earnedMonths: newEarnedMonths,
            trialEndDate: newTrialEndDate.toISOString()
          }
        }),
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Subscription extended successfully',
        data: { 
          earnedMonths: 3,
          trialEndDate: subscription.createUserSubscription?.trialEndDate
        }
      }),
    };
  } catch (error) {
    console.error('Error extending subscription:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to extend subscription'
      }),
    };
  }
}

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 