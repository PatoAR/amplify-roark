import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  name: 'postConfirmation',
  entry: './handler.ts',
  environment: {
    APPSYNC_URL: '${data.awsAppsyncApiEndpoint}',
    APPSYNC_API_KEY: '${data.awsAppsyncApiKey}',
  }
}); 