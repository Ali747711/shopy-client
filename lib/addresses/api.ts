import { api } from '@/lib/api'

import { addressListSchema, type AddressInput, type SavedAddress } from './schema'

// Addresses live behind auth — send the access cookie on every call.
const withCredentials = { credentials: 'include' as const }

export async function listAddresses(): Promise<SavedAddress[]> {
  const { data } = await api.get('/api/addresses', {
    ...withCredentials,
    schema: addressListSchema,
  })
  return data.addresses
}

export async function addAddress(input: AddressInput): Promise<SavedAddress[]> {
  const { data } = await api.post('/api/addresses', input, {
    ...withCredentials,
    schema: addressListSchema,
  })
  return data.addresses
}

export async function updateAddress(
  id: string,
  input: Partial<AddressInput>,
): Promise<SavedAddress[]> {
  const { data } = await api.patch(`/api/addresses/${encodeURIComponent(id)}`, input, {
    ...withCredentials,
    schema: addressListSchema,
  })
  return data.addresses
}

export async function deleteAddress(id: string): Promise<SavedAddress[]> {
  const { data } = await api.del(`/api/addresses/${encodeURIComponent(id)}`, {
    ...withCredentials,
    schema: addressListSchema,
  })
  return data.addresses
}

export async function setDefaultAddress(id: string): Promise<SavedAddress[]> {
  const { data } = await api.patch(
    `/api/addresses/${encodeURIComponent(id)}/default`,
    undefined,
    { ...withCredentials, schema: addressListSchema },
  )
  return data.addresses
}
