import type { RecentlyViewedItem } from './types'

const STORAGE_KEY = 'shopy.recently-viewed.v1'
/** Maximum number of items to keep — oldest are evicted (FIFO). */
const MAX_ITEMS = 10

function readStore(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? (parsed as RecentlyViewedItem[]) : []
  } catch {
    return []
  }
}

function writeStore(items: RecentlyViewedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota / unavailable */
  }
}

/**
 * Records a product view. If the product is already in the list it is moved
 * to the front (most recent). Enforces the MAX_ITEMS cap.
 */
export function addRecentlyViewed(
  item: Omit<RecentlyViewedItem, 'viewedAt'>,
): void {
  const prev = readStore()
  // Remove any existing entry for this product so we can re-insert at front
  const filtered = prev.filter((i) => i.productId !== item.productId)
  const next: RecentlyViewedItem[] = [
    { ...item, viewedAt: Date.now() },
    ...filtered,
  ].slice(0, MAX_ITEMS)
  writeStore(next)
}

/** Returns the list sorted by most-recently-viewed first. */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  return readStore().sort((a, b) => b.viewedAt - a.viewedAt)
}

export function clearRecentlyViewed(): void {
  writeStore([])
}
