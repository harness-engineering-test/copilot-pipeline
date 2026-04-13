import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders operator dashboard heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /operator dashboard/i })).toBeInTheDocument()
  })
})
