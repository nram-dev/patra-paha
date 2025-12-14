import { Song, TitleLanguage } from '../types'

/**
 * Get song title based on language preference
 * Fallback order:
 * 1. Try title-{language} (e.g., title-tamil)
 * 2. Fallback to metadata.title
 * 3. Fallback to song.name (filename)
 */
export function getSongTitle(song: Song, language: TitleLanguage): string {
  if (!song.metadata) {
    return song.name
  }

  const metadata = song.metadata

  // Try language-specific title
  if (language === 'tamil' && metadata['title-tamil']) {
    return metadata['title-tamil']
  }
  if (language === 'sanskrit' && metadata['title-sanskrit']) {
    return metadata['title-sanskrit']
  }

  // Fallback to default title
  if (metadata.title) {
    return metadata.title
  }

  // Final fallback to filename
  return song.name
}

/**
 * Get first line of content as fallback title
 */
export function getFirstLineAsTitle(content?: string): string | null {
  if (!content) return null
  
  // Remove HTML tags and get first line
  const text = content.replace(/<[^>]*>/g, '').trim()
  const firstLine = text.split('\n')[0].trim()
  
  return firstLine.length > 0 && firstLine.length < 100 ? firstLine : null
}
