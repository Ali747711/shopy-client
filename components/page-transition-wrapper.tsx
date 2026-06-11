'use client'

// React 19 ships ViewTransition as a named export from 'react'.
// We wrap every page in it so route navigations get a fade + lift entrance.
// The wrapper itself is a client component so it can respond to navigation
// transitions; the children remain server components.
import { ViewTransition } from 'react'

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  )
}
