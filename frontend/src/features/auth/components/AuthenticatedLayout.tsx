import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'

import { Button } from '@/components/ui/button'
import { logout } from '@/features/auth/api/logout'
import type { CurrentUser } from '@/features/auth/model/session'
import { ThemeToggle } from '@/shared/components/ThemeToggle'


interface AuthenticatedLayoutProps {
  user: CurrentUser
  onLogout: () => void
}

const navigationClass = ({ isActive }: { isActive: boolean }) =>
  [
    'text-sm font-medium transition-colors',
    isActive
      ? 'text-foreground'
      : 'text-muted-foreground hover:text-foreground',
  ].join(' ')

export function AuthenticatedLayout({
  user,
  onLogout,
}: AuthenticatedLayoutProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    setError('')
    setIsLoggingOut(true)

    try {
      await logout()
      onLogout()
    } catch {
      setError('No se ha podido cerrar la sesión.')
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <span className="font-semibold">Smart City</span>

          <nav className="flex items-center gap-6" aria-label="Principal">
            <NavLink className={navigationClass} to="/sensors">
              Sensores
            </NavLink>
            <NavLink className={navigationClass} to="/ingestions">
              Ingestas
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {isLoggingOut ? 'Saliendo…' : 'Salir'}
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <p
          className="mx-auto mt-4 max-w-6xl px-6 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
