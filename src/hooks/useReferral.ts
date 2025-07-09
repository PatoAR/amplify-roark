import { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { authClient } from '../amplify-client';
import { useActivityTracking } from './useActivityTracking';



interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  earnedMonths: number;
}

export const useReferral = () => {
  const { user } = useAuthenticator();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    successfulReferrals: 0,
    earnedMonths: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { trackReferralActivity } = useActivityTracking();

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

      // Get user's referral code
      const { data: referralCodes } = await authClient.models.ReferralCode.list({
        filter: { owner: { eq: user.userId } }
      });

      if (referralCodes && referralCodes.length > 0) {
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
      
      // Track referral code generation
      trackReferralActivity('generated', referralCode);
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

      // Generate a unique 8-character code
      const code = generateUniqueCode();
      
      // Create the referral code directly in the database
      const result = await authClient.models.ReferralCode.create({
        owner: user.userId,
        code,
        isActive: true,
        totalReferrals: 0,
        successfulReferrals: 0,
      });

      if (result.data) {
        setReferralCode(code);
        await loadReferralData(); // Reload to get updated stats
      } else {
        setError('Failed to generate referral code');
      }
    } catch (err) {
      console.error('Error generating referral code:', err);
      setError('Failed to generate referral code');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate unique code
  const generateUniqueCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const validateReferralCode = async (code: string): Promise<{ valid: boolean; referrerId?: string }> => {
    try {
      const { data: referralCodes } = await authClient.models.ReferralCode.list({
        filter: { 
          code: { eq: code },
          isActive: { eq: true }
        }
      });
      
      if (referralCodes && referralCodes.length > 0) {
        const referralCode = referralCodes[0];
        return {
          valid: true,
          referrerId: referralCode.owner || undefined,
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
    const referralUrl = `${baseUrl}/signup?ref=${referralCode}`;

    try {
      switch (platform) {
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
            `Join Perkins News Service and get 3 months free! Use my referral code: ${referralCode}\n\n${referralUrl}`
          )}`;
          window.open(whatsappUrl, '_blank');
          break;

        case 'email':
          const emailSubject = encodeURIComponent('Join Perkins News Service - 3 Months Free!');
          const emailBody = encodeURIComponent(
            `Hi!\n\nI'm using Perkins News Service and thought you might be interested. It's a great way to stay updated with business news.\n\nYou can get 3 months of free access using my referral code: ${referralCode}\n\nSign up here: ${referralUrl}\n\nBest regards!`
          );
          window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
          break;

        case 'copy':
          await navigator.clipboard.writeText(
            `Join Perkins News Service and get 3 months free! Use my referral code: ${referralCode}\n\n${referralUrl}`
          );
          break;
      }
      
      // Track referral sharing
      trackReferralActivity('shared', referralCode);
    } catch (err) {
      console.error('Error sharing referral link:', err);
      setError('Failed to share referral link');
    }
  };

  const getReferralUrl = (): string => {
    if (!referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralCode}`;
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