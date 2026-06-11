import { describe, it, expect } from 'vitest'
import { addressFieldsSchema, EMPTY_ADDRESS } from './schema'

const valid = {
  fullName: 'John Doe',
  phone: '+1 555 0000',
  address1: '123 Main St',
  city: 'NY',
  state: 'NY',
  postalCode: '10001',
  country: 'United States',
}

describe('addressFieldsSchema', () => {
  it('accepts a valid address', () => {
    expect(addressFieldsSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects the empty address', () => {
    expect(addressFieldsSchema.safeParse(EMPTY_ADDRESS).success).toBe(false)
  })

  it('reports a friendly message for a short name', () => {
    const r = addressFieldsSchema.safeParse({ ...valid, fullName: 'A' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toMatch(/at least 2/)
  })
})
