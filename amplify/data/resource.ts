import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { referralApi } from "../functions/referral-api/resource";
import { referralProcessor } from "../functions/referral-processor/resource";
import { subscriptionManager } from "../functions/subscription-manager/resource";

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
      category: a.enum(['NEWS', 'STATISTICS', 'SPONSORED']),
      priorityDuration: a.integer(),
      callToAction: a.string(),
      sponsorLink: a.string(),
      priorityUntil: a.datetime(),
    })
    .authorization(allow => [
      // Allow API keys to create articles for backend ingestion
      allow.publicApiKey().to(['read', 'create']),
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
  .authorization(allow => [
    allow.owner().identityClaim('sub'),
    // Public may read for validation; updates only via trusted functions
    allow.publicApiKey().to(['read', 'update']),
  ]),

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
  .authorization(allow => [
    allow.owner().identityClaim('sub'),
    // Allow backend (via API key) to create referral records during post-confirmation processing
    allow.publicApiKey().to(['create', 'read'])
  ]),

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
  .authorization(allow => [
    allow.owner().identityClaim('sub'),
    // Allow Lambda functions (via API key) to create/update subscriptions during post-confirmation
    allow.publicApiKey().to(['create', 'update', 'read'])
  ]),

  // UserActivity Model - Track user sessions and activity periods
  UserActivity: a
  .model({
    owner: a.string(),
    sessionId: a.string().required(), // Unique session identifier
    startTime: a.datetime().required(),
    endTime: a.datetime(),
    duration: a.integer(), // Duration in seconds
    deviceInfo: a.string(), // Browser, OS, screen size
    userAgent: a.string(),
    ipAddress: a.string(),
    isActive: a.boolean().default(true),
  })
  .authorization(allow => [allow.owner().identityClaim('sub')]),

  // DeletedUserEmail Model - Track deleted account emails to prevent recreation
  DeletedUserEmail: a
  .model({
    email: a.string().required(), // The deleted email address
    deletedAt: a.datetime().required(), // When the account was deleted
    originalUserId: a.string(), // Original user ID for reference
    subscriptionStatus: a.string(), // What subscription they had
    deletionReason: a.string(), // Why they deleted (optional)
  })
  .authorization(allow => [
    // Allow public API key for checking during signup
    allow.publicApiKey().to(['create', 'read']),
    // Allow authenticated users to read their own deletion record
    allow.owner().identityClaim('sub').to(['read'])
  ]),
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
  functions: {
    postConfirmation,
    referralApi,
    referralProcessor,
    subscriptionManager,
  }
});