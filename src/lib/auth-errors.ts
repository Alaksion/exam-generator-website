export type AuthFlowErrorKind =
  | 'email_in_use'
  | 'invalid_email'
  | 'weak_password'
  | 'code_mismatch'
  | 'code_expired'
  | 'too_many_requests'
  | 'unknown'

export class AuthFlowError extends Error {
  readonly kind: AuthFlowErrorKind

  constructor(kind: AuthFlowErrorKind, message: string) {
    super(message)
    this.name = 'AuthFlowError'
    this.kind = kind
  }
}

/** Normalise an Amplify/Cognito exception to a stable, flow-agnostic kind. */
export function cognitoErrorKind(err: unknown): AuthFlowErrorKind {
  const code = (err as { name?: string })?.name
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

export function authFlowErrorMessage(kind: AuthFlowErrorKind): string {
  switch (kind) {
    case 'email_in_use':
      return 'We could not create your account. Please check your details and try again.'
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