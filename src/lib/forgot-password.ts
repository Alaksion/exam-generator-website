import {
  confirmResetPassword as amplifyConfirmResetPassword,
  resetPassword as amplifyResetPassword,
  type AuthError,
} from 'aws-amplify/auth'
import { ensureConfigured } from './cognito'

export type ForgotPasswordErrorKind =
  | 'invalid_email'
  | 'invalid_code'
  | 'code_expired'
  | 'weak_password'
  | 'too_many_requests'
  | 'unknown'

export class ForgotPasswordError extends Error {
  readonly kind: ForgotPasswordErrorKind

  constructor(kind: ForgotPasswordErrorKind, message: string) {
    super(message)
    this.name = 'ForgotPasswordError'
    this.kind = kind
  }
}

export interface ForgotPasswordService {
  /**
   * Request a one-time reset code by email. Enumeration-constant: resolves the
   * same way whether or not the email has an account, so a caller can show one
   * confirming message either way.
   */
  requestCode(email: string): Promise<void>
  /** Complete the reset with the emailed code and a new password. */
  resetPassword(email: string, code: string, newPassword: string): Promise<void>
}

function toKind(err: unknown): ForgotPasswordErrorKind {
  const code = (err as { name?: string })?.name ?? (err as AuthError)?.name
  switch (code) {
    case 'InvalidParameterException':
      return 'invalid_email'
    case 'CodeMismatchException':
      return 'invalid_code'
    case 'ExpiredCodeException':
      return 'code_expired'
    case 'InvalidPasswordException':
      return 'weak_password'
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return 'too_many_requests'
    default:
      return 'unknown'
  }
}

export function forgotPasswordErrorMessage(kind: ForgotPasswordErrorKind): string {
  switch (kind) {
    case 'invalid_email':
      return 'Please enter a valid email address.'
    case 'invalid_code':
      return 'The reset code you entered is incorrect.'
    case 'code_expired':
      return 'That reset code has expired. Request a new one.'
    case 'weak_password':
      return 'Your new password does not meet the requirements.'
    case 'too_many_requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'unknown':
      return 'Unable to reset your password right now. Please try again.'
  }
}

export const cognitoForgotPasswordService: ForgotPasswordService = {
  async requestCode(email) {
    ensureConfigured()
    try {
      await amplifyResetPassword({ username: email })
    } catch (err) {
      // UserNotFoundException is deliberately swallowed — requesting a code for
      // an unknown email must look identical to one that exists.
      if ((err as { name?: string })?.name === 'UserNotFoundException') return
      const kind = toKind(err)
      if (kind === 'unknown') throw err
      throw new ForgotPasswordError(kind, kind)
    }
  },

  async resetPassword(email, code, newPassword) {
    ensureConfigured()
    try {
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      })
    } catch (err) {
      const kind = toKind(err)
      if (kind === 'unknown') throw err
      throw new ForgotPasswordError(kind, kind)
    }
  },
}