import type { ApiClient } from './client'

export type SiteSettings = {
  siteName: string | null
  siteLogoUrl: string | null
  faviconUrl: string | null
  aboutContent: string | null
  contactContent: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
}

export const emptySiteSettings: SiteSettings = {
  siteName: null,
  siteLogoUrl: null,
  faviconUrl: null,
  aboutContent: null,
  contactContent: null,
  contactEmail: null,
  contactPhone: null,
  contactAddress: null,
}

const query = `
  query SiteSettings {
    activeChannel {
      customFields {
        siteName
        siteLogoUrl
        faviconUrl
        aboutContent
        contactContent
        contactEmail
        contactPhone
        contactAddress
      }
    }
  }
`

export function createSiteSettingsService(client: ApiClient) {
  return {
    async get(): Promise<SiteSettings> {
      const data = await client.query<{ activeChannel: { customFields: SiteSettings | null } }>({ query })
      return { ...emptySiteSettings, ...data.activeChannel.customFields }
    },
  }
}
