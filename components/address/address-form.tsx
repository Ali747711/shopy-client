'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRIES, type AddressFields } from '@/lib/addresses'
import { cn } from '@/lib/utils'

interface AddressFormProps {
  value: AddressFields
  errors: Partial<Record<keyof AddressFields, string>>
  onChange: (patch: Partial<AddressFields>) => void
  /** Prefix htmlFor/input ids so two forms can coexist on one page. */
  idPrefix?: string
}

export function AddressForm({ value, errors, onChange, idPrefix = 'addr' }: AddressFormProps) {
  const id = (field: keyof AddressFields) => `${idPrefix}-${field}`

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Full name */}
      <AddressField label="Full name" htmlFor={id('fullName')} error={errors.fullName}>
        <Input
          id={id('fullName')}
          type="text"
          required
          placeholder="John Doe"
          value={value.fullName}
          aria-invalid={!!errors.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
        />
      </AddressField>

      {/* Phone */}
      <AddressField label="Phone number" htmlFor={id('phone')} error={errors.phone}>
        <Input
          id={id('phone')}
          type="tel"
          required
          placeholder="+1 (555) 000-0000"
          value={value.phone}
          aria-invalid={!!errors.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </AddressField>

      {/* Address line 1 — full width */}
      <AddressField
        label="Address line 1"
        htmlFor={id('address1')}
        error={errors.address1}
        className="sm:col-span-2"
      >
        <Input
          id={id('address1')}
          type="text"
          required
          placeholder="123 Main St"
          value={value.address1}
          aria-invalid={!!errors.address1}
          onChange={(e) => onChange({ address1: e.target.value })}
        />
      </AddressField>

      {/* Address line 2 — full width */}
      <AddressField
        label="Address line 2"
        htmlFor={id('address2')}
        error={errors.address2}
        className="sm:col-span-2"
        optional
      >
        <Input
          id={id('address2')}
          type="text"
          placeholder="Apt, suite, unit, etc."
          value={value.address2 ?? ''}
          aria-invalid={!!errors.address2}
          onChange={(e) => onChange({ address2: e.target.value })}
        />
      </AddressField>

      {/* City + State — side by side */}
      <AddressField label="City" htmlFor={id('city')} error={errors.city}>
        <Input
          id={id('city')}
          type="text"
          required
          placeholder="New York"
          value={value.city}
          aria-invalid={!!errors.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
      </AddressField>

      <AddressField label="State / Province" htmlFor={id('state')} error={errors.state}>
        <Input
          id={id('state')}
          type="text"
          required
          placeholder="NY"
          value={value.state}
          aria-invalid={!!errors.state}
          onChange={(e) => onChange({ state: e.target.value })}
        />
      </AddressField>

      {/* Postal code + Country — side by side */}
      <AddressField label="Postal code" htmlFor={id('postalCode')} error={errors.postalCode}>
        <Input
          id={id('postalCode')}
          type="text"
          required
          placeholder="10001"
          value={value.postalCode}
          aria-invalid={!!errors.postalCode}
          onChange={(e) => onChange({ postalCode: e.target.value })}
        />
      </AddressField>

      <AddressField label="Country" htmlFor={id('country')} error={errors.country}>
        <Select value={value.country} onValueChange={(country) => onChange({ country })}>
          <SelectTrigger
            id={id('country')}
            className={cn(
              'w-full',
              errors.country && 'border-destructive ring-1 ring-destructive/20',
            )}
            aria-invalid={!!errors.country}
          >
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AddressField>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Field wrapper — label + input + error                             */
/* ------------------------------------------------------------------ */

function AddressField({
  label,
  htmlFor,
  error,
  optional,
  className,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="font-medium">
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
