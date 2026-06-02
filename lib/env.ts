import { z } from 'zod'

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
})

// Reference each var statically so Next.js can inline NEXT_PUBLIC_* into the
// client bundle. Validate at module load so a misconfigured deploy fails fast.
const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Invalid public environment variables — ${details}`)
}

export const env = parsed.data
