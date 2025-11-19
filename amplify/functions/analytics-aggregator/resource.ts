import { defineFunction, secret } from '@aws-amplify/backend';

export const analyticsAggregator = defineFunction({
  name: 'analytics-aggregator',
  entry: './handler.ts',
  environment: {
    GRAPHQL_API_URL: secret('GRAPHQL_API_URL'),
    GRAPHQL_API_KEY: secret('GRAPHQL_API_KEY'),
  },
});

