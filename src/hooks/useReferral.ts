import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';
import { listReferralCodes } from '../graphql/queries';
import { useTranslation } from '../i18n';
import { createReferralCode } from '../graphql/mutations';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  earnedMonths: number;
}

export const useReferral = () => {
  const { user } = useAuthenticator();
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    successfulReferrals: 0,
    earnedMonths: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  // Remove activity tracking to reduce AWS resource consumption
  // const { trackReferralActivity } = useSession();
  const clientRef = useRef<ReturnType<typeof generateClient<Schema>> | null>(null);

  // Initialize client when needed
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = generateClient<Schema>();
    }
    return clientRef.current;
  }, []);

  // Load user's referral code and stats
  useEffect(() => {
    if (user?.userId) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user?.userId) return;

    try {
      setIsLoading(true);
      setError('');

      const client = getClient();
      const result = await client.graphql({
        query: listReferralCodes,
        variables: { filter: { owner: { eq: user.userId } } }
      }) as any;
      const referralCodes = result.data?.listReferralCodes?.items || [];

      if (referralCodes.length > 0) {
        const code = referralCodes[0];
        setReferralCode(code.code);
        setReferralStats({
          totalReferrals: code.totalReferrals || 0,
          successfulReferrals: code.successfulReferrals || 0,
          earnedMonths: (code.successfulReferrals || 0) * 3,
        });
      } else {
        // Generate new referral code if none exists
        await generateReferralCode();
      }
      // Only track generation when a new code is actually created
    } catch (err) {
      console.error('Error loading referral data:', err);
      setError('Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async () => {
    if (!user?.userId) return;

    try {
      setIsLoading(true);
      setError('');
      const client = getClient();
      // Generate a random 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const input = {
        owner: user.userId,
        code,
        isActive: true,
        totalReferrals: 0,
        successfulReferrals: 0,
      };
      await client.graphql({
        query: createReferralCode,
        variables: { input },
      });
      setReferralCode(code);
      setReferralStats({ totalReferrals: 0, successfulReferrals: 0, earnedMonths: 0 });
    } catch (err) {
      console.error('Error generating referral code:', err);
      setError('Failed to generate referral code');
    } finally {
      setIsLoading(false);
    }
  };

  const validateReferralCode = async (code: string): Promise<{ valid: boolean; referrerId?: string }> => {
    try {
      // Use the API endpoint instead of direct GraphQL to avoid authorization issues
      const response = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Validation request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.valid) {
        return {
          valid: true,
          referrerId: result.referrerId,
        };
      } else {
        return { valid: false };
      }
    } catch (err) {
      console.error('Error validating referral code:', err);
      return { valid: false };
    }
  };

  const shareReferralLink = async (platform: 'whatsapp' | 'email' | 'copy') => {
    if (!referralCode) {
      setError('No referral code available');
      return;
    }

    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/?ref=${referralCode}`;

    try {
      switch (platform) {
        case 'whatsapp':
          const message = t('referral.shareMessage').replace('{link}', referralUrl);
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          break;

        case 'email':
          const emailSubject = encodeURIComponent(t('referral.emailSubject'));
          const emailBody = encodeURIComponent(
            t('referral.emailBody').replace('{code}', referralCode).replace('{link}', referralUrl)
          );
          window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
          break;

        case 'copy':
          await navigator.clipboard.writeText(referralUrl);
          break;
      }
      // Remove referral activity tracking to reduce AWS resource consumption
      // trackReferralActivity('shared', referralCode);
    } catch (err) {
      console.error('Error sharing referral link:', err);
      setError('Failed to share referral link');
    }
  };

  const getReferralUrl = (): string => {
    if (!referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/?ref=${referralCode}`;
  };

  return {
    referralCode,
    referralStats,
    isLoading,
    error,
    generateReferralCode,
    validateReferralCode,
    shareReferralLink,
    getReferralUrl,
    refreshData: loadReferralData,
  };
}; 