import type { CustomMessageTriggerHandler } from "aws-lambda";
import { buildReferralMessage } from "./referralTranslations";

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === "CustomMessage_SignUp") {
    // Check if this signup came from a referral
    const referralCode = event.request.userAttributes['custom:referralCode'] || '';
    const referrerId = event.request.userAttributes['custom:referrerId'] || '';
    
    // Get user language preference from attributes, default to 'en' if not available
    // Language can be passed via clientMetadata during signup or stored as custom attribute
    const language = event.request.clientMetadata?.language 
      || event.request.userAttributes['custom:language']
      || event.request.userAttributes.locale?.split('-')[0]?.toLowerCase()
      || 'en';
    
    // Ensure language is one of the supported languages
    const supportedLanguages = ['en', 'es', 'pt'];
    const userLanguage = supportedLanguages.includes(language) ? language : 'en';
    
    // Build the referral message with translations
    const { subject, message } = buildReferralMessage(
      referralCode || null,
      event.request.codeParameter || '',
      userLanguage
    );

    event.response.emailSubject = subject;
    event.response.emailMessage = message;
  }
  return event;
};