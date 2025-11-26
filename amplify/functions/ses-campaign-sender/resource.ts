import { defineFunction } from '@aws-amplify/backend';

export const sesCampaignSender = defineFunction({
  name: 'ses-campaign-sender',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 300, // 5 minutes for processing multiple emails
  environment: {
    SENDER_EMAIL: 'info@perkinsintel.com',
    DAILY_SEND_LIMIT: '50',
    COMPANY_SPACING_DAYS: '3',
    // Table names will be set in backend.ts from Amplify data resource
  },
});

