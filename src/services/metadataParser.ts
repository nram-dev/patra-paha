import { SongMetadata, ParsedContent, MultiLanguageContent, LanguageMetadata } from '../types'

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

/**
 * Language code mapping from file format to standard format
 */
const LANGUAGE_CODE_MAP: Record<string, string> = {
  'ENG': 'english',
  'SAN': 'sanskrit',
  'TAM': 'tamil',
  'english': 'english',
  'sanskrit': 'sanskrit',
  'tamil': 'tamil',
}

/**
 * Extract text content from HTML for parsing
 */
function extractTextFromHtml(html: string): string {
  // If it looks like HTML, extract text content
  if (html.trim().startsWith('<')) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return doc.body.textContent || doc.body.innerText || html
  }
  return html
}

/**
 * Parse multi-language content with _LAN: or __LAN: XXX markers
 * Supports _TIT: or __TIT: XXX for language-specific titles
 * Returns metadata and multi-language content structure
 */
export function parseMultiLanguageContent(content: string): {
  hasMetadata: boolean
  metadata: SongMetadata
  languages: MultiLanguageContent
  availableLanguages: string[]
  languageTitles?: { [language: string]: string }
  languageMetadata?: { [language: string]: LanguageMetadata }
} {
  // Extract text from HTML if needed (for Google Docs HTML export)
  const textContent = extractTextFromHtml(content)
  
  // First, extract metadata block if present
  const metadataRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const metadataMatch = textContent.match(metadataRegex)
  
  let metadata: SongMetadata = {}
  let contentWithoutMetadata = textContent

  if (metadataMatch) {
    const metadataBlock = metadataMatch[1]
    const lines = metadataBlock.split('\n')

    for (const line of lines) {
      if (!line.trim()) continue

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

      // Handle array fields
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
      } else if (key === 'spotify') {
        metadata.spotify = value
      }
    }

    // Remove metadata block from content
    contentWithoutMetadata = textContent.replace(metadataRegex, '').trim()
  }
  
  // For HTML content, we need to preserve the HTML structure but parse markers
  // If original was HTML, we'll need to work with the HTML structure
  const isHtml = content.trim().startsWith('<')

  // Parse language sections using _LAN: or __LAN: XXX markers
  // Support both single and double underscores for flexibility
  // Stop before __ (double underscore) to avoid matching __LAN: TAM__TIT as one marker
  const langRegex = /_{1,2}LAN\s*:\s*([A-Z]{2,4})(?=\s|$|\n|>|__)/gi
  const languages: MultiLanguageContent = {}
  const availableLanguages: string[] = []
  const languageTitles: { [language: string]: string } = {}
  const languageMetadata: { [language: string]: LanguageMetadata } = {}

  // Find all language markers in text content
  // Reset regex lastIndex to ensure we search from the beginning
  langRegex.lastIndex = 0
  const langMatches: Array<{ index: number; code: string; matchLength: number; matchText: string }> = []
  let match
  while ((match = langRegex.exec(contentWithoutMetadata)) !== null) {
    const langCode = match[1].toUpperCase()
    const standardLang = LANGUAGE_CODE_MAP[langCode] || langCode.toLowerCase()
    langMatches.push({
      index: match.index,
      code: standardLang,
      matchLength: match[0].length,
      matchText: match[0],
    })
  }
  
  console.log('Found language markers in text:', langMatches.map(m => ({ code: m.code, text: m.matchText })))

  // If no language markers found, treat as single language
  if (langMatches.length === 0) {
    // Return original content (HTML or text) as single language
    return {
      hasMetadata: !!metadataMatch,
      metadata,
      languages: { english: isHtml ? content : contentWithoutMetadata },
      availableLanguages: ['english'],
    }
  }

  // For HTML content, markers might be in HTML tags, so we need to search in both
  // HTML and extracted text to find all markers, then use HTML indices for extraction
  // For text content, use the text version
  const searchContent = isHtml ? content : contentWithoutMetadata
  
  // Also search in text content to find markers that might be hidden in HTML
  const textForMarkerSearch = isHtml ? contentWithoutMetadata : contentWithoutMetadata
  
  // Find markers - search in both HTML and text to catch all markers
  // Support both _LAN: and __LAN: formats
  // Also support variations like _LAN:ENG (no space) or _LAN: ENG (with space)
  const sourceLangMatches: Array<{ index: number; code: string; matchText: string; source: 'html' | 'text' }> = []
  // More flexible regex: _LAN or __LAN, optional space, then language code (ENG, TAM, SAN, etc.)
  // Match only valid language codes - stop before __ (double underscore) to avoid matching __LAN: TAM__TIT
  // Valid codes: ENG, TAM, SAN, and other 2-4 letter codes
  const markerRegex = /_{1,2}LAN\s*:\s*([A-Z]{2,4})(?=\s|$|\n|>|__)/gi
  
  // First, search in text content (easier to find markers)
  markerRegex.lastIndex = 0
  let textMatch
  let matchCount = 0
  while ((textMatch = markerRegex.exec(textForMarkerSearch)) !== null) {
    matchCount++
    const langCode = textMatch[1].toUpperCase()
    const standardLang = LANGUAGE_CODE_MAP[langCode] || langCode.toLowerCase()
    
    // Find corresponding position in HTML if needed
    let htmlIndex = textMatch.index
    if (isHtml) {
      // Try to find the marker in HTML at approximately the same position
      // Search around the text index position in HTML
      const searchStart = Math.max(0, textMatch.index - 100)
      const searchEnd = Math.min(content.length, textMatch.index + textMatch[0].length + 100)
      const htmlSearchArea = content.substring(searchStart, searchEnd)
      const htmlMatch = htmlSearchArea.search(new RegExp(markerRegex.source.replace('\\s*', '\\s*'), 'i'))
      if (htmlMatch !== -1) {
        htmlIndex = searchStart + htmlMatch
      } else {
        // Fallback: search entire HTML for this specific marker
        const fullHtmlMatch = content.indexOf(textMatch[0], searchStart)
        if (fullHtmlMatch !== -1) {
          htmlIndex = fullHtmlMatch
        }
      }
    }
    
    sourceLangMatches.push({
      index: isHtml ? htmlIndex : textMatch.index,
      code: standardLang,
      matchText: textMatch[0],
      source: isHtml ? 'html' : 'text',
    })
    
    // Log each match as we find it
    console.log(`Found marker ${matchCount} (${isHtml ? 'HTML' : 'text'}):`, {
      code: standardLang,
      originalCode: langCode,
      text: textMatch[0],
      textIndex: textMatch.index,
      htmlIndex: isHtml ? htmlIndex : 'N/A',
      context: textForMarkerSearch.substring(Math.max(0, textMatch.index - 30), Math.min(textForMarkerSearch.length, textMatch.index + textMatch[0].length + 50)),
    })
  }
  
  // Sort by index to ensure correct order
  sourceLangMatches.sort((a, b) => a.index - b.index)
  
  console.log(`Total language markers found: ${sourceLangMatches.length}`, sourceLangMatches.map(m => ({ 
    code: m.code, 
    text: m.matchText, 
    index: m.index,
    source: m.source,
  })))

  // Handle content before the first language marker (default language)
  // If first marker is not the first content, treat content before as default language
  if (sourceLangMatches.length > 0) {
    const firstMatch = sourceLangMatches[0]
    const contentBeforeFirst = searchContent.substring(0, firstMatch.index).trim()
    
    if (contentBeforeFirst) {
      // Try to detect language from content or use first available language code
      // If we can't detect, default to the language of the first marker's opposite
      // For now, if first marker is ENG, content before is likely TAM, and vice versa
      let defaultLang = 'english'
      
      // If first marker is ENG, content before is likely Tamil
      // If first marker is TAM/SAN, content before is likely English
      if (firstMatch.code === 'english') {
        defaultLang = 'tamil' // Most common case: Tamil content before English marker
      }
      
      // Extract metadata tags from default section
      const defaultMeta: LanguageMetadata = {}
      let defaultContent = contentBeforeFirst
      
      // Extract __TIT
      const titMatch = contentBeforeFirst.match(/_{1,2}TIT\s*:\s*(.+?)(?:\n|$)/i)
      if (titMatch) {
        defaultMeta.title = titMatch[1].trim()
        defaultContent = defaultContent.replace(/_{1,2}TIT\s*:\s*.+?(?:\n|$)/i, '').trim()
      }
      
      // Extract __RAG
      const ragMatch = contentBeforeFirst.match(/_{1,2}RAG\s*:\s*(.+?)(?:\n|$)/i)
      if (ragMatch) {
        defaultMeta.ragam = ragMatch[1].trim()
        defaultContent = defaultContent.replace(/_{1,2}RAG\s*:\s*.+?(?:\n|$)/i, '').trim()
      }
      
      // Extract __TAL
      const talMatch = contentBeforeFirst.match(/_{1,2}TAL\s*:\s*(.+?)(?:\n|$)/i)
      if (talMatch) {
        defaultMeta.talam = talMatch[1].trim()
        defaultContent = defaultContent.replace(/_{1,2}TAL\s*:\s*.+?(?:\n|$)/i, '').trim()
      }
      
      // Extract __COM
      const comMatch = contentBeforeFirst.match(/_{1,2}COM\s*:\s*(.+?)(?:\n|$)/i)
      if (comMatch) {
        defaultMeta.composer = comMatch[1].trim()
        defaultContent = defaultContent.replace(/_{1,2}COM\s*:\s*.+?(?:\n|$)/i, '').trim()
      }
      
      // Remove any remaining metadata tag lines
      defaultContent = defaultContent.replace(/_{1,2}[A-Z]+\s*:\s*.+?(?:\n|$)/gi, '').trim()
      
      if (defaultContent) {
        languages[defaultLang] = defaultContent
        if (!availableLanguages.includes(defaultLang)) {
          availableLanguages.push(defaultLang)
        }
        if (defaultMeta.title) {
          languageTitles[defaultLang] = defaultMeta.title
        }
        if (Object.keys(defaultMeta).length > 0) {
          languageMetadata[defaultLang] = defaultMeta
        }
      }
    }
  }
  
  // Extract content for each language section marked with _LAN:
  for (let i = 0; i < sourceLangMatches.length; i++) {
    const currentMatch = sourceLangMatches[i]
    const nextMatch = sourceLangMatches[i + 1]
    
    // Find the start of content after the _LAN marker
    let startIndex = currentMatch.index + currentMatch.matchText.length
    // Skip whitespace and newlines after marker
    while (startIndex < searchContent.length && /[\s\n\r]/.test(searchContent[startIndex])) {
      startIndex++
    }
    
    // Find the end - either next marker or end of content
    const endIndex = nextMatch ? nextMatch.index : searchContent.length
    
    // Extract the section content
    let sectionContent = searchContent.substring(startIndex, endIndex).trim()
    
    // If HTML, the content might have HTML tags - that's okay, we'll normalize it later
    // But if it's empty or just whitespace, log a warning
    const hasRealContent = sectionContent.length > 0 && !/^\s*$/.test(sectionContent)
    
    console.log(`Extracting content for ${currentMatch.code}:`, {
      startIndex,
      endIndex,
      contentLength: sectionContent.length,
      hasRealContent,
      preview: sectionContent.substring(0, 150).replace(/\n/g, '\\n'),
      beforeMarker: searchContent.substring(Math.max(0, currentMatch.index - 30), currentMatch.index),
      afterMarker: searchContent.substring(currentMatch.index, Math.min(searchContent.length, currentMatch.index + currentMatch.matchText.length + 30)),
    })
    
    // Extract metadata tags: __TIT, __RAG, __TAL, __COM, etc.
    // These tags might be in HTML, so search in the raw HTML string
    const langMeta: LanguageMetadata = {}
    let langContent = sectionContent
    
    // Helper to extract text from HTML match
    const extractTextFromMatch = (match: string): string => {
      // Remove HTML tags
      let text = match.replace(/<[^>]+>/g, '')
      // Decode HTML entities
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = text
      return (tempDiv.textContent || tempDiv.innerText || text).trim()
    }
    
    // Extract __TIT (Title) - search in HTML, tags might be wrapped in <p> or other tags
    // Pattern: __TIT: followed by text (may have HTML tags), until newline or next tag
    const titMatch = sectionContent.match(/_{1,2}TIT\s*:\s*([^<\n]*(?:<[^>]+>[^<\n]*)*?)(?:\n|<p|<\/p|$)/i)
    if (titMatch) {
      langMeta.title = extractTextFromMatch(titMatch[1])
      // Remove entire paragraph containing __TIT first to avoid leftover ">"
      langContent = langContent.replace(/<p[^>]*>.*?_{1,2}TIT\s*:\s*[^<]*(?:<[^>]+>[^<]*)*?<\/p>/gi, '').replace(/_{1,2}TIT\s*:\s*[^<\n]*(?:<[^>]+>[^<\n]*)*?(?:\n|<p|<\/p|$)/i, '').trim()
      console.log(`Extracted title for ${currentMatch.code}:`, langMeta.title)
    }
    
    // Extract __RAG (Ragam) - note: user uses __RAG : with space after colon
    const ragMatch = sectionContent.match(/_{1,2}RAG\s*\s*:\s*([^<\n]*(?:<[^>]+>[^<\n]*)*?)(?:\n|<p|<\/p|$)/i)
    if (ragMatch) {
      langMeta.ragam = extractTextFromMatch(ragMatch[1])
      // Remove entire paragraph containing __RAG first to avoid leftover ">"
      langContent = langContent.replace(/<p[^>]*>.*?_{1,2}RAG\s*\s*:\s*[^<]*(?:<[^>]+>[^<]*)*?<\/p>/gi, '').replace(/_{1,2}RAG\s*\s*:\s*[^<\n]*(?:<[^>]+>[^<\n]*)*?(?:\n|<p|<\/p|$)/i, '').trim()
      console.log(`Extracted ragam for ${currentMatch.code}:`, langMeta.ragam)
    }
    
    // Extract __TAL (Talam)
    const talMatch = sectionContent.match(/_{1,2}TAL\s*:\s*([^<\n]*(?:<[^>]+>[^<\n]*)*?)(?:\n|<p|<\/p|$)/i)
    if (talMatch) {
      langMeta.talam = extractTextFromMatch(talMatch[1])
      // Remove entire paragraph containing __TAL first to avoid leftover ">"
      langContent = langContent.replace(/<p[^>]*>.*?_{1,2}TAL\s*:\s*[^<]*(?:<[^>]+>[^<]*)*?<\/p>/gi, '').replace(/_{1,2}TAL\s*:\s*[^<\n]*(?:<[^>]+>[^<\n]*)*?(?:\n|<p|<\/p|$)/i, '').trim()
      console.log(`Extracted talam for ${currentMatch.code}:`, langMeta.talam)
    }
    
    // Extract __COM (Composer) or other custom tags
    const comMatch = sectionContent.match(/_{1,2}COM\s*:\s*([^<\n]*(?:<[^>]+>[^<\n]*)*?)(?:\n|<p|<\/p|$)/i)
    if (comMatch) {
      langMeta.composer = extractTextFromMatch(comMatch[1])
      // Remove entire paragraph containing __COM first to avoid leftover ">"
      langContent = langContent.replace(/<p[^>]*>.*?_{1,2}COM\s*:\s*[^<]*(?:<[^>]+>[^<]*)*?<\/p>/gi, '').replace(/_{1,2}COM\s*:\s*[^<\n]*(?:<[^>]+>[^<\n]*)*?(?:\n|<p|<\/p|$)/i, '').trim()
    }
    
    // Remove any remaining metadata tag lines (generic pattern)
    // Remove entire paragraphs first to avoid leftover ">" characters
    langContent = langContent.replace(/<p[^>]*>.*?_{1,2}[A-Z]+\s*:\s*[^<]*(?:<[^>]+>[^<]*)*?<\/p>/gi, '').trim()
    langContent = langContent.replace(/_{1,2}[A-Z]+\s*:\s*[^<\n]*(?:<[^>]+>[^<\n]*)*?(?:\n|<p|<\/p|$)/gi, '').trim()
    
    if (langContent && langContent.length > 0) {
      languages[currentMatch.code] = langContent
      if (!availableLanguages.includes(currentMatch.code)) {
        availableLanguages.push(currentMatch.code)
      }
      if (langMeta.title) {
        languageTitles[currentMatch.code] = langMeta.title
      }
      if (Object.keys(langMeta).length > 0) {
        languageMetadata[currentMatch.code] = langMeta
      }
    } else {
      console.warn(`No content found for language ${currentMatch.code} at index ${currentMatch.index}`)
    }
  }
  
  console.log('Final parsed languages:', {
    availableLanguages,
    languageKeys: Object.keys(languages),
    languageTitles: Object.keys(languageTitles),
    languageMetadata: Object.keys(languageMetadata),
  })

  return {
    hasMetadata: !!metadataMatch,
    metadata,
    languages,
    availableLanguages,
    languageTitles: Object.keys(languageTitles).length > 0 ? languageTitles : undefined,
    languageMetadata: Object.keys(languageMetadata).length > 0 ? languageMetadata : undefined,
  }
}
