import { defineFunction } from '@aws-amplify/backend';

export const sessionCleanup = defineFunction({
  name: 'session-cleanup',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 60, // May need more time for large datasets
  schedule: {
    rate: '1 hour',
  },
});


