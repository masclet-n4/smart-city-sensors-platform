import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ingestSensor } from '@/features/sensors/api/ingest-sensor'

interface HttpIngestButtonProps {
  sensorId: string
  onSuccess: () => void
}

export function HttpIngestButton({
  sensorId,
  onSuccess,
}: HttpIngestButtonProps) {
  const [isIngesting, setIsIngesting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleIngest() {
    setMessage('')
    setError('')
    setIsIngesting(true)

    try {
      const run = await ingestSensor(sensorId)
      setMessage(
        run.recordsProcessed === 1
          ? 'Se ha añadido 1 lectura.'
          : `Se han añadido ${run.recordsProcessed} lecturas.`,
      )
      onSuccess()
    } catch {
      setError('No se ha podido completar la ingesta.')
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        disabled={isIngesting}
        onClick={handleIngest}
      >
        {isIngesting ? 'Ingestando…' : 'Ingestar ahora'}
      </Button>

      {message && (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
