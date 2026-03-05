import { describe, it, expect } from 'vitest';
import { createError, isApiError, isAuthError, isNetworkError } from './errors';

describe('createError', () => {
  it('creates an error with all fields', () => {
    const err = createError('Something failed', 'ERR_CODE', 500, { key: 'val' });
    expect(err.message).toBe('Something failed');
    expect(err.code).toBe('ERR_CODE');
    expect(err.statusCode).toBe(500);
    expect(err.details).toEqual({ key: 'val' });
  });

  it('creates an error with only message', () => {
    const err = createError('Minimal error');
    expect(err.message).toBe('Minimal error');
    expect(err.code).toBeUndefined();
    expect(err.statusCode).toBeUndefined();
    expect(err.details).toBeUndefined();
  });
});

describe('isApiError', () => {
  it('returns true for objects with a message property', () => {
    expect(isApiError({ message: 'hello' })).toBe(true);
    expect(isApiError({ message: 'err', code: 'X' })).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError('string')).toBe(false);
    expect(isApiError(42)).toBe(false);
  });

  it('returns false for objects without message', () => {
    expect(isApiError({ code: 'X' })).toBe(false);
    expect(isApiError({})).toBe(false);
  });
});

describe('isAuthError', () => {
  it('returns true for auth-shaped errors', () => {
    expect(isAuthError({ message: 'bad creds', code: 'INVALID_CREDENTIALS' })).toBe(true);
  });

  it('returns false for plain ApiErrors without code', () => {
    expect(isAuthError({ message: 'no code' })).toBe(false);
  });
});

describe('isNetworkError', () => {
  it('returns true for network-shaped errors', () => {
    expect(isNetworkError({ message: 'timeout', code: 'TIMEOUT' })).toBe(true);
  });

  it('returns false for non-network errors', () => {
    expect(isNetworkError({ message: 'not network' })).toBe(false);
  });
});
