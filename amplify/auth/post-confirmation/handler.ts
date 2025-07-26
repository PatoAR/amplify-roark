import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../data/resource';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('Post-confirmation trigger:', JSON.stringify(event, null, 2));

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
        const userSubscription = await generateClient<Schema>().models.UserSubscription.create({
          owner: userId,
          subscriptionStatus: 'free_trial',
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          totalFreeMonths: 3,
          earnedFreeMonths: 0,
          referralCodeUsed: referralCode,
          referrerId: referrerId,
        });
        console.log(`UserSubscription created successfully:`, userSubscription);

        // Process the referral to give the referrer their bonus
        console.log(`Creating Referral record for referrer ${referrerId}`);
        const referral = await generateClient<Schema>().models.Referral.create({
          referrerId,
          referredId: userId,
          referralCode,
          status: 'completed',
          completedAt: new Date().toISOString(),
          freeMonthsEarned: 3,
        });
        console.log(`Referral created successfully:`, referral);

        // Update referral code stats
        console.log(`Updating referral code stats for code ${referralCode}`);
        const referralCodes = await generateClient<Schema>().models.ReferralCode.list({
          filter: { code: { eq: referralCode } }
        });

        if (referralCodes.data.length > 0) {
          const referralCodeRecord = referralCodes.data[0];
          const updatedCode = await generateClient<Schema>().models.ReferralCode.update({
            id: referralCodeRecord.id,
            totalReferrals: (referralCodeRecord.totalReferrals || 0) + 1,
            successfulReferrals: (referralCodeRecord.successfulReferrals || 0) + 1,
          });
          console.log(`ReferralCode updated successfully:`, updatedCode);
        } else {
          console.warn(`ReferralCode not found for code: ${referralCode}`);
        }

        // Extend referrer's subscription
        console.log(`Extending referrer's subscription for user ${referrerId}`);
        const referrerSubscriptions = await generateClient<Schema>().models.UserSubscription.list({
          filter: { owner: { eq: referrerId } }
        });

        if (referrerSubscriptions.data.length > 0) {
          const referrerSubscription = referrerSubscriptions.data[0];
          const currentEarnedMonths = referrerSubscription.earnedFreeMonths || 0;
          const newEarnedMonths = currentEarnedMonths + 3;

          // Recalculate trial end date
          const trialStartDate = new Date(referrerSubscription.trialStartDate || new Date());
          const newTrialEndDate = new Date(trialStartDate);
          newTrialEndDate.setMonth(newTrialEndDate.getMonth() + (referrerSubscription.totalFreeMonths || 3) + newEarnedMonths);

          const updatedSubscription = await generateClient<Schema>().models.UserSubscription.update({
            id: referrerSubscription.id,
            earnedFreeMonths: newEarnedMonths,
            trialEndDate: newTrialEndDate.toISOString(),
          });
          console.log(`Referrer subscription updated successfully:`, updatedSubscription);
        } else {
          console.warn(`Referrer subscription not found for user: ${referrerId}`);
        }

        console.log(`Referral processed successfully for user ${userId}`);
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
        // Continue with basic UserSubscription creation even if referral processing fails
      }
    } else {
      console.log(`Creating basic UserSubscription for user ${userId} without referral`);
      
      try {
        // Create UserSubscription record without referral information
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial

        const userSubscription = await generateClient<Schema>().models.UserSubscription.create({
          owner: userId,
          subscriptionStatus: 'free_trial',
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          totalFreeMonths: 3,
          earnedFreeMonths: 0,
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