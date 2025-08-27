import { useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';

interface EmailValidationResult {
  isEmailBlocked: boolean;
  blockReason?: string;
  checkEmail: (email: string) => Promise<boolean>;
}

export const useEmailValidation = (): EmailValidationResult => {
  const [isEmailBlocked, setIsEmailBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');

  const checkEmail = useCallback(async (email: string): Promise<boolean> => {
    if (!email) return true; // Allow empty email (will be validated elsewhere)

    try {
      const client = generateClient<Schema>();
      
      // Check if email was previously deleted
      const { data: deletedEmails } = await client.models.DeletedUserEmail.list({
        filter: { email: { eq: email.toLowerCase() } }
      });

      if (deletedEmails && deletedEmails.length > 0) {
        const deletedEmail = deletedEmails[0];
        setIsEmailBlocked(true);
        setBlockReason(`This email was previously used for an account that was deleted on ${new Date(deletedEmail.deletedAt).toLocaleDateString()}. For security reasons, deleted emails cannot be reused.`);
        return false; // Email is blocked
      }

      // Email is not blocked
      setIsEmailBlocked(false);
      setBlockReason('');
      return true; // Email is allowed
    } catch (error) {
      console.error('Error checking email:', error);
      // On error, allow the email (fail open for better UX)
      setIsEmailBlocked(false);
      setBlockReason('');
      return true;
    }
  }, []);

  return {
    isEmailBlocked,
    blockReason,
    checkEmail
  };
};
