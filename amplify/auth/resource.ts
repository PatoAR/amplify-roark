import { defineAuth } from '@aws-amplify/backend';
import { customMessage } from "./custom-message/resource";
import { postConfirmation } from "./post-confirmation/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  triggers: {
    customMessage, // Custom message function as a trigger
    postConfirmation, // Post-confirmation trigger for referral processing
  }
});