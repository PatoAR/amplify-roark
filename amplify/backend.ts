import { defineBackend } from '@aws-amplify/backend';
import { Stack, Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { referralProcessor } from './functions/referral-processor/resource';
import { subscriptionManager } from './functions/subscription-manager/resource';
import { sessionCleanup } from './functions/session-cleanup/resource';

export const backend = defineBackend({
  auth,
  data,
  referralProcessor,
  subscriptionManager,
  sessionCleanup,
});

// Add EventBridge schedule for session cleanup function
// Access the function resource from the backend
const sessionCleanupFunction = backend.sessionCleanup.resources.lambda;

// Get the stack that contains the function
const functionStack = Stack.of(sessionCleanupFunction);

// Create EventBridge rule that runs every hour
const scheduleRule = new Rule(functionStack, 'SessionCleanupSchedule', {
  ruleName: 'session-cleanup-schedule',
  description: 'Triggers session cleanup Lambda every hour to expire abandoned sessions',
  schedule: Schedule.rate(Duration.hours(1)), // Run every 1 hour
  enabled: true,
});

// Add Lambda function as target
scheduleRule.addTarget(new LambdaFunction(sessionCleanupFunction));
