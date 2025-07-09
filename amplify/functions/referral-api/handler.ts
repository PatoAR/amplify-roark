import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../data/resource';

const client = generateClient<Schema>();

interface ReferralEvent {
  httpMethod: string;
  path: string;
  body?: string;
  headers?: Record<string, string>;
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
    const existingCodes = await client.models.ReferralCode.list({
      filter: { code: { eq: code } }
    });
    
    if (existingCodes.data.length > 0) {
      // Retry with a new code
      return await generateReferralCode(userId, headers);
    }
    
    // Create the referral code
    const result = await client.models.ReferralCode.create({
      owner: userId,
      code,
      isActive: true,
      totalReferrals: 0,
      successfulReferrals: 0,
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
    const result = await client.models.ReferralCode.list({
      filter: { 
        code: { eq: code },
        isActive: { eq: true }
      }
    });
    
    if (result.data.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid or inactive referral code'
        }),
      };
    }
    
    const referralCode = result.data[0];
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
    await client.models.Referral.create({
      referrerId,
      referredId,
      referralCode: code,
      status: 'completed',
      completedAt: new Date().toISOString(),
      freeMonthsEarned: 3,
    });
    
    // Update referral code stats
    const referralCodes = await client.models.ReferralCode.list({
      filter: { code: { eq: code } }
    });
    
    if (referralCodes.data.length > 0) {
      const referralCode = referralCodes.data[0];
      await client.models.ReferralCode.update({
        id: referralCode.id,
        totalReferrals: (referralCode.totalReferrals || 0) + 1,
        successfulReferrals: (referralCode.successfulReferrals || 0) + 1,
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
    const subscriptions = await client.models.UserSubscription.list({
      filter: { owner: { eq: userId } }
    });
    
    let subscription;
    if (subscriptions.data.length === 0) {
      // Create new subscription if none exists
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial
      
      subscription = await client.models.UserSubscription.create({
        owner: userId,
        subscriptionStatus: 'free_trial',
        trialStartDate: trialStartDate.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        totalFreeMonths: 3,
        earnedFreeMonths: 3, // Bonus from referral
      });
    } else {
      // Extend existing subscription
      subscription = subscriptions.data[0];
      const currentEarnedMonths = subscription.earnedFreeMonths || 0;
      const newEarnedMonths = currentEarnedMonths + 3;
      
      // Recalculate trial end date
      const trialStartDate = new Date(subscription.trialStartDate || new Date());
      const newTrialEndDate = new Date(trialStartDate);
      newTrialEndDate.setMonth(newTrialEndDate.getMonth() + (subscription.totalFreeMonths || 3) + newEarnedMonths);
      
      await client.models.UserSubscription.update({
        id: subscription.id,
        earnedFreeMonths: newEarnedMonths,
        trialEndDate: newTrialEndDate.toISOString(),
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
          trialEndDate: subscription.data?.trialEndDate
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