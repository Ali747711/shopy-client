'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon, Logout01Icon } from '@hugeicons/core-free-icons'
import { z } from 'zod'
import { toast } from 'sonner'

import { useTranslation } from 'react-i18next'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'

const profileSchema = z.object({
  userName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60),
  userEmail: z.string().email('Enter a valid email address.'),
})

export default function AccountSettingsPage() {
  const { t } = useTranslation()
  const { user, logout, updateUser } = useAuth()
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.userName ?? '')
  const [email, setEmail] = useState(user?.userEmail ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const onSignOut = async () => {
    await logout()
    router.push('/')
  }

  const startEditing = () => {
    setName(user?.userName ?? '')
    setEmail(user?.userEmail ?? '')
    setErrors({})
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setErrors({})
  }

  const saveProfile = () => {
    const result = profileSchema.safeParse({ userName: name, userEmail: email })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    updateUser({ userName: result.data.userName, userEmail: result.data.userEmail })
    setEditing(false)
    setSaving(false)
    toast.success('Profile updated for this session.', {
      description: 'Server-side persistence will be available soon.',
    })
  }

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'
  const prefs = user?.userPreferences

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('account.settings')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('account.settingsDesc')}</p>
      </header>

      <Section
        title={t('account.title')}
        action={
          !editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-3.5" />
              Edit
            </button>
          ) : null
        }
      >
        {editing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-name" className="font-medium">
                Name
              </Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.userName}
                className="h-10"
              />
              {errors.userName && (
                <p className="text-xs text-destructive">{errors.userName}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-email" className="font-medium">
                Email
              </Label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.userEmail}
                className="h-10"
              />
              {errors.userEmail && (
                <p className="text-xs text-destructive">{errors.userEmail}</p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Field label="Name" value={user?.userName ?? '—'} />
            <Field label="Email" value={user?.userEmail ?? '—'} />
            <Field label="Role" value={user?.userRole ?? '—'} />
            <Field label="Member since" value={joined} />
          </>
        )}
      </Section>

      <Section title={t('account.preferences')}>
        <Field
          label="Favorite categories"
          value={prefs?.categories?.length ? prefs.categories.join(', ') : 'None set'}
        />
        <Field label="Price sensitivity" value={prefs?.priceSensitivity ?? 'Not set'} />
      </Section>

      <Section title={t('account.appearance')}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </Section>

      <Section title={t('account.accountActions')}>
        <Button variant="outline" size="sm" onClick={onSignOut} className="w-fit">
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} data-icon="inline-start" />
          {t('auth.signOut')}
        </Button>
      </Section>
    </div>
  )
}

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border border-border bg-card p-5 ring-1 ring-foreground/5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  )
}
