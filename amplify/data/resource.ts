import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { referralApi } from "../functions/referral-api/resource";
import { referralProcessor } from "../functions/referral-processor/resource";

const schema = a.schema({
  // Article Model
  Article: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      author: a.string(),
      publishedAt: a.datetime(),
      category: a.string(),
      tags: a.list(a.string()),
      imageUrl: a.string(),
      summary: a.string(),
      readTime: a.integer(),
      isPublished: a.boolean().default(true),
      viewCount: a.integer().default(0),
      likeCount: a.integer().default(0),
      shareCount: a.integer().default(0),
    })
    .authorization(allow => [
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
      email: a.string().required(),
      deletedAt: a.datetime().required(),
      reason: a.string(),
    })
    .authorization(allow => [
      allow.publicApiKey().to(['create', 'read'])
    ]),

  // User Model - Store user preferences and settings
  User: a
    .model({
      email: a.string().required(),
      username: a.string(),
      firstName: a.string(),
      lastName: a.string(),
      avatar: a.string(),
      preferences: a.string(), // JSON string with user preferences
      settings: a.string(), // JSON string with user settings
      lastLoginAt: a.datetime(),
      isActive: a.boolean().default(true),
      subscriptionStatus: a.string(),
      subscriptionExpiresAt: a.datetime(),
      referralCode: a.string(),
      referredBy: a.string(),
      freeDaysRemaining: a.integer().default(30),
    })
    .authorization(allow => [allow.owner().identityClaim('sub')]),

  // UserSubscription Model - Track subscription history
  UserSubscription: a
    .model({
      owner: a.string(),
      userId: a.string().required(),
      subscriptionType: a.string().required(),
      status: a.string().required(),
      startDate: a.datetime().required(),
      endDate: a.datetime(),
      amount: a.float(),
      currency: a.string(),
      paymentMethod: a.string(),
      autoRenew: a.boolean().default(false),
      cancelledAt: a.datetime(),
      cancellationReason: a.string(),
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
  functions: {
    postConfirmation,
    referralApi,
    referralProcessor,
  }
});
