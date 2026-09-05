import { useState } from 'react'

import { Switch } from '@/components/ui/switch'
import { updateSensor } from '@/features/sensors/api/update-sensor'
import type { Sensor } from '@/features/sensors/model/sensor'

interface SensorStatusSwitchProps {
  sensor: Sensor
  onUpdated: (sensor: Sensor) => void
  onError: () => void
}

export function SensorStatusSwitch({
  sensor,
  onUpdated,
  onError,
}: SensorStatusSwitchProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const isActive = sensor.status === 'active'

  async function handleChange(checked: boolean) {
    setIsUpdating(true)

    try {
      const updatedSensor = await updateSensor(sensor.id, {
        status: checked ? 'active' : 'paused',
      })
      onUpdated(updatedSensor)
    } catch {
      onError()
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        disabled={isUpdating}
        onCheckedChange={handleChange}
        aria-label={isActive ? `Pausar ${sensor.name}` : `Activar ${sensor.name}`}
      />
      <span className="text-sm text-muted-foreground">
        {isUpdating ? 'Actualizando…' : isActive ? 'Activo' : 'Pausado'}
      </span>
    </div>
  )
}
