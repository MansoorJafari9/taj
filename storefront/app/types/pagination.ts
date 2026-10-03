export type PaginatedResult<T> = {
  items: T[]
  totalItems: number
}

export type PaginationInput = {
  skip: number
  take: number
}
