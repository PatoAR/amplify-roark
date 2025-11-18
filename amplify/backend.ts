import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { referralProcessor } from './functions/referral-processor/resource';
import { referralApi } from './functions/referral-api/resource';
import { subscriptionManager } from './functions/subscription-manager/resource';
import { analyticsAggregator } from './functions/analytics-aggregator/resource';

defineBackend({
  auth,
  data,
  referralProcessor,
  referralApi,
  subscriptionManager,
  analyticsAggregator,
});
