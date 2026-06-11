'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { QuantityStepper } from '@/components/cart/quantity-stepper'
import { Button } from '@/components/ui/button'
import { useCart, type CartAddInput } from '@/lib/cart'

export function AddToCart({ product }: { product: CartAddInput }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const outOfStock = product.stock <= 0

  const onAdd = () => {
    addItem(product, qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!outOfStock && <QuantityStepper value={qty} max={product.stock} onChange={setQty} />}
      <Button size="lg" disabled={outOfStock} onClick={onAdd}>
        <HugeiconsIcon
          icon={added ? Tick02Icon : ShoppingCart01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        {outOfStock ? 'Unavailable' : added ? 'Added to cart' : 'Add to cart'}
      </Button>
    </div>
  )
}
