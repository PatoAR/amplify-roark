import { defineFunction } from '@aws-amplify/backend';

export const referralApi = defineFunction({
  name: 'referral-api',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: '${data.url}',
    APPSYNC_API_KEY: '${data.api_key}',
  },
}); 