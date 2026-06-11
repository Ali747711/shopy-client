'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

// We store the deferred prompt in a ref so we can trigger it from the toast.
// The `BeforeInstallPromptEvent` is not in lib.dom.d.ts, so we type it locally.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaRegister() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Service workers are only supported in secure contexts (https or localhost).
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failure is non-fatal — the app still works without it.
    })

    const handleInstallPrompt = (e: Event) => {
      // Prevent the browser's default mini-infobar from appearing.
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent

      // Show a dismissible install nudge via sonner.
      toast('Install Shopy', {
        description: 'Add to your home screen for the best experience.',
        duration: Infinity,
        action: {
          label: 'Install',
          onClick: async () => {
            const prompt = deferredPrompt.current
            if (!prompt) return

            await prompt.prompt()
            const { outcome } = await prompt.userChoice

            if (outcome === 'accepted') {
              deferredPrompt.current = null
              toast.success('Shopy installed!')
            }
          },
        },
        cancel: {
          label: 'Dismiss',
          onClick: () => {
            deferredPrompt.current = null
          },
        },
      })
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }
  }, [])

  // This component renders nothing — it's a pure side-effect registration.
  return null
}
