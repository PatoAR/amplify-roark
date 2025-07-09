import { defineFunction } from '@aws-amplify/backend';

export const referralProcessor = defineFunction({
  name: 'referral-processor',
  entry: './handler.ts',
}); 