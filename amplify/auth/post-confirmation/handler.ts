import { PostConfirmationTriggerHandler } from 'aws-lambda';
import fetch from 'node-fetch';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';

let hasLoggedAppSyncEnv = false;

// Type declaration for process.env to avoid @types/node dependency
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT?: string;
      AWS_REGION?: string;
    }
  }
}

async function getAppSyncUrl(): Promise<string> {
  const url = process.env.API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT;
  if (!url) throw new Error('AppSync URL not configured');
  return url;
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
  const region = process.env.AWS_REGION || extractRegionFromAppSyncUrl(url);
  const body = JSON.stringify({ query, variables });

  const { hostname, pathname, protocol } = new URL(url);
  const request = new HttpRequest({
    method: 'POST',
    protocol,
    hostname,
    path: pathname,
    headers: {
      'content-type': 'application/json',
      host: hostname,
    },
    body,
  });

  const signer = new SignatureV4({
    service: 'appsync',
    region,
    credentials: defaultProvider(),
    sha256: Sha256,
  });

  const signed = await signer.sign(request);
  const response = await fetch(url, {
    method: 'POST',
    headers: signed.headers as any,
    body,
  });

  if (!response.ok) {
    throw new Error(`AppSync request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json() as AppSyncResponse<T>;
  
  if (result.errors) {
    console.error('AppSync GraphQL errors:', result.errors);
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data as T;
}

function extractRegionFromAppSyncUrl(url: string): string {
  const match = url.match(/appsync-api\.([a-z0-9-]+)\.amazonaws\.com/i);
  return match?.[1] || process.env.AWS_REGION || 'us-east-1';
}

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('Post-confirmation trigger:', JSON.stringify(event, null, 2));

  if (!hasLoggedAppSyncEnv) {
    const resolvedUrl = process.env.APPSYNC_URL || process.env.API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT;
    console.log('APPSYNC_URL (resolved):', resolvedUrl);
    hasLoggedAppSyncEnv = true;
  }

  try {
    const { userAttributes } = event.request;
    const userId = event.request.userAttributes.sub;

    // Check if user signed up with a referral code
    const referralCode = userAttributes['custom:referralCode'];
    const referrerId = userAttributes['custom:referrerId'];

    console.log(`User ${userId} signup details:`, {
      referralCode,
      referrerId,
      hasReferralCode: !!referralCode,
      hasReferrerId: !!referrerId,
      allUserAttributes: userAttributes
    });

    if (referralCode && referrerId) {
      console.log(`Processing referral: code=${referralCode}, referrerId=${referrerId}, userId=${userId}`);

      try {
        // Create UserSubscription record with referral information
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial

        console.log(`Creating UserSubscription for user ${userId} with referral info`);
        
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
              referralCodeUsed
              referrerId
            }
          }
        `;

        const userSubscription = await appsyncRequest(createUserSubscriptionMutation, {
          input: {
            owner: userId,
            subscriptionStatus: 'free_trial',
            trialStartDate: trialStartDate.toISOString(),
            trialEndDate: trialEndDate.toISOString(),
            totalFreeMonths: 3,
            earnedFreeMonths: 0,
            referralCodeUsed: referralCode,
            referrerId: referrerId,
          }
        });
        console.log(`UserSubscription created successfully:`, userSubscription);

        // Process the referral to give the referrer their bonus
        console.log(`Creating Referral record for referrer ${referrerId}`);
        
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

        const referral = await appsyncRequest(createReferralMutation, {
          input: {
            referrerId,
            referredId: userId,
            referralCode,
            status: 'completed',
            completedAt: new Date().toISOString(),
            freeMonthsEarned: 3,
          }
        });
        console.log(`Referral created successfully:`, referral);

        // Update referral code stats
        console.log(`Updating referral code stats for code ${referralCode}`);
        
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
          filter: { code: { eq: referralCode } }
        });

        if (referralCodes.listReferralCodes.items.length > 0) {
          const referralCodeRecord = referralCodes.listReferralCodes.items[0];
          
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

          const updatedCode = await appsyncRequest(updateReferralCodeMutation, {
            input: {
              id: referralCodeRecord.id,
              // Don't increment totalReferrals here - it's already incremented during validation
              // totalReferrals: (referralCodeRecord.totalReferrals || 0) + 1,
              successfulReferrals: (referralCodeRecord.successfulReferrals || 0) + 1,
            }
          });
          console.log(`ReferralCode updated successfully:`, updatedCode);
        } else {
          console.warn(`ReferralCode not found for code: ${referralCode}`);
        }

        // Extend referrer's subscription
        console.log(`Extending referrer's subscription for user ${referrerId}`);
        
        const listReferrerSubscriptionsQuery = `
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

        const referrerSubscriptions = await appsyncRequest(listReferrerSubscriptionsQuery, {
          filter: { owner: { eq: referrerId } }
        });

        if (referrerSubscriptions.listUserSubscriptions.items.length > 0) {
          const referrerSubscription = referrerSubscriptions.listUserSubscriptions.items[0];
          const currentEarnedMonths = referrerSubscription.earnedFreeMonths || 0;
          const newEarnedMonths = currentEarnedMonths + 3;

          // Recalculate trial end date
          const trialStartDate = new Date(referrerSubscription.trialStartDate || new Date());
          const newTrialEndDate = new Date(trialStartDate);
          newTrialEndDate.setMonth(newTrialEndDate.getMonth() + (referrerSubscription.totalFreeMonths || 3) + newEarnedMonths);

          const updateReferrerSubscriptionMutation = `
            mutation UpdateUserSubscription($input: UpdateUserSubscriptionInput!) {
              updateUserSubscription(input: $input) {
                id
                owner
                earnedFreeMonths
                trialEndDate
              }
            }
          `;

          const updatedSubscription = await appsyncRequest(updateReferrerSubscriptionMutation, {
            input: {
              id: referrerSubscription.id,
              earnedFreeMonths: newEarnedMonths,
              trialEndDate: newTrialEndDate.toISOString(),
            }
          });
          console.log(`Referrer subscription updated successfully:`, updatedSubscription);
        } else {
          console.warn(`Referrer subscription not found for user: ${referrerId}`);
        }

        console.log(`Referral processing completed successfully for user ${userId}`);
      } catch (referralError) {
        console.error(`Error processing referral for user ${userId}:`, referralError);
        // Don't fail the user creation if referral processing fails
        // The user should still be created successfully
      }
    } else {
      console.log(`Creating basic UserSubscription for user ${userId} without referral`);
      
      try {
        // Create UserSubscription record without referral information
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial

        const createBasicUserSubscriptionMutation = `
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

        const userSubscription = await appsyncRequest(createBasicUserSubscriptionMutation, {
          input: {
            owner: userId,
            subscriptionStatus: 'free_trial',
            trialStartDate: trialStartDate.toISOString(),
            trialEndDate: trialEndDate.toISOString(),
            totalFreeMonths: 3,
            earnedFreeMonths: 0,
          }
        });

        console.log(`UserSubscription created successfully for user ${userId}:`, userSubscription);
      } catch (subscriptionError) {
        console.error('Error creating UserSubscription:', subscriptionError);
        throw subscriptionError; // Re-throw this error as it's critical
      }
    }

    return event;
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);
    // Don't fail the signup process, just log the error
    return event;
  }
}; 