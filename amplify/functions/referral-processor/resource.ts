import { defineFunction } from '@aws-amplify/backend';

export const referralProcessor = defineFunction({
  name: 'referral-processor',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: '${data.url}',
    APPSYNC_API_KEY: '${data.api_key}',
  },
}); 