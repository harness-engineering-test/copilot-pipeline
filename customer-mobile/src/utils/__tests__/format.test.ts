import { formatDate, formatCurrency } from '../format';

describe('formatDate', () => {
  it('日付を日本語形式でフォーマットする', () => {
    const date = new Date('2026-01-15');
    const result = formatDate(date);
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/01/);
    expect(result).toMatch(/15/);
  });

  it('Dateオブジェクトを受け取り文字列を返す', () => {
    const date = new Date('2026-06-15');
    const result = formatDate(date);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatCurrency', () => {
  it('金額を円形式でフォーマットする', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1,000');
  });

  it('0円をフォーマットする', () => {
    const result = formatCurrency(0);
    expect(typeof result).toBe('string');
  });
});
