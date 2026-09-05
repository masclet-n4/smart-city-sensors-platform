import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AuthenticatedLayout } from '@/features/auth/components/AuthenticatedLayout'
import { SensorsPage } from '@/features/sensors/pages/SensorsPage'
import { SensorDetailPage } from '@/features/sensors/pages/SensorDetailPage'
import { IngestionsPage } from '@/features/ingestions/pages/IngestionsPage'




import {
  getCurrentUser,
  type CurrentUser,
} from '@/features/auth/model/session.js'
import { setUnauthorizedHandler } from '@/shared/api/api-client'


function App() {
  const [user, setUser] = useState<CurrentUser | null>()
  const [error, setError] = useState(false)

  async function refreshUser() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }


  useEffect(() => {
    let ignore = false

    getCurrentUser()
      .then((currentUser) => {
        if (!ignore) {
          setUser(currentUser)
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(true)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    return setUnauthorizedHandler(() => {
      setUser(null)
    })
  }, [])


  if (error) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p role="alert">No se ha podido comprobar la sesión.</p>
      </main>
    )
  }

  if (user === undefined) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p>Comprobando sesión…</p>
      </main>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/sensors" replace />
          ) : (
            <LoginPage onLogin={refreshUser} />
          )
        }
      />

      {user && (
        <Route
          element={
            <AuthenticatedLayout
              user={user}
              onLogout={() => setUser(null)}
            />
          }
        >
          <Route path="/sensors" element={<SensorsPage />} />
          <Route path="/sensors/:id" element={<SensorDetailPage />} />
          <Route path="/ingestions" element={<IngestionsPage />} />

        </Route>
      )}

      <Route
        path="*"
        element={<Navigate to={user ? '/sensors' : '/login'} replace />}
      />
    </Routes>
  )

}

export default App
