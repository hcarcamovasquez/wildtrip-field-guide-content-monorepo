/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user?: import('./lib/db/schema/users').User
  }
}

interface ImportMetaEnv {
  readonly DATABASE_URL: string
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY: string
  readonly CLERK_SECRET_KEY: string
  readonly R2_ACCOUNT_ID: string
  readonly R2_ACCESS_KEY_ID: string
  readonly R2_SECRET_ACCESS_KEY: string
  readonly R2_BUCKET_NAME: string
  readonly PUBLIC_R2_PUBLIC_URL: string
  readonly UPSTASH_REDIS_REST_URL: string
  readonly UPSTASH_REDIS_REST_TOKEN: string
  readonly BLOCKED_ROUTES: string
  readonly CLOUDFLARE_IA_API_ID: string
  readonly CLOUDFLARE_IA_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
