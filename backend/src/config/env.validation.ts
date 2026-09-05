const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', "CORS_ORIGIN"] as const;

export function validateEnv() {
  for (const name of REQUIRED_ENV) {
    if (!process.env[name]?.trim()) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
}
