import { defineFunction } from '@aws-amplify/backend';
import { data } from '../../data/resource';

export const referralProcessor = defineFunction({
  name: 'referral-processor',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: (data as any).awsAppsyncApiEndpoint,
    APPSYNC_API_KEY: (data as any).awsAppsyncApiKey,
  }
}); 