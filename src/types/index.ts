// Collection Types
export type CollectionType = 'bhajana' | 'anusthanam'

export interface Collection {
  id: string
  type: CollectionType
  name: string
  nameDevanagari?: string
  nameTamil?: string
  icon: string
  color: string
  accentColor: string
  driveFolderId: string
  driveFolderPath: string
  features: string[]
  createdAt: string
  lastSyncedAt?: string
}

export interface Category {
  id: string
  collectionId: string
  name: string
  driveFolderId: string
  order: number
  documentCount: number
  icon?: string
}

// Document (formerly Song) - now collection-aware
export interface Document {
  id: string
  collectionId: string
  collectionType: CollectionType
  driveFileId: string
  name: string
  category: string // deity name, folder name, etc.
  language: TitleLanguage
  contentType: 'text' | 'image' | 'pdf' | 'audio'
  content?: string | MultiLanguageContent
  imageUrl?: string
  metadata?: DocumentMetadata
  modifiedTime: string
  cachedAt: string
  size: number
  isFavorite: boolean
  viewCount: number
  lastViewed: string | null
  availableLanguages?: string[] // Languages available in multi-language content
  songId?: string // Optional: extracted from filename (e.g., G001)
  languageTitles?: { [language: string]: string } // Language-specific titles from __TIT markers
  languageMetadata?: { [language: string]: LanguageMetadata } // Language-specific metadata (__RAG, __TAL, etc.)
}

// Keep Song as alias for backward compatibility during migration
export type Song = Document

export interface DocumentMetadata {
  title?: string
  'title-tamil'?: string
  'title-sanskrit'?: string
  'title-malayalam'?: string
  'title-telugu'?: string
  ragam?: string
  talam?: string
  composer?: string
  tags?: string[]
  deity?: string[]
  youtube?: string
  spotify?: string
  source?: string
  type?: string // bhajan/ashtapathi/virutham/etc
  language?: string // tamil/telugu/malayalam/sanskrit
  
  // Anusthanam-specific metadata
  duration?: number // minutes
  materials?: string[] // checklist items
  steps?: string[] // procedure steps
}

// Language-specific metadata extracted from __TIT, __RAG, __TAL, etc.
export interface LanguageMetadata {
  title?: string // from __TIT
  ragam?: string // from __RAG
  talam?: string // from __TAL
  composer?: string // from __COM or other tags
  [key: string]: string | undefined // for other custom tags
}

// Keep SongMetadata as alias for backward compatibility
export type SongMetadata = DocumentMetadata

export interface Deity {
  id: string
  name: string
  driveFolderId: string
  order: number
  songCount: number
}

export interface AppSettings {
  id: string
  theme: 'calm' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  lineSpacing: 1.5 | 1.8 | 2.0
  language: 'english' | 'tamil' | 'sanskrit'
  deityOrder: string[]
  autoDownload: {
    text: boolean
    imagesOnView: boolean
    allImages: boolean
    pdfs: boolean
    audio: boolean
  }
}

export interface SearchHistory {
  id?: number
  query: string
  timestamp: string
}

export type SortOption = 'alphabetical' | 'recent' | 'mostViewed' | 'recentlyModified'

export type TitleLanguage = 'english' | 'tamil' | 'sanskrit'

export interface ParsedContent {
  hasMetadata: boolean
  metadata: DocumentMetadata
  lyrics: string
}

// Multi-language content structure
export type MultiLanguageContent = {
  [language: string]: string // language keys: 'english', 'sanskrit', 'tamil'
}

// Collection Configuration Types
export interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'url' | 'array'
}

export interface CollectionConfig {
  id: string
  type: CollectionType
  name: string
  nameDevanagari?: string
  nameTamil?: string
  icon: string
  color: string
  accentColor: string
  features: string[]
  organizationTypes: string[]
  metadataFields: MetadataField[]
}
