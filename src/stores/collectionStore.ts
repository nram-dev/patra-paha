import { create } from 'zustand'
import { Collection } from '../types'
import { db } from '../db/database'

interface CollectionState {
  collections: Collection[]
  activeCollectionId: string | null
  documentCounts: Record<string, number>
  scanErrors: Record<string, string | null>
  
  // Actions
  loadCollections: () => Promise<void>
  setActiveCollection: (id: string) => void
  addCollection: (collection: Collection) => Promise<void>
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  refreshDocumentCounts: () => Promise<void>
  setScanError: (id: string, error: unknown) => void
  clearScanError: (id: string) => void
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  activeCollectionId: null,
  documentCounts: {},
  scanErrors: {},

  loadCollections: async () => {
    try {
      const collections = await db.collections.toArray()
      set({ collections })
      
      // Also refresh document counts
      await get().refreshDocumentCounts()
    } catch (error) {
      console.error('Failed to load collections:', error)
    }
  },

  setActiveCollection: (id: string) => {
    set({ activeCollectionId: id })
  },

  addCollection: async (collection: Collection) => {
    try {
      await db.collections.add(collection)
      await get().loadCollections()
    } catch (error) {
      console.error('Failed to add collection:', error)
      throw error
    }
  },

  updateCollection: async (id: string, updates: Partial<Collection>) => {
    try {
      await db.collections.update(id, updates)
      await get().loadCollections()
    } catch (error) {
      console.error('Failed to update collection:', error)
      throw error
    }
  },

  deleteCollection: async (id: string) => {
    try {
      await db.collections.delete(id)
      await get().loadCollections()
    } catch (error) {
      console.error('Failed to delete collection:', error)
      throw error
    }
  },

  refreshDocumentCounts: async () => {
    try {
      const collections = get().collections
      const counts: Record<string, number> = {}
      
      for (const collection of collections) {
        const count = await db.documents
          .where('collectionId')
          .equals(collection.id)
          .count()
        counts[collection.id] = count
      }
      
      set({ documentCounts: counts })
    } catch (error) {
      console.error('Failed to refresh document counts:', error)
    }
  },

  setScanError: (id: string, error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Unknown error'
    set(state => ({
      scanErrors: {
        ...state.scanErrors,
        [id]: message,
      },
    }))
  },

  clearScanError: (id: string) => {
    set(state => {
      const next = { ...state.scanErrors }
      delete next[id]
      return { scanErrors: next }
    })
  },
}))
