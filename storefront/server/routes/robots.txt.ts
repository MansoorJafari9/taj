export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nDisallow: /fa/cart\nDisallow: /en/cart\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`
})
