import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReferral } from './useReferral';

const mockGraphql = vi.fn();
const mockGenerateClient = vi.fn(() => ({ graphql: mockGraphql }));
let mockAuthUser: { userId: string } | undefined = { userId: 'user-1' };

vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: () => ({ user: mockAuthUser }),
}));

vi.mock('aws-amplify/api', () => ({
  generateClient: () => mockGenerateClient(),
}));

vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'referral.shareMessage') return 'Share {link}';
      if (key === 'referral.emailSubject') return 'Invite';
      if (key === 'referral.emailBody') return 'Use {code} at {link}';
      return key;
    },
  }),
}));

describe('useReferral', () => {
  beforeEach(() => {
    mockGraphql.mockReset();
    mockGenerateClient.mockClear();
    mockAuthUser = { userId: 'user-1' };
    vi.stubGlobal('open', vi.fn());
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('loads referral code and shares copy link', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        listReferralCodes: {
          items: [{ code: 'ABC12345', totalReferrals: 2, successfulReferrals: 1 }],
        },
      },
    });

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.referralCode).toBe('ABC12345');
    });

    await act(async () => {
      await result.current.shareReferralLink('copy');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${window.location.origin}/?ref=ABC12345`
    );
  });

  it('sets error when sharing without referral code', async () => {
    mockAuthUser = undefined;

    const { result } = renderHook(() => useReferral());

    await act(async () => {
      await result.current.shareReferralLink('copy');
    });

    expect(result.current.error).toBe('No referral code available');
  });
});
