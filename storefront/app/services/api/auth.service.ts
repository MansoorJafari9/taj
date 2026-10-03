import type { ApiClient } from './client'

export type ActiveCustomer = { id: string, firstName: string, lastName: string, emailAddress: string }

const activeCustomerQuery = `
  query ActiveCustomer {
    activeCustomer { id firstName lastName emailAddress }
  }
`

export function createAuthService(client: ApiClient) {
  return {
    async getActiveCustomer(): Promise<ActiveCustomer | null> {
      const data = await client.query<{ activeCustomer: ActiveCustomer | null }>({ query: activeCustomerQuery })
      return data.activeCustomer
    },
  }
}
