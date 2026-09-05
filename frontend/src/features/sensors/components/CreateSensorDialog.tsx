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
import { createSensor } from '@/features/sensors/api/create-sensor'
import {
  SensorForm,
  type SensorFormValues,
} from '@/features/sensors/components/SensorForm'
import type { Sensor } from '@/features/sensors/model/sensor'
import { ApiError } from '@/shared/api/api-client'

interface CreateSensorDialogProps {
  onCreated: (sensor: Sensor) => void
}

export function CreateSensorDialog({
  onCreated,
}: CreateSensorDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setError('')
    }
  }

  async function handleSubmit(values: SensorFormValues) {
    setError('')
    setIsSubmitting(true)

    try {
      const sensor = await createSensor(values)
      onCreated(sensor)
      setOpen(false)
    } catch (error) {
      setError(
        error instanceof ApiError && error.status === 409
          ? 'Ya existe un sensor con ese código.'
          : 'No se ha podido crear el sensor. Revisa los datos.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        Nuevo sensor
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo sensor</DialogTitle>
          <DialogDescription>
            Configura un sensor de temperatura.
          </DialogDescription>
        </DialogHeader>

        <SensorForm
          submitLabel="Crear sensor"
          submittingLabel="Creando…"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
