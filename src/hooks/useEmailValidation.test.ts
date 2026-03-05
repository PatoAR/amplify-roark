import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmailValidation } from './useEmailValidation';

const mockGenerateClient = vi.fn();

vi.mock('aws-amplify/api', () => ({
  generateClient: () => mockGenerateClient(),
}));

describe('useEmailValidation', () => {
  beforeEach(() => {
    mockGenerateClient.mockReset();
  });

  it('blocks email when deleted email record exists', async () => {
    mockGenerateClient.mockReturnValue({
      models: {
        DeletedUserEmail: {
          list: vi.fn().mockResolvedValue({
            data: [{ deletedAt: '2025-01-01T00:00:00.000Z' }],
          }),
        },
      },
    });

    const { result } = renderHook(() => useEmailValidation());
    let isAllowed = true;

    await act(async () => {
      isAllowed = await result.current.checkEmail('blocked@example.com');
    });

    expect(isAllowed).toBe(false);
    expect(result.current.isEmailBlocked).toBe(true);
    expect(result.current.blockReason).toContain('deleted');
  });

  it('allows email when no deleted records exist', async () => {
    mockGenerateClient.mockReturnValue({
      models: {
        DeletedUserEmail: {
          list: vi.fn().mockResolvedValue({ data: [] }),
        },
      },
    });

    const { result } = renderHook(() => useEmailValidation());
    let isAllowed = false;

    await act(async () => {
      isAllowed = await result.current.checkEmail('ok@example.com');
    });

    expect(isAllowed).toBe(true);
    expect(result.current.isEmailBlocked).toBe(false);
    expect(result.current.blockReason).toBe('');
  });

  it('fails open on API error', async () => {
    mockGenerateClient.mockReturnValue({
      models: {
        DeletedUserEmail: {
          list: vi.fn().mockRejectedValue(new Error('network')),
        },
      },
    });

    const { result } = renderHook(() => useEmailValidation());
    let isAllowed = false;

    await act(async () => {
      isAllowed = await result.current.checkEmail('ok@example.com');
    });

    expect(isAllowed).toBe(true);
    expect(result.current.isEmailBlocked).toBe(false);
  });
});
