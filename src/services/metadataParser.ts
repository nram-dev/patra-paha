import { SongMetadata, ParsedContent } from '../types'

/**
 * Enhanced metadata parser for optional header blocks in Google Docs
 * Supports multi-line values, arrays, and graceful fallback
 */
export function parseMetadata(content: string): ParsedContent {
  // Match metadata block: ---\n...\n---
  const metadataRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const match = content.match(metadataRegex)

  if (!match) {
    return {
      hasMetadata: false,
      metadata: {},
      lyrics: content.trim()
    }
  }

  const metadataBlock = match[1]
  const metadata: SongMetadata = {}
  const lines = metadataBlock.split('\n')

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue

    // Handle multi-line values (indented lines continue previous value)
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) {
      // Continuation of previous value (indented)
      if (line.match(/^\s+/) && Object.keys(metadata).length > 0) {
        const lastKey = Object.keys(metadata).pop()!
        const currentValue = metadata[lastKey as keyof SongMetadata]
        if (typeof currentValue === 'string') {
          metadata[lastKey as keyof SongMetadata] = `${currentValue}\n${line.trim()}` as any
        }
      }
      continue
    }

    const key = line.substring(0, colonIndex).trim().toLowerCase()
    const value = line.substring(colonIndex + 1).trim()

    // Handle array fields (Tags, Deity - comma-separated)
    if (key === 'tags' || key === 'deity') {
      const items = value.split(',').map(item => item.trim()).filter(Boolean)
      if (key === 'tags') {
        metadata.tags = items
      } else {
        metadata.deity = items
      }
    } else if (key === 'title') {
      metadata.title = value
    } else if (key === 'ragam') {
      metadata.ragam = value
    } else if (key === 'talam') {
      metadata.talam = value
    } else if (key === 'youtube') {
      metadata.youtube = value
    } else if (key === 'source') {
      metadata.source = value
    }
  }

  // Extract lyrics (everything after metadata block)
  const lyrics = content.replace(metadataRegex, '').trim()

  return {
    hasMetadata: true,
    metadata,
    lyrics
  }
}

/**
 * Validates metadata structure
 */
export function validateMetadata(metadata: SongMetadata): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (metadata.youtube && !isValidUrl(metadata.youtube)) {
    errors.push('Invalid YouTube URL')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
