import { ApiError, apiClient } from '@/shared/api/api-client'

export interface CurrentUser {
  id: string
  email: string
  createdAt: string
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await apiClient<CurrentUser>('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }

    throw error
  }
}
