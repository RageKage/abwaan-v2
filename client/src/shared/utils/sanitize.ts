import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Uses DOMPurify to remove dangerous tags, attributes, and scripts.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns A sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitizes plain text by escaping HTML entities.
 * Use this for text content that should NOT render any HTML.
 *
 * @param text - The plain text to escape
 * @returns HTML-escaped text safe for rendering
 */
export function sanitizeText(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Strips all HTML tags from a string.
 * Use this when you need plain text output.
 *
 * @param html - The HTML string to strip
 * @returns Plain text without any HTML tags
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = DOMPurify.sanitize(html)
  return div.textContent || ''
}
