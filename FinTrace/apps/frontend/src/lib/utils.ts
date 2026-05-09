// Utility functions

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getRiskColor(score: number): string {
  if (score >= 0.9) return 'text-red-600 bg-red-50';
  if (score >= 0.7) return 'text-orange-600 bg-orange-50';
  if (score >= 0.4) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
}

export function getRiskLabel(score: number): string {
  if (score >= 0.9) return 'Critical';
  if (score >= 0.7) return 'High';
  if (score >= 0.4) return 'Medium';
  return 'Low';
}

export function truncateString(str: string, length: number = 50): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}
