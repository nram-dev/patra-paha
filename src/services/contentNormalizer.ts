/**
 * HTML content normalizer for Google Docs export
 * Preserves: Font families, font sizes, bold/italic, structure
 * Normalizes: Background colors → uniform (remove yellow highlights, use app theme)
 */

export function normalizeHtmlContent(html: string, theme: 'calm' | 'dark' = 'calm'): string {
  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // Remove background colors from all elements
  removeBackgroundColors(body)

  // Normalize font families (preserve but ensure Tamil font is available)
  normalizeFonts(body)

  // Preserve structure but normalize styling
  normalizeStyling(body, theme)

  return body.innerHTML
}

function removeBackgroundColors(element: HTMLElement): void {
  // Remove inline background-color styles
  if (element.style.backgroundColor) {
    element.style.backgroundColor = ''
  }

  // Remove background-color from style attribute
  const style = element.getAttribute('style')
  if (style) {
    const newStyle = style
      .split(';')
      .filter(prop => !prop.trim().startsWith('background-color'))
      .join(';')
    if (newStyle) {
      element.setAttribute('style', newStyle)
    } else {
      element.removeAttribute('style')
    }
  }

  // Recursively process children
  Array.from(element.children).forEach(child => {
    if (child instanceof HTMLElement) {
      removeBackgroundColors(child)
    }
  })
}

function normalizeFonts(element: HTMLElement): void {
  // Preserve existing font-family but ensure Tamil font is in the stack
  const style = element.style.fontFamily || element.getAttribute('style')
  
  if (style && style.includes('font-family')) {
    // Extract font-family value
    const fontMatch = style.match(/font-family:\s*([^;]+)/i)
    if (fontMatch) {
      const fonts = fontMatch[1]
        .split(',')
        .map(f => f.trim().replace(/['"]/g, ''))
      
      // Add Noto Sans Tamil if not present
      if (!fonts.some(f => f.toLowerCase().includes('noto') || f.toLowerCase().includes('tamil'))) {
        const newFonts = ["'Noto Sans Tamil'", ...fonts].join(', ')
        element.style.fontFamily = newFonts
      }
    }
  }

  // Recursively process children
  Array.from(element.children).forEach(child => {
    if (child instanceof HTMLElement) {
      normalizeFonts(child)
    }
  })
}

function normalizeStyling(element: HTMLElement, theme: 'calm' | 'dark'): void {
  // Preserve bold, italic, font sizes
  // Remove other color-related styles that might conflict with theme

  // Recursively process children
  Array.from(element.children).forEach(child => {
    if (child instanceof HTMLElement) {
      normalizeStyling(child, theme)
    }
  })
}

/**
 * Extract text content from HTML while preserving structure
 */
export function htmlToText(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

/**
 * Check if HTML contains images
 */
export function hasImages(html: string): boolean {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const images = doc.querySelectorAll('img')
  return images.length > 0
}

/**
 * Extract image URLs from HTML
 */
export function extractImageUrls(html: string): string[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const images = doc.querySelectorAll('img')
  return Array.from(images).map(img => img.getAttribute('src') || '').filter(Boolean)
}
