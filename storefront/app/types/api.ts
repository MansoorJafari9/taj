export type GraphqlError = {
  message: string
  path?: Array<string | number>
  extensions?: Record<string, unknown>
}

export type GraphqlResponse<T> = {
  data?: T
  errors?: GraphqlError[]
}

export type ApiFieldErrors = Record<string, string[]>

export type ApiErrorOptions = {
  code: string
  userMessage?: string
  status?: number
  fieldErrors?: ApiFieldErrors
  graphqlErrors?: GraphqlError[]
  cause?: unknown
}
