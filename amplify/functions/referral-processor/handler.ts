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
  action: 'generate_code' | 'validate_code' | 'process_referral' | 'extend_subscription';
  userId?: string;
  referralCode?: string;
  referrerId?: string;
  referredId?: string;
}

interface ReferralResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const handler = async (event: ReferralEvent): Promise<ReferralResponse> => {
  try {
    console.log('Referral processor event:', JSON.stringify(event, null, 2));
    
    switch (event.action) {
      case 'generate_code':
        return await generateReferralCode(event.userId!);
      case 'validate_code':
        return await validateReferralCode(event.referralCode!);
      case 'process_referral':
        return await processReferral(event.referrerId!, event.referredId!, event.referralCode!);
      case 'extend_subscription':
        return await extendSubscription(event.userId!);
      default:
        return { success: false, message: 'Invalid action' };
    }
  } catch (error) {
    console.error('Referral processor error:', error);
    return { 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

async function generateReferralCode(userId: string): Promise<ReferralResponse> {
  try {
    console.log('Generating referral code for user:', userId);
    
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
      return await generateReferralCode(userId);
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
    
    console.log('Referral code generated successfully:', result.createReferralCode);
    
    return {
      success: true,
      message: 'Referral code generated successfully',
      data: { code: result.createReferralCode?.code }
    };
  } catch (error) {
    console.error('Error generating referral code:', error);
    return { 
      success: false, 
      message: 'Failed to generate referral code',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function validateReferralCode(code: string): Promise<ReferralResponse> {
  try {
    console.log('Validating referral code:', code);
    
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
      return { success: false, message: 'Invalid or inactive referral code' };
    }
    
    const referralCode = result.listReferralCodes.items[0];
    console.log('Referral code validated successfully:', referralCode);
    
    return {
      success: true,
      message: 'Valid referral code',
      data: { 
        referrerId: referralCode.owner,
        code: referralCode.code
      }
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { 
      success: false, 
      message: 'Failed to validate referral code',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function processReferral(referrerId: string, referredId: string, code: string): Promise<ReferralResponse> {
  try {
    console.log('Processing referral:', { referrerId, referredId, code });
    
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
            code
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
    await extendSubscription(referrerId);
    
    console.log('Referral processed successfully');
    
    return {
      success: true,
      message: 'Referral processed successfully',
      data: { freeMonthsEarned: 3 }
    };
  } catch (error) {
    console.error('Error processing referral:', error);
    return { 
      success: false, 
      message: 'Failed to process referral',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function extendSubscription(userId: string): Promise<ReferralResponse> {
  try {
    console.log('Extending subscription for user:', userId);
    
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
        success: true,
        message: 'Subscription extended successfully',
        data: { 
          earnedMonths: newEarnedMonths,
          trialEndDate: newTrialEndDate.toISOString()
        }
      };
    }
    
    return {
      success: true,
      message: 'Subscription extended successfully',
      data: { 
        earnedMonths: 3,
        trialEndDate: subscription.createUserSubscription?.trialEndDate
      }
    };
  } catch (error) {
    console.error('Error extending subscription:', error);
    return { 
      success: false, 
      message: 'Failed to extend subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
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