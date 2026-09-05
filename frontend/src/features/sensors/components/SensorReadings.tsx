import { useEffect, useState } from 'react'

import { getReadings } from '@/features/sensors/api/get-readings'
import { Button } from '@/components/ui/button'
import type { TemperatureReading } from '@/features/sensors/model/temperature-reading'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const temperatureFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

interface SensorReadingsProps {
  sensorId: string
  refreshKey: number
}

export function SensorReadings({
  sensorId,
  refreshKey,
}: SensorReadingsProps) {
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [result, setResult] = useState<{
    key: string
    readings?: TemperatureReading[]
    error?: boolean
  }>()
  const requestKey = `${sensorId}:${limit}:${offset}:${refreshKey}`

  // Reset offset when refreshKey changes (new ingestion)
  useEffect(() => {
    setOffset(0)
  }, [refreshKey])

  useEffect(() => {
    let ignore = false

    getReadings(sensorId, limit, offset)
      .then((res) => {
        if (!ignore) {
          setResult({ key: requestKey, readings: res.data })
          setTotal(res.total)
        }
      })
      .catch(() => {
        if (!ignore) {
          setResult({ key: requestKey, error: true })
        }
      })

    return () => {
      ignore = true
    }
  }, [sensorId, limit, offset, refreshKey, requestKey])

  const readings = result?.key === requestKey ? result.readings : undefined
  const error = result?.key === requestKey && result.error
  const hasPrev = offset > 0
  const hasNext = offset + limit < total

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Últimas lecturas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Temperaturas registradas de más reciente a más antigua.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          Mostrar
          <select
            className="rounded-md border bg-background px-3 py-2"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </header>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          No se han podido cargar las lecturas.
        </p>
      ) : readings === undefined ? (
        <p className="text-sm text-muted-foreground">
          Cargando lecturas…
        </p>
      ) : readings.length === 0 ? (
        <div className="rounded-lg border bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Este sensor todavía no tiene lecturas.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha y hora</th>
                <th className="px-4 py-3 text-right font-medium">
                  Temperatura
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {readings.map((reading) => (
                <tr key={reading.id}>
                  <td className="px-4 py-3">
                    <time dateTime={reading.timestamp}>
                      {dateFormatter.format(new Date(reading.timestamp))}
                    </time>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {temperatureFormatter.format(reading.valueC)} °C
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} lecturas — del {offset + 1} al{' '}
              {Math.min(offset + limit, total)}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!hasPrev}
                onClick={() =>
                  setOffset((o) => Math.max(0, o - limit))
                }
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={!hasNext}
                onClick={() => setOffset((o) => o + limit)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
    </section>
  )
}
