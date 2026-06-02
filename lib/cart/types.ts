export interface CartItem {
  productId: string
  productName: string
  /** Unit price in `currency`, captured for display only — the backend
   *  recomputes authoritative prices when the order is created. */
  price: number
  currency: string
  image?: string
  stock: number
  qty: number
}

export interface CartAddInput {
  productId: string
  productName: string
  price: number
  currency: string
  image?: string
  stock: number
}
