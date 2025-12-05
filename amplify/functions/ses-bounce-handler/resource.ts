import { defineFunction } from '@aws-amplify/backend';

export const sesBounceHandler = defineFunction({
  name: 'ses-bounce-handler',
  entry: './handler.ts',
  timeoutSeconds: 60,
  // No hardcoded environment variables - table name comes from email tags
  environment: {
    // Fallback table name for backwards compatibility (if tags missing)
    CONTACT_TABLE_NAME: 'SESCampaignContact',
  },
});

