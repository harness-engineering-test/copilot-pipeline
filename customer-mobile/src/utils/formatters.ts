// formatDate: 日付を "YYYY-MM-DD" 形式に変換する
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// formatCurrency: 金額を通貨文字列に変換する
export function formatCurrency(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}
