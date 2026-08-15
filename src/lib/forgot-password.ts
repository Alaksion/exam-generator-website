import {
  confirmResetPassword as amplifyConfirmResetPassword,
  resetPassword as amplifyResetPassword,
} from 'aws-amplify/auth'
import { ensureConfigured } from './cognito'
import { AuthFlowError, cognitoErrorKind } from './auth-errors'

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

export const cognitoForgotPasswordService: ForgotPasswordService = {
  async requestCode(email) {
    ensureConfigured()
    try {
      await amplifyResetPassword({ username: email })
    } catch (err) {
      // UserNotFoundException is deliberately swallowed — requesting a code for
      // an unknown email must look identical to one that exists.
      if ((err as { name?: string })?.name === 'UserNotFoundException') return
      const kind = cognitoErrorKind(err)
      if (kind === 'unknown') throw err
      throw new AuthFlowError(kind, kind)
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
      const kind = cognitoErrorKind(err)
      if (kind === 'unknown') throw err
      throw new AuthFlowError(kind, kind)
    }
  },
}
