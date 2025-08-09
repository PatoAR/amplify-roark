import { defineFunction, secret } from '@aws-amplify/backend';
import { data } from '../../data/resource';

export const postConfirmation = defineFunction({
  name: 'postConfirmation',
  entry: './handler.ts',
  // Prefer Amplify secrets for runtime SSM resolution and IAM grants
  environment: {
    APPSYNC_URL: secret('ROARK_APPSYNC_URL'),
    APPSYNC_API_KEY: secret('ROARK_APPSYNC_API_KEY'),
  }
}); 