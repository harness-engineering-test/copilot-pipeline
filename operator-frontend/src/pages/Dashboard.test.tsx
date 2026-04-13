import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('renders heading', () => {
    render(<Dashboard />)
    expect(screen.getByRole('heading', { name: /operator dashboard/i })).toBeInTheDocument()
  })
})
