import { defineFunction, secret } from '@aws-amplify/backend';
import { data } from '../../data/resource';

export const referralApi = defineFunction({
  name: 'referral-api',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: secret('ROARK_APPSYNC_URL'),
    APPSYNC_API_KEY: secret('ROARK_APPSYNC_API_KEY'),
  }
}); 