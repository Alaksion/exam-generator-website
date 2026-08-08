import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberInput } from '@/components/ui/number-input'

describe('NumberInput', () => {
  it('renders the numeric value', () => {
    render(<NumberInput value={10} onValueChange={() => undefined} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(10)
  })

  it('calls onValueChange when a number is typed', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NumberInput value={10} onValueChange={onValueChange} />)

    await user.clear(screen.getByRole('spinbutton'))
    await user.type(screen.getByRole('spinbutton'), '25')

    expect(onValueChange).toHaveBeenCalledWith(25)
  })

  it('allows the input to be emptied without resetting to 0', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NumberInput value={10} onValueChange={onValueChange} />)

    const input = screen.getByRole('spinbutton')
    await user.clear(input)

    expect(input).toHaveValue(null)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
