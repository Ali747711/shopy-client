export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", label: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", label: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "UZS", label: "UZS", symbol: "sum", flag: "🇺🇿" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";
export const STORAGE_KEY = "shopy.currency.v1";
