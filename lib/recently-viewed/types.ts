export interface RecentlyViewedItem {
  productId: string
  productName: string
  price: number
  currency: string
  image?: string
  /** Unix timestamp of when the view was recorded */
  viewedAt: number
}
