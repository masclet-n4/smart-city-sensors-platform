interface ApiErrorResponse {
  message?: string | string[]
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | undefined

export function setUnauthorizedHandler(handler: UnauthorizedHandler): () => void {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined
    }
  }
}


export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/me') {
      unauthorizedHandler?.()
    }

    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null
    const message = Array.isArray(body?.message)
      ? body.message.join('. ')
      : body?.message

    throw new ApiError(
      message ?? `La petición ha fallado (${response.status})`,
      response.status,
    )
  }


  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>

}
