import { defineFunction, secret } from '@aws-amplify/backend';

export const referralProcessor = defineFunction({
  name: 'referral-processor',
  entry: './handler.ts',
  resourceGroupName: 'data', // Assign to data stack since it uses GraphQL API
  environment: {
    GRAPHQL_API_URL: secret('GRAPHQL_API_URL'),
    GRAPHQL_API_KEY: secret('GRAPHQL_API_KEY'),
  },
}); 