import { defineFunction } from '@aws-amplify/backend';
import { data } from '../../data/resource';

export const referralApi = defineFunction({
  name: 'referral-api',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: (data as any).url,
    APPSYNC_API_KEY: (data as any).apiKey,
  }
}); 