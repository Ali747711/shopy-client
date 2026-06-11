import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthShell } from '@/components/auth/auth-shell'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = { title: 'Set new password — Shopy' }

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set new password"
      subtitle="Choose a strong password for your account."
      footer={
        <>
          Back to{' '}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
