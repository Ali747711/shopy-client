'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  Image02Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { getCategories, type ProductStatus } from '@/lib/products'
import { productFormSchema, type ProductFormValues } from '@/lib/admin'
import { cn } from '@/lib/utils'

type Mode = 'create' | 'edit'

interface ProductFormProps {
  mode: Mode
  initialValues?: Partial<ProductFormValues>
  onSubmit: (values: ProductFormValues) => Promise<void>
}

/** Local editable shape — numbers kept as strings so inputs can be empty mid-edit. */
interface FormState {
  productName: string
  productDescription: string
  productCategory: string
  productTags: string[]
  productPrice: string
  productStock: string
  productImages: { url: string; alt: string }[]
  productStatus: ProductStatus
}

/** Per-field error map; nested image errors are keyed by `images.<index>.url`. */
type FieldErrors = Record<string, string>

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: 'Active',
  PAUSE: 'Paused',
  DELETE: 'Archived',
}

// Only Active / Paused are meaningful toggles in the editor; DELETE is a
// soft-delete handled by the list view, not a manual selection here.
const STATUS_OPTIONS: ProductStatus[] = ['ACTIVE', 'PAUSE']

function buildInitialState(initial?: Partial<ProductFormValues>): FormState {
  return {
    productName: initial?.productName ?? '',
    productDescription: initial?.productDescription ?? '',
    productCategory: initial?.productCategory ?? '',
    productTags: initial?.productTags ?? [],
    productPrice:
      initial?.productPrice !== undefined ? String(initial.productPrice) : '',
    productStock:
      initial?.productStock !== undefined ? String(initial.productStock) : '0',
    productImages:
      initial?.productImages?.map((image) => ({
        url: image.url,
        alt: image.alt ?? '',
      })) ?? [],
    productStatus: initial?.productStatus ?? 'ACTIVE',
  }
}

export function ProductForm({ mode, initialValues, onSubmit }: ProductFormProps) {
  const [state, setState] = useState<FormState>(() => buildInitialState(initialValues))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')

  // Load category suggestions; failure is non-fatal (free-text still works).
  useEffect(() => {
    let active = true
    void getCategories()
      .then((list) => {
        if (active) setCategories(list)
      })
      .catch(() => {
        if (active) setCategories([])
      })
    return () => {
      active = false
    }
  }, [])

  const clearError = useCallback((key: string) => {
    setErrors((previous) => {
      if (!(key in previous)) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }, [])

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setState((previous) => ({ ...previous, [key]: value }))
      clearError(key)
    },
    [clearError],
  )

  // --- Tags ----------------------------------------------------------------
  const addTag = useCallback(() => {
    const value = tagDraft.trim()
    if (!value) return
    setState((previous) =>
      previous.productTags.includes(value)
        ? previous
        : { ...previous, productTags: [...previous.productTags, value] },
    )
    setTagDraft('')
  }, [tagDraft])

  const removeTag = useCallback((tag: string) => {
    setState((previous) => ({
      ...previous,
      productTags: previous.productTags.filter((existing) => existing !== tag),
    }))
  }, [])

  // --- Images --------------------------------------------------------------
  const addImage = useCallback(() => {
    setState((previous) => ({
      ...previous,
      productImages: [...previous.productImages, { url: '', alt: '' }],
    }))
  }, [])

  const updateImage = useCallback(
    (index: number, key: 'url' | 'alt', value: string) => {
      setState((previous) => ({
        ...previous,
        productImages: previous.productImages.map((image, i) =>
          i === index ? { ...image, [key]: value } : image,
        ),
      }))
      clearError(`images.${index}.url`)
    },
    [clearError],
  )

  const removeImage = useCallback((index: number) => {
    setState((previous) => ({
      ...previous,
      productImages: previous.productImages.filter((_, i) => i !== index),
    }))
  }, [])

  // --- Submit --------------------------------------------------------------
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitting) return

      const candidate = {
        productName: state.productName.trim(),
        productDescription: state.productDescription.trim(),
        productCategory: state.productCategory.trim(),
        productTags: state.productTags,
        productPrice: state.productPrice === '' ? Number.NaN : Number(state.productPrice),
        productStock: state.productStock === '' ? 0 : Number(state.productStock),
        productImages: state.productImages
          .map((image) => ({ url: image.url.trim(), alt: image.alt.trim() }))
          .filter((image) => image.url.length > 0)
          .map((image) => ({
            url: image.url,
            ...(image.alt ? { alt: image.alt } : {}),
          })),
        ...(mode === 'edit' ? { productStatus: state.productStatus } : {}),
      }

      const parsed = productFormSchema.safeParse(candidate)
      if (!parsed.success) {
        const nextErrors: FieldErrors = {}
        for (const issue of parsed.error.issues) {
          // Map zod paths to our error keys: scalar fields use the field name,
          // image url errors use `images.<index>.url`.
          const [head, index] = issue.path
          if (head === 'productImages' && typeof index === 'number') {
            nextErrors[`images.${index}.url`] = issue.message
          } else if (typeof head === 'string' && !(head in nextErrors)) {
            nextErrors[head] = issue.message
          }
        }
        setErrors(nextErrors)
        return
      }

      setErrors({})
      setSubmitting(true)
      try {
        await onSubmit(parsed.data)
      } finally {
        setSubmitting(false)
      }
    },
    [mode, onSubmit, state, submitting],
  )

  const heading = mode === 'create' ? 'Product details' : 'Edit product'
  const submitLabel = mode === 'create' ? 'Create product' : 'Save changes'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>{heading}</FieldLegend>

          {/* Name */}
          <Field data-invalid={errors.productName ? true : undefined}>
            <FieldLabel htmlFor="productName">Name</FieldLabel>
            <Input
              id="productName"
              value={state.productName}
              onChange={(event) => setField('productName', event.target.value)}
              placeholder="Aurora Wireless Headphones"
              aria-invalid={errors.productName ? true : undefined}
              autoComplete="off"
            />
            <FieldError>{errors.productName}</FieldError>
          </Field>

          {/* Description */}
          <Field data-invalid={errors.productDescription ? true : undefined}>
            <FieldLabel htmlFor="productDescription">Description</FieldLabel>
            <Textarea
              id="productDescription"
              value={state.productDescription}
              onChange={(event) => setField('productDescription', event.target.value)}
              placeholder="A short, vivid description that sells the product."
              rows={5}
              aria-invalid={errors.productDescription ? true : undefined}
              className="text-xs"
            />
            <FieldError>{errors.productDescription}</FieldError>
          </Field>

          {/* Category */}
          <Field data-invalid={errors.productCategory ? true : undefined}>
            <FieldLabel htmlFor="productCategory">Category</FieldLabel>
            <CategoryCombobox
              value={state.productCategory}
              categories={categories}
              invalid={Boolean(errors.productCategory)}
              onChange={(value) => setField('productCategory', value)}
            />
            <FieldDescription>
              Pick an existing category or type a new one.
            </FieldDescription>
            <FieldError>{errors.productCategory}</FieldError>
          </Field>

          {/* Price + Stock */}
          <Field orientation="responsive">
            <Field data-invalid={errors.productPrice ? true : undefined}>
              <FieldLabel htmlFor="productPrice">Price (USD)</FieldLabel>
              <Input
                id="productPrice"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={state.productPrice}
                onChange={(event) => setField('productPrice', event.target.value)}
                placeholder="0.00"
                aria-invalid={errors.productPrice ? true : undefined}
                className="font-mono tabular-nums"
              />
              <FieldError>{errors.productPrice}</FieldError>
            </Field>
            <Field data-invalid={errors.productStock ? true : undefined}>
              <FieldLabel htmlFor="productStock">Stock</FieldLabel>
              <Input
                id="productStock"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                value={state.productStock}
                onChange={(event) => setField('productStock', event.target.value)}
                placeholder="0"
                aria-invalid={errors.productStock ? true : undefined}
                className="font-mono tabular-nums"
              />
              <FieldError>{errors.productStock}</FieldError>
            </Field>
          </Field>

          {/* Status — edit mode only */}
          {mode === 'edit' ? (
            <Field>
              <FieldLabel id="productStatus-label">Status</FieldLabel>
              <div
                role="radiogroup"
                aria-labelledby="productStatus-label"
                className="inline-flex w-fit border border-input bg-transparent p-0.5"
              >
                {STATUS_OPTIONS.map((status) => {
                  const active = state.productStatus === status
                  return (
                    <button
                      key={status}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setField('productStatus', status)}
                      className={cn(
                        'inline-flex h-7 items-center gap-1.5 px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {active ? (
                        <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} />
                      ) : null}
                      {STATUS_LABELS[status]}
                    </button>
                  )
                })}
              </div>
            </Field>
          ) : null}
        </FieldSet>

        {/* Tags */}
        <FieldSet>
          <FieldLegend>Tags</FieldLegend>
          <Field>
            <FieldLabel htmlFor="tag-input">Add a tag</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="tag-input"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault()
                    addTag()
                  }
                }}
                placeholder="audio, wireless, premium"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!tagDraft.trim()}
              >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                Add
              </Button>
            </div>
            {state.productTags.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {state.productTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="inline-flex size-3.5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <FieldDescription>No tags yet.</FieldDescription>
            )}
          </Field>
        </FieldSet>

        {/* Images */}
        <FieldSet>
          <FieldLegend>Images</FieldLegend>
          <Field>
            {state.productImages.length === 0 ? (
              <FieldDescription>
                No images added. The first image becomes the product thumbnail.
              </FieldDescription>
            ) : (
              <div className="flex flex-col gap-3">
                {state.productImages.map((image, index) => (
                  <ImageRow
                    key={index}
                    index={index}
                    url={image.url}
                    alt={image.alt}
                    error={errors[`images.${index}.url`]}
                    onChange={updateImage}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImage}
              className="mt-1 w-fit"
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
              Add image
            </Button>
          </Field>
        </FieldSet>
      </FieldGroup>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner data-icon="inline-start" /> : null}
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

// --- Category combobox ------------------------------------------------------
interface CategoryComboboxProps {
  value: string
  categories: string[]
  invalid: boolean
  onChange: (value: string) => void
}

function CategoryCombobox({ value, categories, invalid, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const listId = 'category-combobox-list'

  const showCreate = useMemo(() => {
    const trimmed = query.trim()
    return (
      trimmed.length > 0 &&
      !categories.some((category) => category.toLowerCase() === trimmed.toLowerCase())
    )
  }, [categories, query])

  const select = useCallback(
    (next: string) => {
      onChange(next)
      setQuery('')
      setOpen(false)
    },
    [onChange],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-controls={listId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={invalid ? true : undefined}
          className={cn(
            'flex h-8 w-full items-center justify-between gap-1.5 border border-input bg-transparent px-2.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20',
            !value && 'text-muted-foreground',
          )}
        >
          {value || 'Select or type a category'}
          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            size={16}
            strokeWidth={2}
            className="text-muted-foreground"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or add category…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList id={listId}>
            <CommandEmpty>No matching category.</CommandEmpty>
            {categories.length > 0 ? (
              <CommandGroup heading="Existing">
                {categories.map((category) => (
                  <CommandItem
                    key={category}
                    value={category}
                    onSelect={() => select(category)}
                  >
                    {category}
                    {value === category ? (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={14}
                        strokeWidth={2}
                        className="ml-auto"
                      />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {showCreate ? (
              <CommandGroup heading="Create new">
                <CommandItem value={`create-${query}`} onSelect={() => select(query.trim())}>
                  <HugeiconsIcon
                    icon={Add01Icon}
                    size={14}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  Use &ldquo;{query.trim()}&rdquo;
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// --- Image row --------------------------------------------------------------
interface ImageRowProps {
  index: number
  url: string
  alt: string
  error?: string
  onChange: (index: number, key: 'url' | 'alt', value: string) => void
  onRemove: (index: number) => void
}

function ImageRow({ index, url, alt, error, onChange, onRemove }: ImageRowProps) {
  // Track the URL that failed to load so editing it re-attempts the preview.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const trimmedUrl = url.trim()
  const showPreview = trimmedUrl.length > 0 && brokenUrl !== trimmedUrl

  return (
    <div className="flex items-start gap-3 border border-border bg-card p-2.5">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted text-muted-foreground">
        {showPreview ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied URLs
          <img
            src={trimmedUrl}
            alt={alt || 'Product image preview'}
            className="size-full object-cover"
            onError={() => setBrokenUrl(trimmedUrl)}
          />
        ) : (
          <HugeiconsIcon icon={Image02Icon} size={18} strokeWidth={2} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={`image-url-${index}`} className="sr-only">
            Image URL
          </FieldLabel>
          <Input
            id={`image-url-${index}`}
            value={url}
            onChange={(event) => onChange(index, 'url', event.target.value)}
            placeholder="https://images.example.com/photo.jpg"
            aria-invalid={error ? true : undefined}
            autoComplete="off"
          />
          <FieldError>{error}</FieldError>
        </Field>
        <Input
          aria-label={`Alt text for image ${index + 1}`}
          value={alt}
          onChange={(event) => onChange(index, 'alt', event.target.value)}
          placeholder="Alt text (optional)"
          autoComplete="off"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(index)}
        aria-label={`Remove image ${index + 1}`}
        className="text-muted-foreground hover:text-destructive"
      >
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
      </Button>
    </div>
  )
}
