import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeaderNav from './HeaderNav';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'user@example.com' }),
}));

vi.mock('../../context/SessionContext', () => ({
  useSession: () => ({
    logout: vi.fn(),
    userId: 'user-1',
  }),
}));

vi.mock('../../context/UserPreferencesContext', () => ({
  useUserPreferences: () => ({
    preferences: { industries: [], countries: [] },
    savePreferences: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../../hooks/useFreeDaysRemaining', () => ({
  useFreeDaysRemaining: () => ({ daysLeft: 7 }),
}));

vi.mock('../../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../LanguageSwitcher/LanguageSwitcher', () => ({
  default: () => <div>language-switcher</div>,
}));

vi.mock('./Modal', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('HeaderNav', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('navigates to referral settings when invite icon is clicked', () => {
    render(<HeaderNav />);

    fireEvent.click(screen.getByTitle('menu.inviteFriends'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings/referral');
  });
});
