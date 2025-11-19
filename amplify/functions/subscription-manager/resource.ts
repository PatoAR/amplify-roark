import { defineFunction } from '@aws-amplify/backend';

export const subscriptionManager = defineFunction({
  name: 'subscription-manager',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 30,
});

