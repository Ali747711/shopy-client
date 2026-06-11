'use client'

import { useState } from 'react'
import { z } from 'zod'

import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const emailSchema = z.string().email('Please enter a valid email address.')

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={40}
          strokeWidth={1.5}
          className="text-primary"
        />
        <h2 className="font-heading text-base font-semibold tracking-tight">
          Check your inbox
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          If an account exists with that email, we&apos;ve sent a reset link.
          Check your spam folder too.
        </p>
      </div>
    )
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const parsed = emailSchema.safeParse(email.trim())
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your email.')
      return
    }

    setSubmitting(true)
    // Simulate network delay — no backend endpoint exists yet
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-email" className="text-xs font-medium">
          Email
        </label>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10"
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
        {submitting ? 'Sending...' : 'Send reset link'}
      </Button>
    </form>
  )
}
