'use client'

import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Location01Icon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

import { useTranslation } from 'react-i18next'

import { AddressCard } from '@/components/address/address-card'
import { AddressDialog } from '@/components/address/address-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { isApiError } from '@/lib/api'
import {
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  type SavedAddress,
} from '@/lib/addresses'

export default function AddressesPage() {
  const { t } = useTranslation()

  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null)

  // Add/edit dialog: `editing === undefined` means closed.
  const [editing, setEditing] = useState<SavedAddress | null | undefined>(undefined)
  // Delete confirm dialog target.
  const [deleteTarget, setDeleteTarget] = useState<SavedAddress | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    listAddresses()
      .then((result) => {
        if (active) setAddresses(result)
      })
      .catch(() => {
        if (active) setAddresses([])
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSetDefault(id: string) {
    try {
      const updated = await setDefaultAddress(id)
      setAddresses(updated)
      toast.success(t('account.addresses.defaultUpdated'))
    } catch (err) {
      toast.error(isApiError(err) ? err.message : t('account.addresses.saveFailed'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const updated = await deleteAddress(deleteTarget._id)
      setAddresses(updated)
      setDeleteTarget(null)
      toast.success(t('account.addresses.deleted'))
    } catch (err) {
      toast.error(isApiError(err) ? err.message : t('account.addresses.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t('account.addresses.title')}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{t('account.addresses.subtitle')}</p>
        </div>
        {addresses && addresses.length > 0 && (
          <Button size="sm" onClick={() => setEditing(null)}>
            {t('account.addresses.add')}
          </Button>
        )}
      </header>

      {addresses === null ? (
        <p className="text-xs text-muted-foreground">{t('account.addresses.loading')}</p>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-dashed border-border py-12 text-center">
          <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="size-7 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{t('account.addresses.empty')}</p>
          <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
            {t('account.addresses.add')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onSetDefault={() => handleSetDefault(address._id)}
              onEdit={() => setEditing(address)}
              onDelete={() => setDeleteTarget(address)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit dialog. Remount on target change so local state re-seeds. */}
      <AddressDialog
        key={editing === undefined ? 'closed' : (editing?._id ?? 'new')}
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
        editing={editing ?? null}
        onSaved={(next) => setAddresses(next)}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('account.addresses.deleteTitle')}</DialogTitle>
            <DialogDescription>{t('account.addresses.deleteDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                {t('account.addresses.cancel')}
              </Button>
            </DialogClose>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? t('account.addresses.deleting') : t('account.addresses.confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
