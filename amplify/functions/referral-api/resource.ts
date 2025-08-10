import { defineFunction } from '@aws-amplify/backend';

export const referralApi = defineFunction({
  name: 'referral-api',
  entry: './handler.ts',
}); 