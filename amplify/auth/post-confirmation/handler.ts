import { PostConfirmationTriggerHandler } from 'aws-lambda';

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

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('Post-confirmation trigger:', JSON.stringify(event, null, 2));

  try {
    const { userAttributes } = event.request;
    const userId = event.request.userAttributes.sub;
    const userEmail = userAttributes.email;

    // Check if email was previously deleted (additional safeguard)
    try {
      const checkDeletedEmailQuery = `
        query ListDeletedUserEmails($filter: ModelDeletedUserEmailFilterInput) {
          listDeletedUserEmails(filter: $filter) {
            items {
              id
              email
              deletedAt
              deletionReason
            }
          }
        }
      `;

      const deletedEmails = await appsyncRequest(checkDeletedEmailQuery, {
        filter: { email: { eq: userEmail } }
      });

      if (deletedEmails.listDeletedUserEmails.items.length > 0) {
        console.warn(`User ${userId} attempted to recreate account with previously deleted email: ${userEmail}`);
        // Note: We don't block here as the account is already created
        // This is just for logging and monitoring purposes
        // The main prevention happens during signup in the frontend
      }
    } catch (deletedEmailCheckError) {
      console.warn('Error checking deleted email history:', deletedEmailCheckError);
      // Don't fail the process if this check fails
    }

    // Check if user signed up with a referral code
    const referralCode = userAttributes['custom:referralCode'] || event.request.clientMetadata?.referralCode;
    const referrerId = userAttributes['custom:referrerId'] || event.request.clientMetadata?.referrerId;

    console.log('User signup details:', {
      referralCode,
      referrerId,
      hasReferralCode: !!referralCode,
      hasReferrerId: !!referrerId,
      allUserAttributes: userAttributes
    });

    if (referralCode) {
      let finalReferrerId: string | null = referrerId ?? null;
      
      // If we don't have a referrerId, try to find it from the referral code
      if (!referrerId || referrerId === 'pending') {
        console.log('Looking up referrerId for referral code:', referralCode);
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

          const referralCodes = await appsyncRequest(listReferralCodesQuery, {
            filter: { code: { eq: referralCode }, isActive: { eq: true } }
          });

          if (referralCodes.listReferralCodes.items.length > 0) {
            const referralCodeRecord = referralCodes.listReferralCodes.items[0];
            finalReferrerId = referralCodeRecord.owner;
            console.log('Found referrerId:', finalReferrerId, 'for referral code:', referralCode);
          } else {
            console.warn(`Referral code not found or inactive: ${referralCode}`);
            finalReferrerId = null;
          }
        } catch (lookupError) {
          console.error(`Error looking up referrerId for referral code ${referralCode}:`, lookupError);
          finalReferrerId = null;
        }
      }

      if (finalReferrerId) {
        console.log('Processing referral:', {
          code: referralCode,
          referrerId: finalReferrerId,
          userId: userId
        });

        try {
          // Create UserSubscription record with referral information
          const trialStartDate = new Date();
          const trialEndDate = new Date();
          trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial

          console.log('Creating UserSubscription for user', userId, 'with referral info');
          
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
              referrerId: finalReferrerId,
            }
          });
          console.log('UserSubscription created:', userSubscription);

          // Create referral record
          console.log('Creating Referral record for referrer');
          
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
              referrerId: finalReferrerId,
              referredId: userId,
              referralCode,
              status: 'completed',
              completedAt: new Date().toISOString(),
              freeMonthsEarned: 3,
            }
          });
          console.log('Referral created:', referral);

          // Update referral code stats
          console.log('Updating referral code stats');
          
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
                successfulReferrals: (referralCodeRecord.successfulReferrals || 0) + 1,
              }
            });
            console.log('ReferralCode updated:', updatedCode);
          } else {
            console.warn(`ReferralCode not found for code: ${referralCode}`);
          }

          // Extend referrer's subscription
          console.log('Extending referrer\'s subscription');
          
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
            filter: { owner: { eq: finalReferrerId } }
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
            console.log('Referrer subscription updated:', updatedSubscription);
          } else {
            console.warn(`Referrer subscription not found for user: ${finalReferrerId}`);
          }

          console.log('Referral processing completed successfully');
        } catch (referralError) {
          console.error('Error processing referral for user', userId, ':', referralError);
          // Don't fail the user creation if referral processing fails
          // The user should still be created successfully
        }
      } else {
        console.log('No valid referrerId found, creating basic UserSubscription');
        await createBasicUserSubscription(userId);
      }
    } else {
      console.log('No referral code, creating basic UserSubscription');
      await createBasicUserSubscription(userId);
    }

    return event;
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);
    // Don't fail the signup process, just log the error
    return event;
  }
};

async function createBasicUserSubscription(userId: string): Promise<void> {
  try {
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

    console.log('Basic UserSubscription created for user:', userId, userSubscription);
  } catch (subscriptionError) {
    console.error('Error creating UserSubscription for user:', userId, subscriptionError);
    throw subscriptionError; // Re-throw this error as it's critical
  }
} 