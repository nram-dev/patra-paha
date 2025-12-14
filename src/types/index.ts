export interface Song {
  id: string
  driveFileId: string
  name: string
  deity: string
  contentType: 'text' | 'image' | 'pdf' | 'audio'
  content?: string // For text songs
  imageUrl?: string // For images
  metadata?: SongMetadata
  modifiedTime: string
  cachedAt: string
  size: number
  isFavorite: boolean
  viewCount: number
  lastViewed: string | null
}

export interface SongMetadata {
  title?: string
  'title-tamil'?: string
  'title-sanskrit'?: string
  'title-malayalam'?: string
  'title-telugu'?: string
  ragam?: string
  talam?: string
  tags?: string[]
  deity?: string[]
  youtube?: string
  spotify?: string
  source?: string
  type?: string // bhajan/ashtapathi/virutham/etc
  language?: string // tamil/telugu/malayalam/sanskrit
}

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
  metadata: SongMetadata
  lyrics: string
}
