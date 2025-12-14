import Dexie, { Table } from 'dexie'
import { Song, Deity, AppSettings, SearchHistory } from '../types'

export class GTDatabase extends Dexie {
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
  }
}

export const db = new GTDatabase()
