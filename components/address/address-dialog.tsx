'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { AddressForm } from '@/components/address/address-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isApiError } from '@/lib/api'
import {
  addAddress,
  addressInputSchema,
  EMPTY_ADDRESS,
  updateAddress,
  type AddressFields,
  type SavedAddress,
} from '@/lib/addresses'

type AddressErrors = Partial<Record<keyof AddressFields, string>>

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The address being edited, or null when adding a new one. */
  editing: SavedAddress | null
  /** Called with the fresh address list after a successful save. */
  onSaved: (addresses: SavedAddress[]) => void
}

export function AddressDialog({ open, onOpenChange, editing, onSaved }: AddressDialogProps) {
  const { t } = useTranslation()

  const [fields, setFields] = useState<AddressFields>(EMPTY_ADDRESS)
  const [label, setLabel] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [errors, setErrors] = useState<AddressErrors>({})
  const [saving, setSaving] = useState(false)

  // Seed local state whenever the dialog opens. Keyed by `editing?._id` + `open`
  // through the `key` prop set by the parent, so this initializer runs fresh.
  const seedFrom = editing
  const [seeded, setSeeded] = useState(false)
  if (open && !seeded) {
    if (seedFrom) {
      setFields({
        fullName: seedFrom.fullName,
        phone: seedFrom.phone,
        address1: seedFrom.address1,
        address2: seedFrom.address2 ?? '',
        city: seedFrom.city,
        state: seedFrom.state,
        postalCode: seedFrom.postalCode,
        country: seedFrom.country,
      })
      setLabel(seedFrom.label ?? '')
      setIsDefault(seedFrom.isDefault)
    } else {
      setFields(EMPTY_ADDRESS)
      setLabel('')
      setIsDefault(false)
    }
    setErrors({})
    setSeeded(true)
  }
  if (!open && seeded) setSeeded(false)

  const updateFields = (patch: Partial<AddressFields>) => {
    setFields((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(patch)) delete next[key as keyof AddressFields]
      return next
    })
  }

  const handleSave = async () => {
    const input = {
      ...fields,
      address2: fields.address2?.trim() || undefined,
      label: label.trim() || undefined,
      isDefault,
    }
    const result = addressInputSchema.safeParse(input)
    if (!result.success) {
      const fieldErrors: AddressErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AddressFields | undefined
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      const addresses = editing
        ? await updateAddress(editing._id, result.data)
        : await addAddress(result.data)
      onSaved(addresses)
      onOpenChange(false)
      toast.success(editing ? t('account.addresses.updated') : t('account.addresses.added'))
    } catch (err) {
      toast.error(isApiError(err) ? err.message : t('account.addresses.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? t('account.addresses.editTitle') : t('account.addresses.addTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <AddressForm value={fields} errors={errors} onChange={updateFields} idPrefix="dialog" />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dialog-label" className="font-medium">
              {t('account.addresses.label')}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="dialog-label"
              type="text"
              placeholder={t('account.addresses.labelPlaceholder')}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <Label className="cursor-pointer font-medium">
            <Checkbox
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            {t('account.addresses.setAsDefault')}
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            {t('account.addresses.cancel')}
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? t('account.addresses.saving') : t('account.addresses.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
