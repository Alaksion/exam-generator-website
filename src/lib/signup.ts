import {
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  signUp as amplifySignUp,
} from 'aws-amplify/auth'
import { ensureConfigured } from './cognito'
import { AuthFlowError, cognitoErrorKind } from './auth-errors'

export interface SignUpService {
  /** Create a pending account; a verification code is emailed. */
  createAccount(email: string, password: string): Promise<void>
  /** Verify the emailed code to finish provisioning. */
  confirmRegistration(email: string, code: string): Promise<void>
  /** Re-send the verification code. */
  resendCode(email: string): Promise<void>
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
      const kind = cognitoErrorKind(err)
      if (kind === 'unknown') throw err
      throw new AuthFlowError(kind, kind)
    }
  },

  async confirmRegistration(email, code) {
    ensureConfigured()
    try {
      await amplifyConfirmSignUp({ username: email, confirmationCode: code })
    } catch (err) {
      const kind = cognitoErrorKind(err)
      if (kind === 'unknown') throw err
      throw new AuthFlowError(kind, kind)
    }
  },

  async resendCode(email) {
    ensureConfigured()
    try {
      await amplifyResendSignUpCode({ username: email })
    } catch (err) {
      const kind = cognitoErrorKind(err)
      if (kind === 'unknown') throw err
      throw new AuthFlowError(kind, kind)
    }
  },
}
