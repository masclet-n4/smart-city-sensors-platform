import { apiClient } from '@/shared/api/api-client'

export async function logout(): Promise<void> {
  await apiClient<{ message: string }>('/auth/logout', {
    method: 'POST',
  })
}
