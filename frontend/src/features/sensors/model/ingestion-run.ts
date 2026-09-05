export type IngestionStatus = 'running' | 'success' | 'error'

export interface IngestionRun {
  id: string
  sensorId: string
  startedAt: string
  finishedAt: string | null
  status: IngestionStatus
  recordsProcessed: number
  errorMessage: string | null
}
