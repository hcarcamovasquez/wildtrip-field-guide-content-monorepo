import {defineConfig, type Config} from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema/*',
  out: './migrations',
  dialect: 'postgresql',
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
}) satisfies Config
