// Client-side only — price snapshots are stored in localStorage so we can
// compare the current price against the price at the time the user wishlisted
// an item, without any backend changes.

const PRICE_STORAGE_KEY = 'shopy.wishlist.prices.v1'

export interface PriceSnapshot {
  productId: string
  price: number
  currency: string
  savedAt: number
}

type SnapshotMap = Record<string, PriceSnapshot>

function readMap(): SnapshotMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PRICE_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SnapshotMap) : {}
  } catch {
    return {}
  }
}

function writeMap(map: SnapshotMap): void {
  try {
    localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore quota / unavailable storage */
  }
}

/** Store (or update) the price at the time an item is wishlisted. */
export function savePriceSnapshot(productId: string, price: number, currency: string): void {
  const map = readMap()
  writeMap({
    ...map,
    [productId]: { productId, price, currency, savedAt: Date.now() },
  })
}

/** Retrieve the stored snapshot for a product, or null if none exists. */
export function getPriceSnapshot(productId: string): PriceSnapshot | null {
  const map = readMap()
  return map[productId] ?? null
}

/** Remove the snapshot when the item is removed from the wishlist. */
export function clearPriceSnapshot(productId: string): void {
  // Destructure the target key out and write the remainder back.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [productId]: _removed, ...rest } = readMap()
  writeMap(rest)
}
