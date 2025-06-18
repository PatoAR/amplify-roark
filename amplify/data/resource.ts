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
    ttl: a.integer(),
  })
  .authorization((allow) => [
    allow.publicApiKey(),
    allow.authenticated(),
  ]),

  // UserProfile Model
  UserProfile: a
  .model({
    industryPreferences: a.string().array(), // An array of strings for industry IDs
    countryPreferences: a.string().array(), // An array of strings for country IDs
  })
  .authorization(allow => [allow.owner()]),
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
