export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP');
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}
