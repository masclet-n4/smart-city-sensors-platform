import { useState } from 'react'

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
import { deleteSensor } from '@/features/sensors/api/delete-sensor'
import type { Sensor } from '@/features/sensors/model/sensor'

interface DeleteSensorDialogProps {
  sensor: Sensor
  onDeleted: (id: string) => void
}

export function DeleteSensorDialog({
  sensor,
  onDeleted,
}: DeleteSensorDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setError('')
    setIsDeleting(true)

    try {
      await deleteSensor(sensor.id)
      onDeleted(sensor.id)
      setOpen(false)
    } catch {
      setError('No se ha podido eliminar el sensor.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen) {
          setError('')
        }
      }}
    >
      <DialogTrigger
        render={<Button variant="destructive" size="sm" />}
      >
        Eliminar
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar sensor</DialogTitle>
          <DialogDescription>
            Se eliminará “{sensor.name}” junto con todas sus lecturas e
            ingestas. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? 'Eliminando…' : 'Eliminar sensor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
