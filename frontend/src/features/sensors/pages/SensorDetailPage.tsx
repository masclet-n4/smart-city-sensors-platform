import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { getSensor } from '@/features/sensors/api/get-sensor'
import { Button } from '@/components/ui/button'
import { HttpIngestButton } from '@/features/sensors/components/HttpIngestButton'
import { SensorReadings } from '@/features/sensors/components/SensorReadings'
import type { Sensor } from '@/features/sensors/model/sensor'
import { ApiError } from '@/shared/api/api-client'
import { ManualIngestDialog } from '@/features/sensors/components/ManualIngestDialog'

const typeLabels = {
  HTTP_POLL: 'HTTP',
  MANUAL_UPLOAD: 'Manual',
}

const statusLabels = {
  active: 'Activo',
  paused: 'Pausado',
}

export function SensorDetailPage() {
  const { id } = useParams<'id'>()
  const [sensor, setSensor] = useState<Sensor>()
  const [error, setError] = useState<'not-found' | 'general'>()
  const [readingsRefreshKey, setReadingsRefreshKey] = useState(0)

  function refreshReadings() {
    setReadingsRefreshKey((current) => current + 1)
  }

  useEffect(() => {
    if (!id) return

    let ignore = false

    getSensor(id)
      .then((result) => {
        if (!ignore) {
          setSensor(result)
        }
      })
      .catch((error) => {
        if (!ignore) {
          setError(
            error instanceof ApiError && error.status === 404
              ? 'not-found'
              : 'general',
          )
        }
      })

    return () => {
      ignore = true
    }
  }, [id])

  if (!id) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Sensor no encontrado</h1>
        <Link
          className="text-sm font-medium underline underline-offset-4"
          to="/sensors"
        >
          Volver a sensores
        </Link>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">
          {error === 'not-found'
            ? 'Sensor no encontrado'
            : 'No se ha podido cargar el sensor'}
        </h1>
        <Link
          className="text-sm font-medium underline underline-offset-4"
          to="/sensors"
        >
          Volver a sensores
        </Link>
      </section>
    )
  }

  if (!sensor) {
    return <p className="text-sm text-muted-foreground">Cargando sensor…</p>
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          to="/sensors"
        >
          ← Volver a sensores
        </Link>

        <div>
          <h1 className="text-2xl font-semibold">{sensor.name}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {sensor.sensorCode}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
        <div className="bg-background p-4">
          <dt className="text-sm text-muted-foreground">Tipo</dt>
          <dd className="mt-1 font-medium">{typeLabels[sensor.type]}</dd>
        </div>

        <div className="bg-background p-4">
          <dt className="text-sm text-muted-foreground">Estado</dt>
          <dd className="mt-1 font-medium">{statusLabels[sensor.status]}</dd>
        </div>

        <div className="col-span-2 bg-background p-4">
          <dt className="text-sm text-muted-foreground">URL</dt>
          <dd className="mt-1 break-all font-mono text-sm">
            {sensor.url ?? 'No aplica'}
          </dd>
        </div>
      </dl>

      {sensor.status === 'paused' ? (
        <div className="flex items-center gap-3">
          <Button type="button" disabled>
            {sensor.type === 'HTTP_POLL'
              ? 'Ingestar ahora'
              : 'Ingestar datos'}
          </Button>

          <p className="text-sm text-muted-foreground">
            Activa el sensor para realizar una ingesta.
          </p>
        </div>
      ) : sensor.type === 'HTTP_POLL' ? (
        <HttpIngestButton
          sensorId={sensor.id}
          onSuccess={refreshReadings}
        />
      ) : (
        <ManualIngestDialog
          sensorId={sensor.id}
          sensorCode={sensor.sensorCode}
          onSuccess={refreshReadings}
        />
      )}


      <SensorReadings
        sensorId={sensor.id}
        refreshKey={readingsRefreshKey}
      />
    </section>
  )
}
