import { defineFunction, secret } from '@aws-amplify/backend';

export const sessionCleanup = defineFunction({
  name: 'session-cleanup',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 60, // May need more time for large datasets
  schedule: {
    rate: '1 hour',
  },
  environment: {
    GRAPHQL_API_URL: secret('GRAPHQL_API_URL'),
    GRAPHQL_API_KEY: secret('GRAPHQL_API_KEY'),
  },
});


