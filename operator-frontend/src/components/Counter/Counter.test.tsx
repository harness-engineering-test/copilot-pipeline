import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter', () => {
  it('renders with default label and count 0', () => {
    render(<Counter />)
    expect(screen.getByRole('button')).toHaveTextContent('Count is 0')
  })

  it('renders with custom initialCount', () => {
    render(<Counter initialCount={5} />)
    expect(screen.getByRole('button')).toHaveTextContent('Count is 5')
  })

  it('renders with custom label', () => {
    render(<Counter label="Clicks" />)
    expect(screen.getByRole('button')).toHaveTextContent('Clicks is 0')
  })

  it('increments count on click', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    const button = screen.getByRole('button')
    await user.click(button)
    expect(button).toHaveTextContent('Count is 1')
    await user.click(button)
    expect(button).toHaveTextContent('Count is 2')
  })
})
