import { defineFunction } from '@aws-amplify/backend';

export const referralApi = defineFunction({
  name: 'referral-api',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: '${data.awsAppsyncApiEndpoint}',
    APPSYNC_API_KEY: '${data.awsAppsyncApiKey}',
  }
}); 