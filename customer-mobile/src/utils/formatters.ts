// formatDate: 日付を "YYYY-MM-DD" 形式に変換する
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// formatCurrency: 金額を通貨文字列に変換する
export function formatCurrency(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

// formatPhoneNumber: 電話番号をハイフン区切りに変換する（未使用）
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}
