// amplify/auth/custom-message/resource.ts
import { defineFunction } from '@aws-amplify/backend';

export const customMessage = defineFunction({
  name: "custom-message",
  resourceGroupName: 'auth'
});