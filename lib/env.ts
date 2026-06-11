// API requests use relative URLs (e.g. "/api/products") so the browser always
// talks to the same origin. Next.js rewrites proxy them to BACKEND_URL
// (server-only env var defined in .env.local / deployment settings).
//
// No NEXT_PUBLIC_* env vars are needed for the API client.
