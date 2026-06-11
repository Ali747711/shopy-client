'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, PinLocation01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type SavedAddress } from '@/lib/addresses'
import { cn } from '@/lib/utils'

interface AddressCardProps {
  address: SavedAddress
  selectable?: boolean
  selected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSetDefault?: () => void
}

export function AddressCard({
  address,
  selectable,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const { t } = useTranslation()

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {address.label && (
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {address.label}
            </p>
          )}
          <p className="text-sm font-medium">{address.fullName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {address.isDefault && <Badge variant="secondary">Default</Badge>}
          {selectable && selected && (
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4 text-primary" />
          )}
        </div>
      </div>

      <address className="mt-2 text-xs not-italic leading-relaxed text-muted-foreground">
        {address.address1}
        {address.address2 ? `, ${address.address2}` : ''}
        <br />
        {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
        <br />
        {address.country}
        <br />
        {address.phone}
      </address>
    </>
  )

  if (selectable) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(
          'flex w-full flex-col border bg-card p-4 text-left transition-colors',
          selected
            ? 'border-primary ring-1 ring-primary/30'
            : 'border-border hover:border-foreground/25',
        )}
      >
        {body}
      </button>
    )
  }

  const hasActions = !!onEdit || !!onDelete || (!!onSetDefault && !address.isDefault)

  return (
    <div className="flex flex-col border border-border bg-card p-4 ring-1 ring-foreground/5">
      {body}
      {hasActions && (
        <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
          {onSetDefault && !address.isDefault && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onSetDefault}
                  className="grid size-7 place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <HugeiconsIcon icon={PinLocation01Icon} strokeWidth={2} className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Set as default</TooltipContent>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onEdit}
                  className="grid size-7 place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Edit</TooltipContent>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onDelete}
                  className="grid size-7 place-items-center text-destructive transition-colors hover:bg-destructive/10"
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Delete</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  )
}
