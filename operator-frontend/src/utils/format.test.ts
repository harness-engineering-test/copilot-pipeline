import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, getOrderStatusLabel } from '@/utils/format'

describe('formatCurrency', () => {
  it('円単位でフォーマットする', () => {
    const result = formatCurrency(1000)
    expect(result).toMatch(/1,000/)
  })

  it('0円をフォーマットする', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/0/)
  })

  it('大きな金額をフォーマットする', () => {
    const result = formatCurrency(1234567)
    expect(result).toMatch(/1,234,567/)
  })
})

describe('formatDate', () => {
  it('日時文字列を日本語形式でフォーマットする', () => {
    const result = formatDate('2024-01-15T10:30:00Z')
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/01/)
    expect(result).toMatch(/15/)
  })
})

describe('getOrderStatusLabel', () => {
  it('pending を「保留中」に変換する', () => {
    expect(getOrderStatusLabel('pending')).toBe('保留中')
  })

  it('confirmed を「確認済み」に変換する', () => {
    expect(getOrderStatusLabel('confirmed')).toBe('確認済み')
  })

  it('processing を「処理中」に変換する', () => {
    expect(getOrderStatusLabel('processing')).toBe('処理中')
  })

  it('shipped を「発送済み」に変換する', () => {
    expect(getOrderStatusLabel('shipped')).toBe('発送済み')
  })

  it('delivered を「配達済み」に変換する', () => {
    expect(getOrderStatusLabel('delivered')).toBe('配達済み')
  })

  it('cancelled を「キャンセル」に変換する', () => {
    expect(getOrderStatusLabel('cancelled')).toBe('キャンセル')
  })
})
