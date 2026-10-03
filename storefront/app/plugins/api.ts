import { createApiClient } from '~/services/api/client'
import { createApiServices } from '~/services/api'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
  const client = createApiClient({
    baseUrl: config.public.apiBaseUrl,
    channelToken: config.public.channelToken || undefined,
    cookie: requestHeaders.cookie,
  })

  return {
    provide: {
      api: client,
      services: createApiServices(client),
    },
  }
})
