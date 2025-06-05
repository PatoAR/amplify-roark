import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
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
    .authorization((allow) => [allow.publicApiKey()]),
});


export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
