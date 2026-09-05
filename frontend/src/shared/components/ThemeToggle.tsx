import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  function toggleTheme() {
    const nextIsDark = !isDark

    document.documentElement.classList.toggle('dark', nextIsDark)
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
    setIsDark(nextIsDark)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
