import { defineBackend } from '@aws-amplify/backend';
import { Stack, Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { FunctionUrl, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { createHash } from 'crypto';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { referralProcessor } from './functions/referral-processor/resource';
import { subscriptionManager } from './functions/subscription-manager/resource';
import { sessionCleanup } from './functions/session-cleanup/resource';
import { sesCampaignSender } from './functions/ses-campaign-sender/resource';

export const backend = defineBackend({
  auth,
  data,
  referralProcessor,
  subscriptionManager,
  sessionCleanup,
  sesCampaignSender,
});

// Add EventBridge schedule for session cleanup function
// Access the function resource from the backend
const sessionCleanupFunction = backend.sessionCleanup.resources.lambda;

// Get the stack that contains the function
const functionStack = Stack.of(sessionCleanupFunction);

// Create EventBridge rule that runs every hour
// Use stack name hash in rule name to make it unique per branch/environment
// This prevents conflicts when multiple branches deploy to the same AWS account
// EventBridge rule names are limited to 64 characters
const stackName = functionStack.stackName;
// Create a short hash of the stack name for uniqueness (8 chars is sufficient)
const stackHash = createHash('md5').update(stackName).digest('hex').substring(0, 8);
const ruleName = `session-cleanup-${stackHash}`; // Total: 28 chars, well under 64 limit
const scheduleRule = new Rule(functionStack, 'SessionCleanupSchedule', {
  ruleName: ruleName,
  description: 'Triggers session cleanup Lambda every hour to expire abandoned sessions',
  schedule: Schedule.rate(Duration.hours(1)), // Run every 1 hour
  enabled: true,
});

// Add Lambda function as target
scheduleRule.addTarget(new LambdaFunction(sessionCleanupFunction));

// Add EventBridge schedule for SES campaign sender function
const sesCampaignSenderFunction = backend.sesCampaignSender.resources.lambda;
const sesCampaignSenderStack = Stack.of(sesCampaignSenderFunction);
const sesCampaignSenderStackHash = createHash('md5').update(sesCampaignSenderStack.stackName).digest('hex').substring(0, 8);
const sesCampaignSenderRuleName = `ses-campaign-sender-${sesCampaignSenderStackHash}`;

// Get table names from Amplify data resource
// Amplify Gen 2 provides table names via data.resources.tables
// Table names follow pattern: ModelName-{hash}
try {
  const contactTable = backend.data.resources.tables['SESCampaignContact'];
  const controlTable = backend.data.resources.tables['SESCampaignControl'];
  
  // Update Lambda environment variables with actual table names
  sesCampaignSenderFunction.addEnvironment('CONTACT_TABLE_NAME', contactTable.tableName);
  sesCampaignSenderFunction.addEnvironment('CAMPAIGN_CONTROL_TABLE_NAME', controlTable.tableName);
  
  // GSI name: Amplify generates it as ModelNamePartitionKeySortKey
  // Try to get from table resource, fallback to expected pattern
  const gsi = contactTable.globalSecondaryIndexes?.find((idx: any) => 
    idx.partitionKey?.attributeName === 'Sent_Status' && 
    idx.sortKey?.attributeName === 'Target_Send_Date'
  );
  if (gsi && gsi.indexName) {
    sesCampaignSenderFunction.addEnvironment('CONTACT_TABLE_GSI_NAME', gsi.indexName);
  } else {
    // Fallback to expected naming pattern: ModelName + PartitionKey + SortKey
    sesCampaignSenderFunction.addEnvironment('CONTACT_TABLE_GSI_NAME', 'SESCampaignContactSent_StatusTarget_Send_Date');
  }
} catch (error) {
  // If table access fails, use default names (will work if tables exist with expected names)
  // This fallback ensures the Lambda function can still work even if table resource access fails
  sesCampaignSenderFunction.addEnvironment('CONTACT_TABLE_NAME', 'SESCampaignContact');
  sesCampaignSenderFunction.addEnvironment('CAMPAIGN_CONTROL_TABLE_NAME', 'SESCampaignControl');
  sesCampaignSenderFunction.addEnvironment('CONTACT_TABLE_GSI_NAME', 'SESCampaignContactSent_StatusTarget_Send_Date');
}

const sesCampaignSenderScheduleRule = new Rule(sesCampaignSenderStack, 'SESCampaignSenderSchedule', {
  ruleName: sesCampaignSenderRuleName,
  description: 'Triggers SES campaign sender Lambda hourly during business hours (8 AM - 5 PM Buenos Aires time)',
  schedule: Schedule.cron({
    minute: '0',
    hour: '8-17',
    day: '*',
    month: '*',
    year: '*',
    timeZone: 'America/Argentina/Buenos_Aires',
  }),
  enabled: true,
});

// Add Lambda function as target
sesCampaignSenderScheduleRule.addTarget(new LambdaFunction(sesCampaignSenderFunction));

// Enable Function URL for test email endpoint
const functionUrl = new FunctionUrl(sesCampaignSenderStack, 'SESCampaignSenderFunctionUrl', {
  function: sesCampaignSenderFunction,
  authType: FunctionUrlAuthType.NONE, // Public access for test endpoint
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  },
});
