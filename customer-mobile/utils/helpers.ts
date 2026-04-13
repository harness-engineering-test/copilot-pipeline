/**
 * 汎用ヘルパー関数
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '予期しないエラーが発生しました';
}

export function validateAge(age: number): boolean {
  if (age < 0) {
    return false;
  }
  return true;
}

export function processStatus(status: string): string {
  switch (status) {
    case 'active':
      return '有効';
    case 'inactive':
      return '無効';
    default:
      return '不明';
  }
}
