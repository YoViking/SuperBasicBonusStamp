import { z } from 'zod';
import type { Translations } from '../i18n/translations';

export interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  isStrong: boolean;
}

/**
 * Checks password strength against security criteria:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    isStrong,
  };
}

/**
 * Creates a Zod schema for signing in.
 */
export function createLoginSchema(t: Translations) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t.login.valEmailInvalid)
      .email(t.login.valEmailInvalid),
    password: z
      .string()
      .min(1, t.login.valPasswordRequired),
  });
}

/**
 * Creates a Zod schema for registration requiring a secure password.
 */
export function createRegisterSchema(t: Translations) {
  return z.object({
    storeName: z
      .string()
      .trim()
      .min(2, t.login.valStoreNameRequired),
    email: z
      .string()
      .trim()
      .min(1, t.login.valEmailInvalid)
      .email(t.login.valEmailInvalid),
    password: z
      .string()
      .min(8, t.login.valPasswordMinLength)
      .regex(/[A-Z]/, t.login.valPasswordUppercase)
      .regex(/[a-z]/, t.login.valPasswordLowercase)
      .regex(/[0-9]/, t.login.valPasswordNumber),
  });
}

/**
 * Creates a Zod schema for 6-digit OTP code verification.
 */
export function createOtpSchema(t: Translations) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t.login.valEmailInvalid)
      .email(t.login.valEmailInvalid),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, t.login.valOtpInvalid),
  });
}

export type LoginErrors = Partial<Record<'email' | 'password', string>>;
export type RegisterErrors = Partial<Record<'storeName' | 'email' | 'password', string>>;
export type OtpErrors = Partial<Record<'email' | 'otp', string>>;

/**
 * Validates login inputs with Zod.
 */
export function validateLogin(
  values: { email: string; password: string },
  t: Translations
): { success: true; data: { email: string; password: string } } | { success: false; errors: LoginErrors } {
  const schema = createLoginSchema(t);
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: LoginErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof LoginErrors;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}

/**
 * Validates registration inputs with Zod including strong password requirements.
 */
export function validateRegister(
  values: { storeName: string; email: string; password: string },
  t: Translations
): { success: true; data: { storeName: string; email: string; password: string } } | { success: false; errors: RegisterErrors } {
  const schema = createRegisterSchema(t);
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: RegisterErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RegisterErrors;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}

/**
 * Validates OTP code inputs with Zod.
 */
export function validateOtp(
  values: { email: string; otp: string },
  t: Translations
): { success: true; data: { email: string; otp: string } } | { success: false; errors: OtpErrors } {
  const schema = createOtpSchema(t);
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: OtpErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof OtpErrors;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}
