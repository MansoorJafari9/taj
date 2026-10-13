import sanitizeHtml from 'sanitize-html'

export function sanitizeContent(value: string | null | undefined): string {
  return sanitizeHtml(value ?? '', {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption', 'hr', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'width', 'height'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
  })
}

export function contentAsText(value: string | null | undefined): string {
  return sanitizeHtml(value ?? '', { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()
}
