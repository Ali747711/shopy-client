export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  } catch {
    // Unknown/unsupported currency code — fall back to a plain rendering.
    return `${currency} ${amount.toFixed(2)}`
  }
}
