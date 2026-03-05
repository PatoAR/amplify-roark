import { useState, useCallback } from 'react';
import { useTranslation } from '../i18n';

interface UseReferralShareHandlersOptions {
  shareReferralLink: (platform: 'copy' | 'whatsapp' | 'email') => Promise<void>;
}

export function useReferralShareHandlers({ shareReferralLink }: UseReferralShareHandlersOptions) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string>('');

  const handleCopyLink = useCallback(async () => {
    try {
      await shareReferralLink('copy');
      setCopied(true);
      setShareSuccess(t('referral.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error(t('referral.errorCopyLink'), err);
    }
  }, [shareReferralLink, t]);

  const handleShareWhatsApp = useCallback(async () => {
    try {
      await shareReferralLink('whatsapp');
      setShareSuccess(t('referral.openingWhatsApp'));
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error(t('referral.errorWhatsApp'), err);
    }
  }, [shareReferralLink, t]);

  const handleShareEmail = useCallback(async () => {
    try {
      await shareReferralLink('email');
      setShareSuccess(t('referral.openingEmail'));
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error(t('referral.errorEmail'), err);
    }
  }, [shareReferralLink, t]);

  return {
    copied,
    shareSuccess,
    setShareSuccess,
    handleCopyLink,
    handleShareWhatsApp,
    handleShareEmail,
  };
}
