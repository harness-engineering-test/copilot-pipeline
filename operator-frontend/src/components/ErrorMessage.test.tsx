import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage', () => {
  it('エラーメッセージを表示する', () => {
    render(<ErrorMessage message="エラーが発生しました" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
  })

  it('onRetry が渡された場合、再試行ボタンを表示する', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="エラー" onRetry={onRetry} />)
    expect(screen.getByText('再試行')).toBeInTheDocument()
  })

  it('再試行ボタンをクリックすると onRetry が呼ばれる', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorMessage message="エラー" onRetry={onRetry} />)
    await user.click(screen.getByText('再試行'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('onRetry が渡されない場合、再試行ボタンを表示しない', () => {
    render(<ErrorMessage message="エラー" />)
    expect(screen.queryByText('再試行')).not.toBeInTheDocument()
  })
})
