import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateSensor } from '@/features/sensors/api/update-sensor'
import {
  SensorForm,
  type SensorFormValues,
} from '@/features/sensors/components/SensorForm'
import type { Sensor } from '@/features/sensors/model/sensor'
import { ApiError } from '@/shared/api/api-client'

interface EditSensorDialogProps {
  sensor: Sensor
  onUpdated: (sensor: Sensor) => void
}

export function EditSensorDialog({
  sensor,
  onUpdated,
}: EditSensorDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(values: SensorFormValues) {
    setError('')
    setIsSubmitting(true)

    try {
      const updatedSensor = await updateSensor(sensor.id, values)
      onUpdated(updatedSensor)
      setOpen(false)
    } catch (error) {
      setError(
        error instanceof ApiError && error.status === 409
          ? 'Ya existe un sensor con ese código.'
          : 'No se ha podido actualizar el sensor. Revisa los datos.',
      )
    } finally {
      setIsSubmitting(false)
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
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Editar
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar sensor</DialogTitle>
          <DialogDescription>
            Modifica la configuración del sensor.
          </DialogDescription>
        </DialogHeader>

        <SensorForm
          sensor={sensor}
          submitLabel="Guardar cambios"
          submittingLabel="Guardando…"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
