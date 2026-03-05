import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateUserAttributes } from './auth';

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user+tag@example.co.uk')).toBe(true);
    expect(validateEmail('a@b.c')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@no-local.com')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a short password', () => {
    const result = validatePassword('Ab1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  it('requires an uppercase letter', () => {
    const result = validatePassword('lowercase1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('requires a lowercase letter', () => {
    const result = validatePassword('UPPERCASE1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('requires a digit', () => {
    const result = validatePassword('NoDigits!A');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('requires a special character', () => {
    const result = validatePassword('NoSpecial1A');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character');
  });

  it('returns multiple errors for a very weak password', () => {
    const result = validatePassword('ab');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('validateUserAttributes', () => {
  it('accepts valid user attributes with email', () => {
    expect(validateUserAttributes({ email: 'user@example.com' })).toBe(true);
  });

  it('accepts valid user attributes with optional referral fields', () => {
    expect(
      validateUserAttributes({
        email: 'user@example.com',
        'custom:referralCode': 'ABC123',
        'custom:referrerId': 'user-id',
      })
    ).toBe(true);
  });

  it('rejects null', () => {
    expect(validateUserAttributes(null)).toBe(false);
  });

  it('rejects non-object', () => {
    expect(validateUserAttributes('string')).toBe(false);
    expect(validateUserAttributes(42)).toBe(false);
  });

  it('rejects missing email', () => {
    expect(validateUserAttributes({})).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(validateUserAttributes({ email: 'not-valid' })).toBe(false);
  });

  it('rejects non-string referralCode', () => {
    expect(
      validateUserAttributes({ email: 'user@example.com', 'custom:referralCode': 123 })
    ).toBe(false);
  });

  it('rejects non-string referrerId', () => {
    expect(
      validateUserAttributes({ email: 'user@example.com', 'custom:referrerId': true })
    ).toBe(false);
  });
});
