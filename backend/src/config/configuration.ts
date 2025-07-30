export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:4321',
      'http://localhost:5173'
    ],
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY,
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
  },
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  s3: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.PUBLIC_R2_PUBLIC_URL,
  },
  cloudflare: {
    accountId: process.env.CLOUDFLARE_IA_API_ID,
    apiToken: process.env.CLOUDFLARE_IA_API_TOKEN,
  },
});