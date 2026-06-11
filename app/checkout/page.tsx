'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CreditCardIcon, DeliveryTruck01Icon, InformationCircleIcon, Tick02Icon } from '@hugeicons/core-free-icons'

import { toast } from 'sonner'

import { useTranslation } from 'react-i18next'

import { AddressCard } from '@/components/address/address-card'
import { AddressForm } from '@/components/address/address-form'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { isApiError } from '@/lib/api'
import {
  addAddress,
  addressFieldsSchema,
  EMPTY_ADDRESS,
  listAddresses,
  type AddressFields,
  type SavedAddress,
} from '@/lib/addresses'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { createOrder, type PaymentMethod } from '@/lib/orders'
import { createCheckoutSession, getPaymentConfig } from '@/lib/payments/api'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Shipping address — schema, countries and EMPTY_ADDRESS now live   */
/*  in the shared @/lib/addresses layer.                              */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'shopy.shipping-address'

type ShippingErrors = Partial<Record<keyof AddressFields, string>>

export default function CheckoutPage() {
  const { t } = useTranslation()
  const { user, status } = useAuth()
  const { items, count, subtotal, currency, hydrated, clear } = useCart()
  const router = useRouter()

  // Guests can only pay COD — Stripe requires a user account on the backend.
  const isGuest = status === 'unauthenticated'
  const isAuthenticated = status === 'authenticated'

  const [method, setMethod] = useState<PaymentMethod>('COD')
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ---------- Shipping address state ---------- */
  const [address, setAddress] = useState<AddressFields>(EMPTY_ADDRESS)
  const [addressErrors, setAddressErrors] = useState<ShippingErrors>({})

  /* ---------- Saved addresses (authenticated users) ---------- */
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // True when the user is entering a brand-new address rather than picking a saved one.
  const [enteringNew, setEnteringNew] = useState(false)
  const [saveToAccount, setSaveToAccount] = useState(false)

  const hasSaved = savedAddresses.length > 0
  // Show the manual form for guests, when no saved addresses exist, or when adding new.
  const showForm = !hasSaved || enteringNew

  // Load saved address from localStorage on mount, and pre-fill name from user.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AddressFields>
        setAddress((prev) => ({ ...prev, ...parsed }))
        return
      }
    } catch {
      /* corrupted localStorage — fall through to defaults */
    }
    // If no saved address and user is authenticated, pre-fill fullName.
    if (user?.userName) {
      setAddress((prev) => ({ ...prev, fullName: user.userName }))
    }
  }, [user?.userName])

  // Load the user's saved addresses; pre-select the default (or first).
  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    listAddresses()
      .then((list) => {
        if (!active || list.length === 0) return
        setSavedAddresses(list)
        const preferred = list.find((a) => a.isDefault) ?? list[0]
        setSelectedId(preferred._id)
        setAddress(toFields(preferred))
      })
      .catch(() => {
        /* no saved addresses available — just show the manual form */
      })
    return () => {
      active = false
    }
  }, [isAuthenticated])

  // Persist address to localStorage on every manual change.
  const updateAddress = useCallback((patch: Partial<AddressFields>) => {
    setAddress((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* quota exceeded — silently ignore */
      }
      return next
    })
    // Clear field-level errors for changed fields.
    setAddressErrors((prev) => {
      const cleared = { ...prev }
      for (const key of Object.keys(patch)) {
        delete cleared[key as keyof AddressFields]
      }
      return cleared
    })
  }, [])

  // Pick a saved address — copy its fields into the active address state.
  const selectSaved = useCallback((saved: SavedAddress) => {
    setSelectedId(saved._id)
    setEnteringNew(false)
    setAddress(toFields(saved))
    setAddressErrors({})
  }, [])

  /** Validate the address; returns true if valid. */
  const validateAddress = useCallback((): boolean => {
    // Normalize address2 — treat empty string as undefined for optional field.
    const normalized = {
      ...address,
      address2: address.address2?.trim() || undefined,
    }
    const result = addressFieldsSchema.safeParse(normalized)
    if (result.success) {
      setAddressErrors({})
      return true
    }
    const fieldErrors: ShippingErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof AddressFields | undefined
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    setAddressErrors(fieldErrors)
    return false
  }, [address])

  // When auth resolves and the user is a guest, reset to COD.
  // Done via the initializer rather than an effect to avoid cascading renders.
  const effectiveMethod: PaymentMethod = isGuest && method === 'STRIPE' ? 'COD' : method

  useEffect(() => {
    let active = true
    getPaymentConfig()
      .then((config) => {
        if (active) setStripeEnabled(config.enabled)
      })
      .catch(() => {
        /* leave Stripe disabled if the config call fails */
      })
    return () => {
      active = false
    }
  }, [])

  // Only block render during auth loading + cart hydration, not on unauthenticated.
  if (status === 'loading' || !hydrated) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-24 pb-24 text-center text-xs text-muted-foreground">
        Loading…
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 pb-24 text-center">
        <h1 className="font-heading text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add something before checking out.</p>
        <Link href="/products" className={cn(buttonVariants({ variant: 'default' }), 'mt-6')}>
          Browse products
        </Link>
      </main>
    )
  }

  const placeOrder = async () => {
    setError(null)

    // Validate shipping address before proceeding.
    if (!validateAddress()) {
      setError('Please fill in all required shipping fields.')
      return
    }

    const shippingAddress: AddressFields = {
      ...address,
      address2: address.address2?.trim() || undefined,
    }

    // Best-effort: persist a newly-entered address to the user's account.
    // A save failure must never block the order.
    if (isAuthenticated && saveToAccount && showForm) {
      try {
        await addAddress({ ...shippingAddress, isDefault: !hasSaved })
      } catch (err) {
        toast.error(isApiError(err) ? err.message : "Couldn’t save the address to your account.")
      }
    }

    setSubmitting(true)
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
        currency,
        paymentMethod: effectiveMethod,
        shippingAddress,
      })

      if (effectiveMethod === 'STRIPE') {
        const { url } = await createCheckoutSession(order._id)
        if (!url) throw new Error('Could not start the payment session.')
        window.location.href = url // cart is cleared on the success page
        return
      }

      clear()
      router.push(`/checkout/success?order=${order._id}`)
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        // Backend rejected an unauthenticated order attempt — surface a message
        // instead of silently redirecting so the guest understands what happened.
        setError('Your session expired. Please sign in to place this order.')
        setSubmitting(false)
        return
      }
      setError(isApiError(err) ? err.message : "We couldn’t place your order. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-24 pb-24 sm:pb-12">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">{t('checkout.title')}</h1>

      {/* Guest nudge — soft prompt, not a hard redirect */}
      {isGuest && (
        <div className="mb-6 flex items-start gap-3 border border-border bg-muted/40 px-4 py-3">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={1.5}
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground">
            Checking out as guest.{' '}
            <Link
              href="/login?redirect=/checkout"
              className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
            >
              Sign in
            </Link>{' '}
            for faster checkout and order tracking.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          {/* ---- Shipping details ---- */}
          <h2 className="font-heading text-sm font-semibold">{t('checkout.shippingDetails')}</h2>

          {/* Saved addresses (authenticated users only) */}
          {hasSaved && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {savedAddresses.map((saved) => (
                  <AddressCard
                    key={saved._id}
                    address={saved}
                    selectable
                    selected={!enteringNew && selectedId === saved._id}
                    onSelect={() => selectSaved(saved)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-pressed={enteringNew}
                onClick={() => {
                  setEnteringNew(true)
                  setSelectedId(null)
                  setAddress(EMPTY_ADDRESS)
                  setAddressErrors({})
                }}
                className={cn(
                  'self-start border border-dashed px-3 py-1.5 text-xs transition-colors',
                  enteringNew
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground',
                )}
              >
                + Add new address
              </button>
            </div>
          )}

          {showForm && (
            <div className="mt-3 border border-border bg-card p-5 ring-1 ring-foreground/5">
              <AddressForm
                value={address}
                errors={addressErrors}
                onChange={updateAddress}
                idPrefix="checkout"
              />

              {/* Save to account — authenticated users entering a new address */}
              {isAuthenticated && (
                <Label className="mt-4 cursor-pointer font-medium">
                  <Checkbox
                    checked={saveToAccount}
                    onCheckedChange={(checked) => setSaveToAccount(checked === true)}
                  />
                  Save to my account
                </Label>
              )}
            </div>
          )}

          {/* ---- Payment method ---- */}
          <h2 className="font-heading mt-8 text-sm font-semibold">{t('checkout.paymentMethod')}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <PaymentOption
              active={effectiveMethod === 'COD'}
              icon={DeliveryTruck01Icon}
              title={t('checkout.cod')}
              desc={t('checkout.codDesc')}
              onSelect={() => setMethod('COD')}
            />
            {/* Stripe is hidden for guests — backend requires an account */}
            {!isGuest && (
              <PaymentOption
                active={effectiveMethod === 'STRIPE'}
                icon={CreditCardIcon}
                title={t('checkout.card')}
                desc={stripeEnabled ? t('checkout.cardDesc') : t('checkout.cardUnavailable')}
                disabled={!stripeEnabled}
                onSelect={() => setMethod('STRIPE')}
              />
            )}
          </div>

          {/* Guest badge under the payment section */}
          {isGuest && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Card payment requires an account.{' '}
              <Link
                href="/login?redirect=/checkout"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                Sign in
              </Link>{' '}
              to unlock Stripe.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}
        </section>

        <aside className="h-fit border border-border bg-card p-5 ring-1 ring-foreground/5">
          <h2 className="font-heading text-sm font-semibold">{t('cart.orderSummary')}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-start gap-3 text-sm">
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="line-clamp-2 font-medium leading-snug">{item.productName}</span>
                  <span className="mt-0.5 block text-muted-foreground">{t('checkout.qty')} {item.qty}</span>
                </span>
                <span className="shrink-0 whitespace-nowrap pl-2">{formatPrice(item.price * item.qty, item.currency)}</span>
              </li>
            ))}
          </ul>
          {/* Compact address summary */}
          {address.address1 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('checkout.shipTo')}
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                {address.fullName && <span className="font-medium">{address.fullName}</span>}
                {address.fullName && <br />}
                {address.address1}
                {address.address2 && `, ${address.address2}`}
                <br />
                {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
                {address.country && ` — ${address.country}`}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium">
              Total ({count} item{count === 1 ? '' : 's'})
            </span>
            <span className="font-heading text-lg font-semibold">{formatPrice(subtotal, currency)}</span>
          </div>
          <Button size="lg" className="mt-5 w-full" disabled={submitting} onClick={placeOrder}>
            {submitting ? t('checkout.placingOrder') : effectiveMethod === 'STRIPE' ? t('checkout.payWithCard') : t('checkout.placeOrder')}
          </Button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('nav.backToCart')}
          </Link>
        </aside>
      </div>
    </main>
  )
}

/** Strip a SavedAddress down to its 8 AddressFields. */
function toFields(saved: SavedAddress): AddressFields {
  return {
    fullName: saved.fullName,
    phone: saved.phone,
    address1: saved.address1,
    address2: saved.address2 ?? '',
    city: saved.city,
    state: saved.state,
    postalCode: saved.postalCode,
    country: saved.country,
  }
}

function PaymentOption({
  active,
  icon,
  title,
  desc,
  disabled,
  onSelect,
}: {
  active: boolean
  icon: typeof CreditCardIcon
  title: string
  desc: string
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        'flex items-start gap-3 border bg-card p-4 text-left transition-colors disabled:opacity-50',
        active ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-foreground/25',
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-foreground" />
      <span className="flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {title}
          {active && <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3.5 text-primary" />}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{desc}</span>
      </span>
    </button>
  )
}
