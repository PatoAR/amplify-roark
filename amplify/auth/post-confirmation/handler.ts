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

    if (referralCode && referrerId) {
      console.log(`Processing referral: code=${referralCode}, referrerId=${referrerId}, userId=${userId}`);

      // Create UserSubscription record with referral information
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial

      await generateClient<Schema>().models.UserSubscription.create({
        owner: userId,
        subscriptionStatus: 'free_trial',
        trialStartDate: trialStartDate.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        totalFreeMonths: 3,
        earnedFreeMonths: 0,
        referralCodeUsed: referralCode,
        referrerId: referrerId,
      });

      // Process the referral to give the referrer their bonus
      await generateClient<Schema>().models.Referral.create({
        referrerId,
        referredId: userId,
        referralCode,
        status: 'completed',
        completedAt: new Date().toISOString(),
        freeMonthsEarned: 3,
      });

      // Update referral code stats
      const referralCodes = await generateClient<Schema>().models.ReferralCode.list({
        filter: { code: { eq: referralCode } }
      });

      if (referralCodes.data.length > 0) {
        const referralCodeRecord = referralCodes.data[0];
        await generateClient<Schema>().models.ReferralCode.update({
          id: referralCodeRecord.id,
          totalReferrals: (referralCodeRecord.totalReferrals || 0) + 1,
          successfulReferrals: (referralCodeRecord.successfulReferrals || 0) + 1,
        });
      }

      // Extend referrer's subscription
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

        await generateClient<Schema>().models.UserSubscription.update({
          id: referrerSubscription.id,
          earnedFreeMonths: newEarnedMonths,
          trialEndDate: newTrialEndDate.toISOString(),
        });
      }

      console.log(`Referral processed successfully for user ${userId}`);
    } else {
      // Create UserSubscription record without referral information
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3 months free trial

      await generateClient<Schema>().models.UserSubscription.create({
        owner: userId,
        subscriptionStatus: 'free_trial',
        trialStartDate: trialStartDate.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        totalFreeMonths: 3,
        earnedFreeMonths: 0,
      });

      console.log(`UserSubscription created for user ${userId} without referral`);
    }

    return event;
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);
    // Don't fail the signup process, just log the error
    return event;
  }
}; 