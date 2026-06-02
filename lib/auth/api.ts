import { api } from '@/lib/api'

import {
  authResultSchema,
  meResponseSchema,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from './schema'

// All auth calls send credentials so the backend's httpOnly cookies
// (accessToken on "/", refreshToken on "/api/auth") flow both ways.
const withCredentials = { credentials: 'include' as const }

export async function login(input: LoginInput): Promise<AuthUser> {
  const { data } = await api.post('/api/auth/login', input, {
    ...withCredentials,
    schema: authResultSchema,
  })
  return data.user
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const { data } = await api.post('/api/auth/register', input, {
    ...withCredentials,
    schema: authResultSchema,
  })
  return data.user
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get('/api/auth/me', {
    ...withCredentials,
    schema: meResponseSchema,
  })
  return data.user
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout', undefined, withCredentials)
}

export async function refreshSession(): Promise<void> {
  await api.post('/api/auth/refresh', undefined, withCredentials)
}
