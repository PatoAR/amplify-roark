import { defineFunction, secret } from '@aws-amplify/backend';
import { data } from '../../data/resource';

export const referralProcessor = defineFunction({
  name: 'referral-processor',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: secret('ROARK_APPSYNC_URL'),
    APPSYNC_API_KEY: secret('ROARK_APPSYNC_API_KEY'),
  }
}); 