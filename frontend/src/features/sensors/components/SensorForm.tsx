import { useState, type SyntheticEvent } from 'react'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import type {
  Sensor,
  SensorStatus,
  SensorType,
} from '@/features/sensors/model/sensor'

export interface SensorFormValues {
  name: string
  sensorCode: string
  type: SensorType
  status: SensorStatus
  url?: string
}

interface SensorFormProps {
  sensor?: Sensor
  submitLabel: string
  submittingLabel: string
  isSubmitting: boolean
  error: string
  onSubmit: (values: SensorFormValues) => Promise<void>
}

export function SensorForm({
  sensor,
  submitLabel,
  submittingLabel,
  isSubmitting,
  error,
  onSubmit,
}: SensorFormProps) {
  const [type, setType] = useState<SensorType>(
    sensor?.type ?? 'MANUAL_UPLOAD',
  )

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    await onSubmit({
      name: String(form.get('name')),
      sensorCode: String(form.get('sensorCode')),
      type,
      status: String(form.get('status')) as SensorStatus,
      ...(type === 'HTTP_POLL'
        ? { url: String(form.get('url')) }
        : {}),
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={`name-${sensor?.id ?? 'new'}`}>
          Nombre
        </label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
          id={`name-${sensor?.id ?? 'new'}`}
          name="name"
          defaultValue={sensor?.name}
          minLength={3}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={`code-${sensor?.id ?? 'new'}`}>
          Código
        </label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
          id={`code-${sensor?.id ?? 'new'}`}
          name="sensorCode"
          defaultValue={sensor?.sensorCode}
          minLength={3}
          maxLength={80}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`type-${sensor?.id ?? 'new'}`}>
            Tipo
          </label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2"
            id={`type-${sensor?.id ?? 'new'}`}
            name="type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as SensorType)
            }
          >
            <option value="MANUAL_UPLOAD">Manual</option>
            <option value="HTTP_POLL">HTTP</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`status-${sensor?.id ?? 'new'}`}>
            Estado
          </label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2"
            id={`status-${sensor?.id ?? 'new'}`}
            name="status"
            defaultValue={sensor?.status ?? 'active'}
          >
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
          </select>
        </div>
      </div>

      {type === 'HTTP_POLL' && (
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`url-${sensor?.id ?? 'new'}`}>
            URL
          </label>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            id={`url-${sensor?.id ?? 'new'}`}
            name="url"
            type="url"
            defaultValue={sensor?.url ?? ''}
            placeholder="https://example.com/temperature"
            required
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}
