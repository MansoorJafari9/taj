import type { ApiClient } from './client'

export type CustomerAddressInput = {
  fullName: string
  phoneNumber: string
  province: string
  city: string
  streetLine1: string
  streetLine2?: string
  postalCode: string
  countryCode: string
}

export type CustomerAddress = {
  id: string
  fullName: string | null
  phoneNumber: string | null
  province: string | null
  city: string | null
  streetLine1: string
  streetLine2: string | null
  postalCode: string | null
  country: { code: string, name: string }
  defaultShippingAddress: boolean | null
}

const addressFields = `
  id fullName phoneNumber province city streetLine1 streetLine2 postalCode
  country { code name }
  defaultShippingAddress
`

export function createCustomerAddressesService(client: ApiClient) {
  return {
    async list(): Promise<CustomerAddress[]> {
      const data = await client.query<{ activeCustomer: { addresses: CustomerAddress[] | null } | null }>({
        query: `query CustomerAddresses { activeCustomer { addresses { ${addressFields} } } }`,
      })
      return data.activeCustomer?.addresses ?? []
    },
    async create(input: CustomerAddressInput): Promise<CustomerAddress> {
      const data = await client.query<{ createCustomerAddress: CustomerAddress }, { input: CustomerAddressInput }>({
        query: `mutation CreateCustomerAddress($input: CreateAddressInput!) {
          createCustomerAddress(input: $input) { ${addressFields} }
        }`,
        variables: { input },
      })
      return data.createCustomerAddress
    },
  }
}
