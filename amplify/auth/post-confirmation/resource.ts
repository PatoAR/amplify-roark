import { defineFunction } from '@aws-amplify/backend';
import { data } from '../../data/resource';

export const postConfirmation = defineFunction({
  name: 'postConfirmation',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: (data as any).url,
    APPSYNC_API_KEY: (data as any).apiKey,
  }
}); 