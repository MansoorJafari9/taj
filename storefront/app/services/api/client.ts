import type { ApiErrorOptions, GraphqlResponse } from '~/types/api'
import type { SupportedLocale } from '~/constants/locales'

export class ApiError extends Error {
  readonly code: string
  readonly userMessage?: string
  readonly status?: number
  readonly fieldErrors?: ApiErrorOptions['fieldErrors']
  readonly graphqlErrors?: ApiErrorOptions['graphqlErrors']

  constructor(options: ApiErrorOptions) {
    super(options.code, { cause: options.cause })
    this.name = 'ApiError'
    this.code = options.code
    this.userMessage = options.userMessage
    this.status = options.status
    this.fieldErrors = options.fieldErrors
    this.graphqlErrors = options.graphqlErrors
  }
}

export type GraphqlRequest<TVariables extends Record<string, unknown>> = {
  query: string
  variables?: TVariables
  languageCode?: SupportedLocale
  signal?: AbortSignal
}

export type ApiClientOptions = {
  baseUrl: string
  channelToken?: string
  cookie?: string
}

export function createApiClient(options: ApiClientOptions) {
  return {
    async query<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
      request: GraphqlRequest<TVariables>,
    ): Promise<TData> {
      const headers: Record<string, string> = { 'content-type': 'application/json' }
      if (options.channelToken) headers['vendure-token'] = options.channelToken
      if (options.cookie) headers.cookie = options.cookie

      try {
        const response = await $fetch<GraphqlResponse<TData>>(options.baseUrl, {
          method: 'POST',
          credentials: 'include',
          headers,
          query: request.languageCode ? { languageCode: request.languageCode } : undefined,
          body: { query: request.query, variables: request.variables },
          signal: request.signal,
        })

        if (response.errors?.length) {
          throw new ApiError({ code: 'GRAPHQL_ERROR', graphqlErrors: response.errors })
        }
        if (!response.data) {
          throw new ApiError({ code: 'EMPTY_API_RESPONSE' })
        }
        return response.data
      } catch (error) {
        if (error instanceof ApiError) throw error
        throw new ApiError({ code: 'NETWORK_ERROR', cause: error })
      }
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
