import Dexie, { Table } from 'dexie'
import { Song, Document, Deity, Category, Collection, AppSettings, SearchHistory } from '../types'

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
  }
}

export const db = new GTDatabase()
