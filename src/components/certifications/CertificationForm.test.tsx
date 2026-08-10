import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertificationForm } from '@/components/certifications/CertificationForm'
import type { CreateFormValues } from '@/lib/certification-schema'

const VALID_CONTEXT =
  'Covers the core value proposition of cloud computing, including cost efficiency, elasticity, and on-demand access to resources.'

const baseValues: CreateFormValues = {
  provider: 'aws',
  code: 'CLF-C02',
  name: 'AWS Certified Cloud Practitioner',
  description: 'Foundational AWS cloud certification.',
  isActive: true,
  config: {
    questionCount: 10,
    difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
    domains: [
      {
        name: 'Cloud Concepts',
        weight: 100,
        topics: [{ name: 'Cloud Value Proposition', context: VALID_CONTEXT }],
      },
    ],
  },
}

describe('CertificationForm', () => {
  it('hides provider and code fields in edit mode', () => {
    render(
      <CertificationForm
        initialValues={baseValues}
        onSubmit={() => undefined}
      />,
    )

    expect(
      screen.queryByLabelText('Provider'),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Code')).not.toBeInTheDocument()
  })

  it('prefills editable fields in edit mode', () => {
    render(
      <CertificationForm
        initialValues={baseValues}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Name')).toHaveValue(
      'AWS Certified Cloud Practitioner',
    )
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Foundational AWS cloud certification.',
    )
  })

  it('submits the current values on save', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <CertificationForm
        initialValues={baseValues}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining(baseValues))
  })

  it('shows a trimmed character counter for each topic context', () => {
    const padded = `  ${VALID_CONTEXT}  `
    render(
      <CertificationForm
        initialValues={{
          ...baseValues,
          config: {
            ...baseValues.config,
            domains: [
              {
                name: 'Cloud Concepts',
                weight: 100,
                topics: [{ name: 'Cloud Value Proposition', context: padded }],
              },
            ],
          },
        }}
        onSubmit={() => undefined}
      />,
    )

    expect(
      screen.getByText(`${VALID_CONTEXT.length}/1500`),
    ).toBeInTheDocument()
  })

  it('flags an out-of-range topic context and blocks submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <CertificationForm
        initialValues={{
          ...baseValues,
          config: {
            ...baseValues.config,
            domains: [
              {
                name: 'Cloud Concepts',
                weight: 100,
                topics: [{ name: 'Cloud Value Proposition', context: 'Short' }],
              },
            ],
          },
        }}
        onSubmit={onSubmit}
      />,
    )

    expect(
      screen.getByText('Topic context must be at least 20 characters'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  describe('deactivation confirmation', () => {
    it('opens a confirmation dialog before toggling isActive off', async () => {
      const user = userEvent.setup()
      render(
        <CertificationForm
          initialValues={baseValues}
          onSubmit={() => undefined}
        />,
      )

      await user.click(screen.getByRole('checkbox', { name: 'Active' }))

      expect(
        screen.getByRole('heading', { name: 'Deactivate certification' }),
      ).toBeInTheDocument()
    })

    it('confirming deactivates the certification', async () => {
      const user = userEvent.setup()
      render(
        <CertificationForm
          initialValues={baseValues}
          onSubmit={() => undefined}
        />,
      )

      await user.click(screen.getByRole('checkbox', { name: 'Active' }))
      await user.click(screen.getByRole('button', { name: 'Deactivate' }))

      expect(screen.getByRole('checkbox', { name: 'Active' })).not.toBeChecked()
      expect(
        screen.queryByRole('heading', { name: 'Deactivate certification' }),
      ).not.toBeInTheDocument()
    })

    it('cancelling reverts the toggle to on', async () => {
      const user = userEvent.setup()
      render(
        <CertificationForm
          initialValues={baseValues}
          onSubmit={() => undefined}
        />,
      )

      await user.click(screen.getByRole('checkbox', { name: 'Active' }))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked()
      expect(
        screen.queryByRole('heading', { name: 'Deactivate certification' }),
      ).not.toBeInTheDocument()
    })

    it('toggling isActive on requires no confirmation', async () => {
      const user = userEvent.setup()
      render(
        <CertificationForm
          initialValues={{ ...baseValues, isActive: false }}
          onSubmit={() => undefined}
        />,
      )

      await user.click(screen.getByRole('checkbox', { name: 'Active' }))

      expect(
        screen.queryByRole('heading', { name: 'Deactivate certification' }),
      ).not.toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked()
    })
  })
})
