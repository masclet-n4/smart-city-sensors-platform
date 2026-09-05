import { useEffect, useState } from 'react'

import { getSensors } from '@/features/sensors/api/get-sensors'
import type { Sensor } from '@/features/sensors/model/sensor'
import { CreateSensorDialog } from '@/features/sensors/components/CreateSensorDialog'
import { EditSensorDialog } from '@/features/sensors/components/EditSensorDialog'
import { DeleteSensorDialog } from '@/features/sensors/components/DeleteSensorDialog'
import { SensorStatusSwitch } from '@/features/sensors/components/SensorStatusSwitch'
import { Button } from '@/components/ui/button'

import { Link } from 'react-router'

const typeLabels = {
  HTTP_POLL: 'HTTP',
  MANUAL_UPLOAD: 'Manual',
}

const LIMIT = 10

export function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>()
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(false)
  const [actionError, setActionError] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  useEffect(() => {
    let ignore = false

    getSensors(page, LIMIT)
      .then((result) => {
        if (!ignore) {
          setSensors(result.data)
          setTotal(result.total)
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
  }, [page])
  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sensores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona los sensores de temperatura de la ciudad.
          </p>
        </div>

        <CreateSensorDialog
          onCreated={() => {
            setPage(1)
          }}
        />
      </header>

      {actionError && (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          No se han podido cargar los sensores.
        </p>
      ) : sensors === undefined ? (
        <p className="text-sm text-muted-foreground">
          Cargando sensores…
        </p>
      ) : sensors.length === 0 ? (
        <div className="rounded-lg border bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no hay sensores configurados.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {sensors.map((sensor) => (
                <tr key={sensor.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      className="hover:underline"
                      to={`/sensors/${sensor.id}`}
                    >
                      {sensor.name}
                    </Link>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs">
                    {sensor.sensorCode}
                  </td>
                  <td className="px-4 py-3">{typeLabels[sensor.type]}</td>
                  <td className="px-4 py-3">
                    <SensorStatusSwitch
                      sensor={sensor}
                      onUpdated={(updatedSensor) => {
                        setActionError('')
                        setSensors((current) =>
                          current?.map((item) =>
                            item.id === updatedSensor.id ? updatedSensor : item,
                          ),
                        )
                      }}
                      onError={() => {
                        setActionError(
                          `No se ha podido cambiar el estado de ${sensor.name}.`,
                        )
                      }}
                    />
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {sensor.url ?? '—'}
                  </td>
<td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <EditSensorDialog
                          sensor={sensor}
                          onUpdated={(updatedSensor) => {
                            setSensors((current) =>
                              current?.map((item) =>
                                item.id === updatedSensor.id ? updatedSensor : item,
                              ),
                            )
                          }}
                        />

                        <DeleteSensorDialog
                          sensor={sensor}
                          onDeleted={(id) => {
                            setSensors((current) =>
                              current?.filter((item) => item.id !== id),
                            )
                          }}
                        />
                      </div>
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
              {total} sensores — página {page} de {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
    </section>
  )
}
