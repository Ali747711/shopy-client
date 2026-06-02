'use client'

import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Logout01Icon } from '@hugeicons/core-free-icons'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

export default function AccountSettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const onSignOut = async () => {
    await logout()
    router.push('/')
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
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">Your account details and preferences.</p>
      </header>

      <Section title="Account">
        <Field label="Name" value={user?.userName ?? '—'} />
        <Field label="Email" value={user?.userEmail ?? '—'} />
        <Field label="Role" value={user?.userRole ?? '—'} />
        <Field label="Member since" value={joined} />
        <p className="pt-1 text-[11px] text-muted-foreground">
          Profile editing isn&apos;t available yet.
        </p>
      </Section>

      <Section title="Preferences">
        <Field
          label="Favorite categories"
          value={prefs?.categories?.length ? prefs.categories.join(', ') : 'None set'}
        />
        <Field label="Price sensitivity" value={prefs?.priceSensitivity ?? 'Not set'} />
      </Section>

      <Section title="Appearance">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </Section>

      <Section title="Account actions">
        <Button variant="outline" size="sm" onClick={onSignOut} className="w-fit">
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} data-icon="inline-start" />
          Sign out
        </Button>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card p-5 ring-1 ring-foreground/5">
      <h2 className="font-heading text-sm font-semibold">{title}</h2>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  )
}
