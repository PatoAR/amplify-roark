import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GracePeriodExpiredModal } from './GracePeriodExpiredModal';

vi.mock('../../hooks/useSubscriptionManager', () => ({
  useSubscriptionManager: () => ({
    upgradeError: '',
    upgradeSubscription: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

vi.mock('../../hooks/useReferral', () => ({
  useReferral: () => ({
    shareReferralLink: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: '',
  }),
}));

vi.mock('../../hooks/useReferralShareHandlers', () => ({
  useReferralShareHandlers: () => ({
    copied: false,
    shareSuccess: '',
    handleCopyLink: vi.fn(),
    handleShareWhatsApp: vi.fn(),
    handleShareEmail: vi.fn(),
  }),
}));

vi.mock('../../config/features', () => ({
  isSubscriptionUpgradeEnabled: () => false,
}));

vi.mock('../../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('GracePeriodExpiredModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<GracePeriodExpiredModal isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content when open', () => {
    render(<GracePeriodExpiredModal isOpen />);
    expect(screen.getByText('graceExpired.title')).toBeInTheDocument();
    expect(screen.getByText('graceExpired.message')).toBeInTheDocument();
  });
});
