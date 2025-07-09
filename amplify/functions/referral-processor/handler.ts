import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../data/resource';

const client = generateClient<Schema>();

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
}

export const handler = async (event: ReferralEvent): Promise<ReferralResponse> => {
  try {
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
    return { success: false, message: 'Internal server error' };
  }
};

async function generateReferralCode(userId: string): Promise<ReferralResponse> {
  try {
    // Generate a unique 8-character code
    const code = generateUniqueCode();
    
    // Check if code already exists
    const existingCodes = await client.models.ReferralCode.list({
      filter: { code: { eq: code } }
    });
    
    if (existingCodes.data.length > 0) {
      // Retry with a new code
      return await generateReferralCode(userId);
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
      success: true,
      message: 'Referral code generated successfully',
      data: { code: result.data?.code }
    };
  } catch (error) {
    console.error('Error generating referral code:', error);
    return { success: false, message: 'Failed to generate referral code' };
  }
}

async function validateReferralCode(code: string): Promise<ReferralResponse> {
  try {
    const result = await client.models.ReferralCode.list({
      filter: { 
        code: { eq: code },
        isActive: { eq: true }
      }
    });
    
    if (result.data.length === 0) {
      return { success: false, message: 'Invalid or inactive referral code' };
    }
    
    const referralCode = result.data[0];
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
    return { success: false, message: 'Failed to validate referral code' };
  }
}

async function processReferral(referrerId: string, referredId: string, code: string): Promise<ReferralResponse> {
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
    await extendSubscription(referrerId);
    
    return {
      success: true,
      message: 'Referral processed successfully',
      data: { freeMonthsEarned: 3 }
    };
  } catch (error) {
    console.error('Error processing referral:', error);
    return { success: false, message: 'Failed to process referral' };
  }
}

async function extendSubscription(userId: string): Promise<ReferralResponse> {
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
        trialEndDate: subscription.data?.trialEndDate
      }
    };
  } catch (error) {
    console.error('Error extending subscription:', error);
    return { success: false, message: 'Failed to extend subscription' };
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