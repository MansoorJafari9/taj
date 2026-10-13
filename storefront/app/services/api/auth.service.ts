import { ApiError, type ApiClient } from './client'

export type ActiveCustomer = { id: string, firstName: string, lastName: string, emailAddress: string, phoneNumber: string | null }

const activeCustomerQuery = `
  query ActiveCustomer {
    activeCustomer { id firstName lastName emailAddress phoneNumber }
  }
`

export function createAuthService(client: ApiClient) {
  return {
    async getActiveCustomer(): Promise<ActiveCustomer | null> {
      const data = await client.query<{ activeCustomer: ActiveCustomer | null }>({ query: activeCustomerQuery })
      return data.activeCustomer
    },
    async register(input: { firstName: string, lastName: string, emailAddress: string, phoneNumber: string, password: string }) {
      const data = await client.query<{ registerCustomerAccount: { __typename: string, errorCode?: string, message?: string } }, { input: typeof input }>({
        query: `mutation Register($input: RegisterCustomerInput!) { registerCustomerAccount(input: $input) { __typename ... on ErrorResult { errorCode message } } }`,
        variables: { input },
      })
      if (data.registerCustomerAccount.__typename !== 'Success') {
        throw new ApiError({
          code: data.registerCustomerAccount.errorCode || 'REGISTRATION_FAILED',
          userMessage: data.registerCustomerAccount.message,
        })
      }
    },
    async login(username: string, password: string): Promise<ActiveCustomer> {
      const data = await client.query<{ login: { __typename: string, errorCode?: string, message?: string } }, { username: string, password: string }>({
        query: `mutation Login($username: String!, $password: String!) { login(username: $username, password: $password) { __typename ... on ErrorResult { errorCode message } } }`,
        variables: { username, password },
      })
      if (data.login.__typename !== 'CurrentUser') {
        throw new ApiError({
          code: data.login.errorCode || 'LOGIN_FAILED',
          userMessage: data.login.message,
        })
      }
      const customer = await this.getActiveCustomer()
      if (!customer) throw new Error('حساب کاربری یافت نشد.')
      return customer
    },
    async logout() {
      await client.query<{ logout: { success: boolean } }>({ query: `mutation Logout { logout { success } }` })
    },
    async updateProfile(input: { firstName: string, lastName: string, phoneNumber: string }): Promise<ActiveCustomer> {
      const data = await client.query<{ updateCustomer: ActiveCustomer }, { input: typeof input }>({
        query: `mutation UpdateProfile($input: UpdateCustomerInput!) { updateCustomer(input: $input) { id firstName lastName emailAddress phoneNumber } }`,
        variables: { input },
      })
      return data.updateCustomer
    },
  }
}
