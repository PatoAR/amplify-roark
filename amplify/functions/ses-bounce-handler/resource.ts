import { defineFunction } from '@aws-amplify/backend';

export const sesBounceHandler = defineFunction({
  name: 'ses-bounce-handler',
  entry: './handler.ts',
  timeoutSeconds: 60,
  // Assign to data stack to avoid circular dependency (function depends on DynamoDB table)
  resourceGroupName: 'data',
  environment: {
    // Fallback table name for backwards compatibility (if tags missing)
    CONTACT_TABLE_NAME: 'SESCampaignContact',
  },
});

