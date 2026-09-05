-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('HTTP_POLL', 'MANUAL_UPLOAD');

-- CreateEnum
CREATE TYPE "SensorStatus" AS ENUM ('active', 'paused');

-- CreateEnum
CREATE TYPE "IngestionStatus" AS ENUM ('success', 'error', 'running');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sensorCode" TEXT NOT NULL,
    "type" "SensorType" NOT NULL,
    "status" "SensorStatus" NOT NULL DEFAULT 'active',
    "url" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" UUID NOT NULL,
    "sensorId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ(3),
    "status" "IngestionStatus" NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemperatureReading" (
    "id" UUID NOT NULL,
    "sensorId" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL,
    "valueC" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TemperatureReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_sensorCode_key" ON "Sensor"("sensorCode");

-- CreateIndex
CREATE INDEX "IngestionRun_sensorId_idx" ON "IngestionRun"("sensorId");

-- CreateIndex
CREATE INDEX "TemperatureReading_sensorId_idx" ON "TemperatureReading"("sensorId");

-- CreateIndex
CREATE UNIQUE INDEX "TemperatureReading_sensorId_timestamp_key" ON "TemperatureReading"("sensorId", "timestamp");

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemperatureReading" ADD CONSTRAINT "TemperatureReading_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
