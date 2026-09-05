import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { getIngestions } from '@/features/ingestions/api/get-ingestions'
import { getSensors } from '@/features/sensors/api/get-sensors'
import type { IngestionRun } from '@/features/sensors/model/ingestion-run'
import { ingestSensor } from '@/features/sensors/api/ingest-sensor'
import type { Sensor } from '@/features/sensors/model/sensor'
import { ManualIngestDialog } from '@/features/sensors/components/ManualIngestDialog'

interface IngestionTargetProps {
  sensors: Sensor[]
  onIngested: () => void
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const LIMIT = 10

const statusBadge = {
  running:
    'inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground',
  success:
    'inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  error:
    'inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400',
}

function IngestionTarget({
  sensors,
  onIngested,
}: IngestionTargetProps) {
  const [selectedSensorId, setSelectedSensorId] = useState('')
  const [isIngesting, setIsIngesting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedSensor = sensors.find(
    (sensor) => sensor.id === selectedSensorId,
  )

  async function handleIngest() {
    if (!selectedSensor || selectedSensor.type !== 'HTTP_POLL') {
      return
    }

    setMessage('')
    setError('')
    setIsIngesting(true)

    try {
      const run = await ingestSensor(selectedSensor.id)

      setMessage(
        run.recordsProcessed === 1
          ? 'Se ha añadido 1 lectura.'
          : `Se han añadido ${run.recordsProcessed} lecturas.`,
      )

      onIngested()
    } catch {
      setError('No se ha podido completar la ingesta.')
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-background p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium" htmlFor="ingestion-sensor">
            Sensor
          </label>

          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            id="ingestion-sensor"
            value={selectedSensorId}
            onChange={(event) => {
              setSelectedSensorId(event.target.value)
              setMessage('')
              setError('')
            }}
          >
            <option value="">Selecciona un sensor</option>

            {sensors.map((sensor) => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.sensorCode} — {sensor.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSensor?.type === 'MANUAL_UPLOAD' &&
        selectedSensor.status === 'active' ? (
          <ManualIngestDialog
            sensorId={selectedSensor.id}
            sensorCode={selectedSensor.sensorCode}
            onSuccess={onIngested}
          />
        ) : (
            <div className="py-1">

          <Button
            className="whitespace-nowrap "
            type="button"
            disabled={
              !selectedSensor ||
              selectedSensor.type !== 'HTTP_POLL' ||
              selectedSensor.status === 'paused' ||
              isIngesting
            }
            onClick={handleIngest}
          >
            {isIngesting ? 'Ingestando…' : 'Ingestar ahora'}
              </Button>
            </div>
        )}
      </div>

      {selectedSensor?.status === 'paused' && (
        <p className="text-sm text-muted-foreground">
          Activa el sensor para realizar una ingesta.
        </p>
      )}

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

export function IngestionsPage() {
  const [runs, setRuns] = useState<IngestionRun[]>()
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sensors, setSensors] = useState<Sensor[]>()
  const [error, setError] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  function fetchRuns(page: number) {
    getIngestions(page, LIMIT)
      .then((res) => {
        setRuns(res.data)
        setTotal(res.total)
      })
      .catch(() => setError(true))
  }

  useEffect(() => {
    let ignore = false

    Promise.all([getIngestions(1, LIMIT), getSensors(1, 100)])
      .then(([runsRes, sensorsRes]) => {
        if (!ignore) {
          setRuns(runsRes.data)
          setTotal(runsRes.total)
          setSensors(sensorsRes.data)
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

  const sensorCodes = new Map(
    sensors?.map((sensor) => [sensor.id, sensor.sensorCode]),
  )

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Ingestas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico de ejecuciones de ingesta.
        </p>
      </header>
      {sensors && (
        <IngestionTarget
          sensors={sensors}
          onIngested={() => {
            setPage(1)
            fetchRuns(1)
          }}
        />
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          No se ha podido cargar el histórico de ingestas.
        </p>
      ) : runs === undefined || sensors === undefined ? (
        <p className="text-sm text-muted-foreground">
          Cargando ingestas…
        </p>
      ) : runs.length === 0 ? (
        <div className="rounded-lg border bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no se ha ejecutado ninguna ingesta.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Sensor</th>
                <th className="px-4 py-3 font-medium">Inicio</th>
                <th className="px-4 py-3 font-medium">Fin</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">
                  Registros
                </th>
                <th className="px-4 py-3 font-medium">Detalle</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {runs.map((run) => (
                <tr key={run.id}>
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      className="hover:underline"
                      to={`/sensors/${run.sensorId}`}
                    >
                      {sensorCodes.get(run.sensorId) ?? run.sensorId}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <time dateTime={run.startedAt}>
                      {dateFormatter.format(new Date(run.startedAt))}
                    </time>
                  </td>

                  <td className="px-4 py-3">
                    {run.finishedAt ? (
                      <time dateTime={run.finishedAt}>
                        {dateFormatter.format(new Date(run.finishedAt))}
                      </time>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className={statusBadge[run.status]}>
                      {run.status === 'running'
                        ? 'En proceso'
                        : run.status === 'success'
                          ? 'Correcta'
                          : 'Error'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {run.recordsProcessed}
                  </td>

                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    {run.errorMessage ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} ingestas — página {page} de {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => {
                  const prev = page - 1
                  setPage(prev)
                  fetchRuns(prev)
                }}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => {
                  const next = page + 1
                  setPage(next)
                  fetchRuns(next)
                }}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
    </section>
  )
}
