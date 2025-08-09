import { defineFunction } from '@aws-amplify/backend';
import { data } from '../../data/resource';

export const postConfirmation = defineFunction({
  name: 'postConfirmation',
  entry: './handler.ts',
  // Supply GraphQL API endpoint and API key via environment
  environment: {
    APPSYNC_URL: (data as any).url,
    APPSYNC_API_KEY: (data as any).apiKey,
  }
}); 