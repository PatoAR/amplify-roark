import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Article Model
  Article: a
  .model({
    timestamp: a.datetime(),
    source: a.string().required(),
    title: a.string().required(),
    industry: a.string(),
    summary: a.string(),
    link: a.string(),
    companies: a.string(),
    countries: a.string(),
    language: a.string(),
    ttl: a.integer(),
  })
  .authorization((allow) => [
    allow.publicApiKey(),
    allow.authenticated(),
  ]),

  // UserProfile Model
  UserProfile: a
  .model({
    owner: a.string(),
    industryPreferences: a.string().array(), // An array of strings for industry IDs
    countryPreferences: a.string().array(), // An array of strings for country IDs
  })
  .authorization(allow => [allow.owner().identityClaim('sub')]),

  // ReferralCode Model - Unique codes for each user
  ReferralCode: a
  .model({
    owner: a.string(),
    code: a.string().required(), // Unique referral code
    isActive: a.boolean().default(true),
    totalReferrals: a.integer().default(0),
    successfulReferrals: a.integer().default(0),
  })
  .authorization(allow => [allow.owner().identityClaim('sub')]),

  // Referral Model - Track successful referrals
  Referral: a
  .model({
    referrerId: a.string().required(), // User ID of the person who referred
    referredId: a.string().required(), // User ID of the person who was referred
    referralCode: a.string().required(), // The code that was used
    status: a.enum(['pending', 'completed', 'expired']),
    completedAt: a.datetime(),
    freeMonthsEarned: a.integer().default(3), // Months earned by referrer
  })
  .authorization(allow => [allow.owner().identityClaim('sub')]),

  // UserSubscription Model - Track subscription status and free trial
  UserSubscription: a
  .model({
    owner: a.string(),
    subscriptionStatus: a.enum(['free_trial', 'active', 'expired', 'cancelled']),
    trialStartDate: a.datetime(),
    trialEndDate: a.datetime(),
    totalFreeMonths: a.integer().default(3), // Initial 3 months
    earnedFreeMonths: a.integer().default(0), // Additional months from referrals
    referralCodeUsed: a.string(), // Code used during signup
    referrerId: a.string(), // ID of user who referred this user
  })
  .authorization(allow => [allow.owner().identityClaim('sub')]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
