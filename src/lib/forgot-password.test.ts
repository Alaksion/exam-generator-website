import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cognitoForgotPasswordService } from './forgot-password'

const mocks = vi.hoisted(() => ({
  resetPassword: vi.fn(),
  confirmResetPassword: vi.fn(),
}))

vi.mock('aws-amplify/auth', () => ({
  resetPassword: mocks.resetPassword,
  confirmResetPassword: mocks.confirmResetPassword,
}))

vi.mock('./cognito', () => ({
  ensureConfigured: () => {},
}))

describe('cognitoForgotPasswordService', () => {
  beforeEach(() => {
    mocks.resetPassword.mockReset()
    mocks.confirmResetPassword.mockReset()
  })

  it('requests a reset code by email', async () => {
    await cognitoForgotPasswordService.requestCode('a@b.co')
    expect(mocks.resetPassword).toHaveBeenCalledWith({ username: 'a@b.co' })
  })

  it('resolves the same way for an unknown email (no enumeration)', async () => {
    mocks.resetPassword.mockRejectedValue(
      Object.assign(new Error('x'), { name: 'UserNotFoundException' }),
    )
    await expect(cognitoForgotPasswordService.requestCode('ghost@b.co')).resolves.toBeUndefined()
  })

  it('surfaces a malformed email as invalid_email', async () => {
    mocks.resetPassword.mockRejectedValue(
      Object.assign(new Error('x'), { name: 'InvalidParameterException' }),
    )
    await expect(cognitoForgotPasswordService.requestCode('bad')).rejects.toMatchObject({
      kind: 'invalid_email',
    })
  })

  it('completes the reset with code and new password', async () => {
    await cognitoForgotPasswordService.resetPassword('a@b.co', '123456', 'NewPass123!')
    expect(mocks.confirmResetPassword).toHaveBeenCalledWith({
      username: 'a@b.co',
      confirmationCode: '123456',
      newPassword: 'NewPass123!',
    })
  })

  it('maps a wrong code to invalid_code', async () => {
    mocks.confirmResetPassword.mockRejectedValue(
      Object.assign(new Error('x'), { name: 'CodeMismatchException' }),
    )
    await expect(
      cognitoForgotPasswordService.resetPassword('a@b.co', '000000', 'X'),
    ).rejects.toMatchObject({ kind: 'invalid_code' })
  })

  it('rethrows unknown errors', async () => {
    const boom = new Error('boom')
    mocks.resetPassword.mockRejectedValue(boom)
    await expect(cognitoForgotPasswordService.requestCode('a@b.co')).rejects.toBe(boom)
  })
})