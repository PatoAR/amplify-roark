import { defineBackend, secret } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { referralProcessor } from './functions/referral-processor/resource';
import { referralApi } from './functions/referral-api/resource';

defineBackend({
  auth,
  data,
  referralProcessor,
  referralApi,
});
