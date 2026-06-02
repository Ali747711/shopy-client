'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { HugeiconsIcon } from '@hugeicons/react'
import { ComputerIcon, Moon02Icon, Sun01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun01Icon },
  { value: 'system', label: 'System', icon: ComputerIcon },
  { value: 'dark', label: 'Dark', icon: Moon02Icon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Theme is unknown during SSR; wait for mount before marking one active to
  // avoid a hydration mismatch on the highlighted button.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  return (
    <div className="inline-flex items-center border border-border p-0.5" role="group" aria-label="Theme">
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.value
        return (
          <Button
            key={option.value}
            type="button"
            variant={active ? 'secondary' : 'ghost'}
            size="icon-sm"
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(!active && 'text-muted-foreground')}
          >
            <HugeiconsIcon icon={option.icon} strokeWidth={2} />
          </Button>
        )
      })}
    </div>
  )
}
