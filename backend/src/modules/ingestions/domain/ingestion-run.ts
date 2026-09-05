export const INGESTION_STATUSES = ['success', 'error', 'running'] as const;

export type IngestionStatus =
  (typeof INGESTION_STATUSES)[number];

export interface IngestionRun {
  id: string;
  sensorId: string;
  startedAt: Date;
  finishedAt: Date | null;
  status: IngestionStatus;
  recordsProcessed: number;
  errorMessage: string | null;
}
