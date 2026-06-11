import type { MetadataRoute } from 'next'

// Next.js App Router serves this at /manifest.webmanifest automatically.
// Icons reference files in /public/ — place icon-192.png and icon-512.png there.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shopy',
    short_name: 'Shopy',
    description: 'AI-powered shopping experience',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        // Maskable icon allows the OS to apply its own shape mask.
        purpose: 'maskable',
      },
    ],
  }
}
