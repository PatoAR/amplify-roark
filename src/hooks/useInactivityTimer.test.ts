import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInactivityTimer } from './useInactivityTimer';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useInactivityTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('logs out and navigates after timeout when enabled', async () => {
    const onLogout = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useInactivityTimer({
        timeoutInMinutes: 0.001, // 60ms
        enabled: true,
        onLogout,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(localStorage.getItem('inactivity-logout')).toBe('true');
    expect(onLogout).toHaveBeenCalledWith(true);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('does not schedule logout when disabled', async () => {
    const onLogout = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useInactivityTimer({
        timeoutInMinutes: 0.001,
        enabled: false,
        onLogout,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(onLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('inactivity-logout')).toBeNull();
  });
});
