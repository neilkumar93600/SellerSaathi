'use client'
import { useState, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Navbar
        user={user}
        profile={profile}
        onSignOut={signOut}
        onMenuToggle={() => setOpen((v) => !v)}
      />

      <div className="mx-auto flex w-full max-w-7xl gap-0 px-0 md:px-6">
        <Sidebar isOpen={open} onToggle={() => setOpen((v) => !v)} />
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
