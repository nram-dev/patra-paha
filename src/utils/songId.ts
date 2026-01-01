/**
 * Extract unique song ID from filename
 * Supports format: {ID}-{Title}.{ext}
 * Examples: G001-Song Title.doc → G001
 */
export function extractSongId(filename: string): string | null {
  // Match pattern: Letter(s) + digits at start, followed by hyphen
  // Examples: G001-, B042-, K123-
  const match = filename.match(/^([A-Z]\d+)-/i)
  return match ? match[1].toUpperCase() : null
}

/**
 * Normalize song ID to ensure consistent format
 */
export function normalizeSongId(id: string): string {
  return id.toUpperCase()
}

