import { useState, type SyntheticEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ingestSensor } from '@/features/sensors/api/ingest-sensor'
import { ApiError } from '@/shared/api/api-client'

interface ManualIngestDialogProps {
  sensorId: string
  sensorCode: string
  onSuccess: () => void
}

function createExample(sensorCode: string) {
  return JSON.stringify(
    [
      {
        sensorCode,
        ts: new Date().toISOString(),
        valueC: 21.4,
      },
    ],
    null,
    2,
  )
}

export function ManualIngestDialog({
  sensorId,
  sensorCode,
  onSuccess,
}: ManualIngestDialogProps) {
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState(() => createExample(sensorCode))
  const [isIngesting, setIsIngesting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage('')
    setError('')

    let parsedPayload: unknown

    try {
      parsedPayload = JSON.parse(payload)
    } catch {
      setError('El contenido no es un JSON válido.')
      return
    }

    setIsIngesting(true)

    try {
      const run = await ingestSensor(sensorId, parsedPayload)

      setMessage(
        run.recordsProcessed === 1
          ? 'Se ha añadido 1 lectura.'
          : `Se han añadido ${run.recordsProcessed} lecturas.`,
      )

      onSuccess()
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : 'No se ha podido completar la ingesta.',
      )
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen) {
          setMessage('')
          setError('')
          setPayload(createExample(sensorCode))
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        Ingestar datos
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ingesta manual</DialogTitle>
          <DialogDescription>
            Introduce un payload JSON en formato A o B para {sensorCode}.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium mx-1" htmlFor="manual-payload">
              Payload JSON
            </label>

            <textarea
              className="min-h-64 w-full resize-y rounded-md border bg-background px-3 py-2 font-mono text-sm"
              id="manual-payload"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              spellCheck={false}
              required
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Formato A: sensorCode, ts y valueC. Formato B: deviceId y
            data con time y temp.
          </p>

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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isIngesting}
              onClick={() => setOpen(false)}
            >
              Cerrar
            </Button>

            <Button type="submit" disabled={isIngesting}>
              {isIngesting ? 'Ingestando…' : 'Ingestar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
