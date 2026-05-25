import { formatCurrency, formatDate } from '../../src/utils/format';

describe('formatCurrency', () => {
  it('should format JPY amounts correctly', () => {
    expect(formatCurrency(1000)).toBe('￥1,000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('￥0');
  });

  it('should handle large amounts', () => {
    expect(formatCurrency(1000000)).toBe('￥1,000,000');
  });
});

describe('formatDate', () => {
  it('should format a date string to Japanese locale', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z');
    expect(result).toMatch(/2024/);
  });

  it('should handle ISO date strings', () => {
    const result = formatDate('2024-06-01T12:00:00.000Z');
    expect(result).toContain('2024');
  });
});
