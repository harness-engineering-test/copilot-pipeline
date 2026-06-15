import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderStatusBadge } from './OrderStatusBadge'

describe('OrderStatusBadge', () => {
  it('pending ステータスを表示する', () => {
    render(<OrderStatusBadge status="pending" />)
    expect(screen.getByText('保留中')).toBeInTheDocument()
  })

  it('confirmed ステータスを表示する', () => {
    render(<OrderStatusBadge status="confirmed" />)
    expect(screen.getByText('確認済み')).toBeInTheDocument()
  })

  it('delivered ステータスを表示する', () => {
    render(<OrderStatusBadge status="delivered" />)
    expect(screen.getByText('配達済み')).toBeInTheDocument()
  })

  it('cancelled ステータスを表示する', () => {
    render(<OrderStatusBadge status="cancelled" />)
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })
})
