import { z } from 'zod'

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Uzbekistan',
  'South Korea',
  'Japan',
  'Canada',
  'Australia',
  'Other',
] as const

export const addressFieldsSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  phone: z.string().trim().min(5, 'Phone must be at least 5 characters.').max(20),
  address1: z.string().trim().min(3, 'Address must be at least 3 characters.').max(200),
  address2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, 'City is required.').max(100),
  state: z.string().trim().min(1, 'State / province is required.').max(100),
  postalCode: z.string().trim().min(2, 'Postal code must be at least 2 characters.').max(20),
  country: z.string().min(1, 'Country is required.'),
})
export type AddressFields = z.infer<typeof addressFieldsSchema>

export const addressInputSchema = addressFieldsSchema.extend({
  label: z.string().trim().max(40).optional(),
  isDefault: z.boolean().optional(),
})
export type AddressInput = z.infer<typeof addressInputSchema>

export const savedAddressSchema = addressInputSchema.extend({
  _id: z.string(),
  isDefault: z.boolean(),
})
export type SavedAddress = z.infer<typeof savedAddressSchema>

export const addressListSchema = z.object({ addresses: z.array(savedAddressSchema) })

export const EMPTY_ADDRESS: AddressFields = {
  fullName: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}
