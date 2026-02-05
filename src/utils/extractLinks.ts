import { ExtractedLink } from '../types'

/**
 * Determines the type of link based on URL
 */
function getLinkType(url: string): 'youtube' | 'spotify' | 'other' {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube'
  }
  if (lowerUrl.includes('spotify.com')) {
    return 'spotify'
  }
  return 'other'
}

/**
 * Checks if the link text is just a raw URL (no meaningful text)
 */
function isRawUrl(text: string): boolean {
  const trimmed = text.trim()
  // Check if text starts with http/https or looks like a URL
  return /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)
}

/**
 * Unwraps Google redirect URLs (used by Google Docs)
 * e.g., https://www.google.com/url?q=https://youtube.com/...&sa=D&...
 * Returns the actual URL from the 'q' parameter
 */
function unwrapGoogleRedirect(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace(/^www\./, '').toLowerCase()

    // Check if it's a Google redirect URL
    if (hostname === 'google.com' && urlObj.pathname === '/url') {
      const actualUrl = urlObj.searchParams.get('q') || urlObj.searchParams.get('url')
      if (actualUrl) {
        // Recursively unwrap in case of nested redirects
        return unwrapGoogleRedirect(actualUrl)
      }
    }
  } catch {
    // If parsing fails, return original
  }
  return url
}

/**
 * Extracts all links from HTML content, preserving link text when available
 *
 * @param html - HTML content to parse
 * @returns Array of extracted links with URL, optional text, and type
 */
export function extractLinksFromHtml(html: string): ExtractedLink[] {
  if (!html || typeof html !== 'string') {
    return []
  }

  const links: ExtractedLink[] = []
  const seenUrls = new Set<string>()

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Find all anchor tags
    const anchors = doc.querySelectorAll('a[href]')

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip internal/empty links
      if (href.startsWith('#') || href === '') return

      // Normalize URL
      let url = href
      try {
        // Handle relative URLs or malformed URLs
        if (!href.startsWith('http')) {
          // Skip non-http links (mailto:, javascript:, etc.)
          if (href.includes(':')) return
          return
        }
        const urlObj = new URL(href)
        url = urlObj.toString()

        // Unwrap Google redirect URLs (common in Google Docs exports)
        url = unwrapGoogleRedirect(url)
      } catch {
        // If URL parsing fails, use as-is if it looks like a URL
        if (!href.startsWith('http')) return
      }

      // Skip duplicates
      if (seenUrls.has(url)) return
      seenUrls.add(url)

      // Get link text
      const text = anchor.textContent?.trim() || ''

      const link: ExtractedLink = {
        url,
        type: getLinkType(url),
      }

      // Only set text if it's meaningful (not just the URL itself)
      if (text && !isRawUrl(text)) {
        link.text = text
      }

      links.push(link)
    })

    // Also look for raw URLs in text content that aren't wrapped in anchor tags
    // This catches URLs pasted as plain text
    const textContent = doc.body.textContent || ''
    const urlRegex = /https?:\/\/[^\s<>"')\]]+/gi
    let match

    while ((match = urlRegex.exec(textContent)) !== null) {
      const url = match[0]
      // Clean up trailing punctuation
      const cleanUrl = url.replace(/[.,;:!?)]+$/, '')

      if (!seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl)
        links.push({
          url: cleanUrl,
          type: getLinkType(cleanUrl),
        })
      }
    }
  } catch (error) {
    console.error('Error extracting links from HTML:', error)
  }

  return links
}

/**
 * Filters links to only YouTube and Spotify
 */
export function filterMediaLinks(links: ExtractedLink[]): ExtractedLink[] {
  return links.filter(link => link.type === 'youtube' || link.type === 'spotify')
}
