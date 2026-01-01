import Dexie, { Table } from 'dexie'
import { Song, Document, Deity, Category, Collection, AppSettings, SearchHistory } from '../types'
import { extractSongId } from '../utils/songId'

export class GTDatabase extends Dexie {
  // New tables for multi-collection
  collections!: Table<Collection>
  documents!: Table<Document>
  categories!: Table<Category>
  
  // Legacy tables (kept for migration)
  songs!: Table<Song>
  deities!: Table<Deity>
  
  settings!: Table<AppSettings>
  searchHistory!: Table<SearchHistory>

  constructor() {
    super('GTDatabase')
    
    // Version 1: Original schema
    this.version(1).stores({
      songs: 'id, driveFileId, deity, name, modifiedTime, cachedAt',
      deities: 'id, name, order, driveFolderId',
      settings: 'id'
    })

    // Version 2: Add favorites, view tracking, and search history
    this.version(2).stores({
      songs: 'id, driveFileId, deity, name, modifiedTime, cachedAt, isFavorite, viewCount, lastViewed',
      deities: 'id, name, order, driveFolderId',
      settings: 'id',
      searchHistory: '++id, query, timestamp'
    }).upgrade(tx => {
      // Add default values for new fields
      return tx.table('songs').toCollection().modify(song => {
        song.isFavorite = false
        song.viewCount = 0
        song.lastViewed = null
      })
    })

    // Version 3: Multi-collection architecture
    this.version(3).stores({
      // New tables
      collections: 'id, type, driveFolderId',
      documents: 'id, collectionId, collectionType, category, driveFileId, name, modifiedTime, isFavorite, viewCount, lastViewed',
      categories: 'id, collectionId, name, order',
      
      // Keep legacy tables for migration
      songs: 'id, driveFileId, deity, name, modifiedTime, cachedAt, isFavorite, viewCount, lastViewed',
      deities: 'id, name, order, driveFolderId',
      
      settings: 'id',
      searchHistory: '++id, query, timestamp'
    }).upgrade(tx => {
      // Migration will be handled by the migration utility
      console.log('Database upgraded to version 3 (multi-collection schema)')
      return Promise.resolve()
    })

    // Version 4: Add language to documents
    this.version(4).stores({
      collections: 'id, type, driveFolderId',
      documents: 'id, collectionId, collectionType, category, language, driveFileId, name, modifiedTime, isFavorite, viewCount, lastViewed',
      categories: 'id, collectionId, name, order',
      songs: 'id, driveFileId, deity, name, modifiedTime, cachedAt, isFavorite, viewCount, lastViewed',
      deities: 'id, name, order, driveFolderId',
      settings: 'id',
      searchHistory: '++id, query, timestamp'
    }).upgrade(async tx => {
      // Initialize existing documents with default language 'english' if missing
      try {
        await tx.table('documents').toCollection().modify((doc: any) => {
          if (!doc.language) {
            doc.language = 'english'
          }
        })
        console.log('✓ Backfilled language field for existing documents')
      } catch (e) {
        console.warn('Failed to backfill language for documents', e)
      }
    })

    // Version 5: Add multi-language content support and optional song IDs
    this.version(5).stores({
      collections: 'id, type, driveFolderId',
      documents: 'id, collectionId, collectionType, category, language, driveFileId, name, modifiedTime, isFavorite, viewCount, lastViewed',
      categories: 'id, collectionId, name, order',
      songs: 'id, driveFileId, deity, name, modifiedTime, cachedAt, isFavorite, viewCount, lastViewed',
      deities: 'id, name, order, driveFolderId',
      settings: 'id',
      searchHistory: '++id, query, timestamp'
    }).upgrade(async tx => {
      // Extract song IDs from filenames and add to documents
      try {
        await tx.table('documents').toCollection().modify((doc: any) => {
          // Extract song ID from filename if present
          if (doc.name && !doc.songId) {
            const songId = extractSongId(doc.name)
            if (songId) {
              doc.songId = songId
            }
          }
          // Initialize availableLanguages if not present
          if (!doc.availableLanguages) {
            doc.availableLanguages = undefined
          }
        })
        console.log('✓ Extracted song IDs and initialized multi-language support')
      } catch (e) {
        console.warn('Failed to upgrade documents to version 5', e)
      }
    })
  }
}

export const db = new GTDatabase()
