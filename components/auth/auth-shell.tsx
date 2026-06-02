import Link from 'next/link'

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="size-3 bg-primary" />
          <span className="font-heading text-base font-semibold tracking-tight">shopy</span>
        </Link>
        <div className="border border-border bg-card p-6 ring-1 ring-foreground/5">
          <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{footer}</p>
      </div>
    </main>
  )
}
