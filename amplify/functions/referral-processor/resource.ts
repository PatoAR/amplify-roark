import { defineFunction } from '@aws-amplify/backend';

export const referralProcessor = defineFunction({
  name: 'referral-processor',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: '${data.awsAppsyncApiEndpoint}',
    APPSYNC_API_KEY: '${data.awsAppsyncApiKey}',
  }
}); 