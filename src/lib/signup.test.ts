import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignUpError, cognitoSignUpService } from './signup'

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  resendSignUpCode: vi.fn(),
  configure: vi.fn(),
}))

vi.mock('aws-amplify/auth', () => ({
  signUp: mocks.signUp,
  confirmSignUp: mocks.confirmSignUp,
  resendSignUpCode: mocks.resendSignUpCode,
}))

vi.mock('aws-amplify', () => ({
  Amplify: { configure: mocks.configure },
}))

vi.mock('./cognito', () => ({
  ensureConfigured: () => {},
}))

describe('cognitoSignUpService', () => {
  beforeEach(() => {
    mocks.signUp.mockReset()
    mocks.confirmSignUp.mockReset()
    mocks.resendSignUpCode.mockReset()
  })

  it('creates an account with email as the username', async () => {
    mocks.signUp.mockResolvedValue({ isSignUpComplete: false })
    await cognitoSignUpService.createAccount('a@b.co', 'password')
    expect(mocks.signUp).toHaveBeenCalledWith({
      username: 'a@b.co',
      password: 'password',
      options: { userAttributes: { email: 'a@b.co' } },
    })
  })

  it('maps an existing email to a generic email_in_use kind', async () => {
    mocks.signUp.mockRejectedValue(Object.assign(new Error('x'), { name: 'UsernameExistsException' }))
    await expect(cognitoSignUpService.createAccount('a@b.co', 'p')).rejects.toMatchObject({
      kind: 'email_in_use',
    })
  })

  it('maps malformed input to the invalid_email kind', async () => {
    mocks.signUp.mockRejectedValue(Object.assign(new Error('x'), { name: 'InvalidParameterException' }))
    await expect(cognitoSignUpService.createAccount('bad', 'p')).rejects.toMatchObject({
      kind: 'invalid_email',
    })
  })

  it('maps a wrong code to code_mismatch on confirm', async () => {
    mocks.confirmSignUp.mockRejectedValue(Object.assign(new Error('x'), { name: 'CodeMismatchException' }))
    await expect(cognitoSignUpService.confirmRegistration('a@b.co', '000000')).rejects.toMatchObject({
      kind: 'code_mismatch',
    })
  })

  it('confirms a registration with the emailed code', async () => {
    mocks.confirmSignUp.mockResolvedValue({ isSignUpComplete: true })
    await cognitoSignUpService.confirmRegistration('a@b.co', '123456')
    expect(mocks.confirmSignUp).toHaveBeenCalledWith({
      username: 'a@b.co',
      confirmationCode: '123456',
    })
  })

  it('rethrows unknown errors so callers can preserve them', async () => {
    const boom = new Error('boom')
    mocks.signUp.mockRejectedValue(boom)
    await expect(cognitoSignUpService.createAccount('a@b.co', 'p')).rejects.toBe(boom)
  })

  it('exposes a distinct error type with its kind', () => {
    expect(new SignUpError('email_in_use', 'x')).toMatchObject({ kind: 'email_in_use' })
  })
})