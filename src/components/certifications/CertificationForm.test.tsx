import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertificationForm } from '@/components/certifications/CertificationForm'
import type { CreateFormValues } from '@/lib/certification-schema'

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
      { name: 'Cloud Concepts', weight: 100, topics: ['Cloud Value Proposition'] },
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
})
