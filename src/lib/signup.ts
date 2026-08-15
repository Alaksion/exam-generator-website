import {
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  signUp as amplifySignUp,
  type AuthError,
} from 'aws-amplify/auth'
import { ensureConfigured } from './cognito'

export type SignUpErrorKind =
  | 'email_in_use'
  | 'invalid_email'
  | 'weak_password'
  | 'code_mismatch'
  | 'code_expired'
  | 'too_many_requests'
  | 'unknown'

export class SignUpError extends Error {
  readonly kind: SignUpErrorKind

  constructor(kind: SignUpErrorKind, message: string) {
    super(message)
    this.name = 'SignUpError'
    this.kind = kind
  }
}

export interface SignUpService {
  /** Create a pending account; a verification code is emailed. */
  createAccount(email: string, password: string): Promise<void>
  /** Verify the emailed code to finish provisioning. */
  confirmRegistration(email: string, code: string): Promise<void>
  /** Re-send the verification code. */
  resendCode(email: string): Promise<void>
}

function toKind(err: unknown): SignUpErrorKind {
  const code = (err as { name?: string })?.name ?? (err as AuthError)?.name
  switch (code) {
    case 'UsernameExistsException':
      return 'email_in_use'
    case 'InvalidParameterException':
      return 'invalid_email'
    case 'InvalidPasswordException':
      return 'weak_password'
    case 'CodeMismatchException':
      return 'code_mismatch'
    case 'ExpiredCodeException':
      return 'code_expired'
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return 'too_many_requests'
    default:
      return 'unknown'
  }
}

function raise(kind: SignUpErrorKind): never {
  throw new SignUpError(kind, kind)
}

export function signUpErrorMessage(kind: SignUpErrorKind): string {
  switch (kind) {
    case 'email_in_use':
      return 'Unable to create your account. If an account already exists, sign in instead.'
    case 'invalid_email':
      return 'Please enter a valid email address.'
    case 'weak_password':
      return 'Your password does not meet the requirements.'
    case 'code_mismatch':
      return 'The verification code you entered is incorrect.'
    case 'code_expired':
      return 'That verification code has expired. Request a new one.'
    case 'too_many_requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'unknown':
      return 'Unable to complete this request right now. Please try again.'
  }
}

export const cognitoSignUpService: SignUpService = {
  async createAccount(email, password) {
    ensureConfigured()
    try {
      await amplifySignUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      })
    } catch (err) {
      const kind = toKind(err)
      if (kind === 'unknown') throw err
      raise(kind)
    }
  },

  async confirmRegistration(email, code) {
    ensureConfigured()
    try {
      await amplifyConfirmSignUp({ username: email, confirmationCode: code })
    } catch (err) {
      const kind = toKind(err)
      if (kind === 'unknown') throw err
      raise(kind)
    }
  },

  async resendCode(email) {
    ensureConfigured()
    try {
      await amplifyResendSignUpCode({ username: email })
    } catch (err) {
      const kind = toKind(err)
      if (kind === 'unknown') throw err
      raise(kind)
    }
  },
}