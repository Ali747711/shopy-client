'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const parsed = resetSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your details.')
      return
    }

    setSubmitting(true)
    // No backend endpoint — show toast and reset
    setTimeout(() => {
      setSubmitting(false)
      toast('Password reset is not available yet.')
    }, 400)
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
        <label htmlFor="new-password" className="text-xs font-medium">
          New password
        </label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="text-xs font-medium">
          Confirm password
        </label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="h-10"
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
        {submitting ? 'Updating...' : 'Update password'}
      </Button>
    </form>
  )
}
