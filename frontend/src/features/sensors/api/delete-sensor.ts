import { apiClient } from '@/shared/api/api-client'

export function deleteSensor(id: string): Promise<void> {
  return apiClient<void>(`/sensors/${id}`, {
    method: 'DELETE',
  })
}
