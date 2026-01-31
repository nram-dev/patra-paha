const YOUTUBE_URL_REGEX = /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<>"')\]]+/i

const decodeHtmlEntities = (value: string): string => {
  if (!value.includes('&')) return value
  try {
    const doc = new DOMParser().parseFromString(value, 'text/html')
    return doc.documentElement.textContent || value
  } catch {
    return value
  }
}

const normalizeYouTubeUrl = (value: string): string | null => {
  const htmlDecoded = decodeHtmlEntities(value)
  let decoded = htmlDecoded
  try {
    decoded = decodeURIComponent(htmlDecoded)
  } catch {
    // Keep original if it can't be fully decoded.
  }

  let url: URL
  try {
    url = new URL(decoded)
  } catch {
    return null
  }

  const hostname = url.hostname.replace(/^www\./, '').toLowerCase()
  if (hostname !== 'youtube.com' && hostname !== 'youtu.be') return null

  if (hostname === 'youtube.com' && url.pathname === '/url') {
    const nestedUrl = url.searchParams.get('url') || url.searchParams.get('q')
    if (nestedUrl) return normalizeYouTubeUrl(nestedUrl)
  }

  if (hostname === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0]
    return id ? `https://www.youtube.com/watch?v=${id}` : url.toString()
  }

  if (url.pathname === '/watch') {
    const id = url.searchParams.get('v')
    return id ? `https://www.youtube.com/watch?v=${id}` : url.toString()
  }

  if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
    const id = url.pathname.split('/').filter(Boolean)[1]
    return id ? `https://www.youtube.com/watch?v=${id}` : url.toString()
  }

  return url.toString()
}

export const extractFirstYouTubeUrl = (values: Array<string | null | undefined>): string | null => {
  for (const value of values) {
    if (!value || typeof value !== 'string') continue

    const directMatch = value.match(YOUTUBE_URL_REGEX)
    if (directMatch) {
      const normalized = normalizeYouTubeUrl(directMatch[0])
      if (normalized) return normalized
    }

    if (value.includes('<') && value.includes('>')) {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(value, 'text/html')
        const links = Array.from(doc.querySelectorAll('a'))
          .map(link => link.getAttribute('href') || '')
          .filter(Boolean)
        for (const href of links) {
          const linkMatch = href.match(YOUTUBE_URL_REGEX)
          if (linkMatch) {
            const normalized = normalizeYouTubeUrl(linkMatch[0])
            if (normalized) return normalized
          }
        }
        const textContent = doc.body.textContent || ''
        const textMatch = textContent.match(YOUTUBE_URL_REGEX)
        if (textMatch) {
          const normalized = normalizeYouTubeUrl(textMatch[0])
          if (normalized) return normalized
        }
      } catch {
        // Ignore HTML parsing failures and continue.
      }
    }
  }

  return null
}

