'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isApiError } from '@/lib/api'
import { loginInputSchema, useAuth } from '@/lib/auth'

export function LoginForm() {
  const { login, status } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') router.replace(redirectTo)
  }, [status, redirectTo, router])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const parsed = loginInputSchema.safeParse({
      userEmail: email.trim(),
      userPassword: password,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your details.')
      return
    }

    setSubmitting(true)
    try {
      await login(parsed.data)
      router.replace(redirectTo)
    } catch (err) {
      if (isApiError(err) && (err.status === 401 || err.status === 404)) {
        setError('Incorrect email or password.')
      } else if (isApiError(err)) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
      setSubmitting(false)
    }
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
        <label htmlFor="email" className="text-xs font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10"
          required
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
