import { useState, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { ApiError, apiClient } from '@/shared/api/api-client'

interface LoginPageProps {
  onLogin: () => Promise<void>
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))

    setError('')
    setIsSubmitting(true)

    try {
      await apiClient<{ message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      await onLogin()
      navigate('/sensors', { replace: true })
    } catch (error) {
      setError(
        error instanceof ApiError && error.status === 401
          ? 'El email o la contraseña no son correctos.'
          : 'No se ha podido iniciar sesión. Inténtalo de nuevo.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="w-full max-w-sm space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Smart City</h1>
          <p className="text-muted-foreground">
            Inicia sesión para gestionar los sensores.
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-md border bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              className="w-full rounded-md border bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Button>
        </form>
      </section>
    </main>
  )
}
