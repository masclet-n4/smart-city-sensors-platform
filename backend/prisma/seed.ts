import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

// ── Users ──────────────────────────────────────────────────────────
const users = [
  { email: 'demo@example.com', password: 'demo1234' },
  { email: 'admin@example.com', password: 'admin1234' },
  { email: 'operator@example.com', password: 'oper1234' },
];

// ── Sensors ────────────────────────────────────────────────────────
const sensors = [
  {
    name: 'Plaza Mayor — HTTP',
    sensorCode: 'TEMP-HTTP-001',
    type: 'HTTP_POLL' as const,
    status: 'active' as const,
    url: 'http://backend:3000/api/mock/temp-format-a',
  },
  {
    name: 'Estación Norte — Manual',
    sensorCode: 'TEMP-MANUAL-001',
    type: 'MANUAL_UPLOAD' as const,
    status: 'active' as const,
    url: null,
  },
  {
    name: 'Parque Central — HTTP (pausado)',
    sensorCode: 'TEMP-HTTP-002',
    type: 'HTTP_POLL' as const,
    status: 'paused' as const,
    url: 'http://backend:3000/api/mock/temp-format-b',
  },
  {
    name: 'Mercado Sur — Manual',
    sensorCode: 'TEMP-MANUAL-002',
    type: 'MANUAL_UPLOAD' as const,
    status: 'active' as const,
    url: null,
  },
  {
    name: 'Aeropuerto — HTTP',
    sensorCode: 'TEMP-HTTP-003',
    type: 'HTTP_POLL' as const,
    status: 'active' as const,
    url: 'http://backend:3000/api/mock/temp-format-a',
  },
];

// ── Helpers ────────────────────────────────────────────────────────
function hoursAgo(hours: number, minutes = 0): Date {
  const d = new Date();
  d.setHours(d.getHours() - hours, d.getMinutes() - minutes, 0, 0);
  return d;
}

function randomAround(base: number, spread: number): number {
  return Math.round((base + (Math.random() - 0.5) * spread * 2) * 100) / 100;
}

// ── Seed ───────────────────────────────────────────────────────────
try {
  // 1. Users
  for (const { email, password } of users) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash },
    });
  }
  console.log(`[seed] ${users.length} users ready.`);

  // 2. Sensors
  const createdSensors: { id: string; sensorCode: string }[] = [];
  for (const sensor of sensors) {
    const created = await prisma.sensor.upsert({
      where: { sensorCode: sensor.sensorCode },
      update: {},
      create: sensor,
    });
    createdSensors.push({ id: created.id, sensorCode: created.sensorCode });
  }
  console.log(`[seed] ${createdSensors.length} sensors ready.`);

  // 3. Ingestion runs + temperature readings
  let totalRuns = 0;
  let totalReadings = 0;

  for (const sensor of createdSensors) {
    // ponytail: skip runs for paused sensor — no real ingestion would have happened
    const sensorDef = sensors.find((s) => s.sensorCode === sensor.sensorCode)!;
    if (sensorDef.status === 'paused') continue;

    // Create 5 ingestion runs per active sensor, each with 3 readings
    for (let runIdx = 0; runIdx < 5; runIdx++) {
      const startedAt = hoursAgo(24 - runIdx * 4, runIdx * 15);
      const finishedAt = new Date(startedAt.getTime() + 2_000);

      const run = await prisma.ingestionRun.create({
        data: {
          sensorId: sensor.id,
          startedAt,
          finishedAt,
          status: 'success',
          recordsProcessed: 3,
        },
      });

      // 3 readings per run, spread 10 minutes apart
      const readings = [0, 1, 2].map((offset) => ({
        sensorId: sensor.id,
        timestamp: new Date(startedAt.getTime() - offset * 10 * 60_000),
        valueC: randomAround(21.5 + runIdx * 0.3, 2),
      }));

      await prisma.temperatureReading.createMany({
        data: readings,
        skipDuplicates: true,
      });

      totalReadings += readings.length;
      totalRuns++;
    }
  }

  console.log(
    `[seed] ${totalRuns} ingestion runs + ${totalReadings} readings created.`,
  );
  console.log('[seed] Done.');
} finally {
  await prisma.$disconnect();
}