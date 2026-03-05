import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomSignUp from './CustomSignUp';

const mockSignUp = vi.fn();
const mockCheckEmail = vi.fn();

vi.mock('/PerkinsLogo_Base_Transp.png', () => ({
  default: 'logo.png',
}));

vi.mock('aws-amplify/auth', () => ({
  signUp: (...args: unknown[]) => mockSignUp(...args),
  confirmSignUp: vi.fn(),
  resendSignUpCode: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock('../../hooks/useEmailValidation', () => ({
  useEmailValidation: () => ({
    isEmailBlocked: false,
    blockReason: '',
    checkEmail: mockCheckEmail,
  }),
}));

vi.mock('../../i18n', () => ({
  useTranslation: () => ({
    currentLanguage: 'en',
    t: (key: string) => key,
  }),
}));

describe('CustomSignUp', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
    mockCheckEmail.mockReset();
    mockCheckEmail.mockResolvedValue(true);
  });

  it('shows validation error for weak password and does not call signUp', async () => {
    render(
      <MemoryRouter>
        <CustomSignUp />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('signup.email'), {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(screen.getByLabelText('signup.password'), {
      target: { value: 'weak' },
    });
    fireEvent.change(screen.getByLabelText('signup.confirmPassword'), {
      target: { value: 'weak' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'signup.createAccount' }));

    expect(await screen.findByText(/password\.requirements/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
