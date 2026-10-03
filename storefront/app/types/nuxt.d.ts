import type { ApiClient } from '~/services/api/client'
import type { ApiServices } from '~/services/api'

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient
    $services: ApiServices
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiClient
    $services: ApiServices
  }
}

export {}
