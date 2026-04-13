import { formatDate, truncate } from '../../src/utils/formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats a date to Japanese locale string', () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      const result = formatDate(date);
      expect(result).toContain('2026');
    });

    it('returns a non-empty string', () => {
      const result = formatDate(new Date());
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('truncate', () => {
    it('returns the original string if within maxLength', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('truncates and appends ellipsis when over maxLength', () => {
      const result = truncate('hello world', 8);
      expect(result).toBe('hello...');
      expect(result.length).toBe(8);
    });

    it('returns full string when exactly at maxLength', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
  });
});
