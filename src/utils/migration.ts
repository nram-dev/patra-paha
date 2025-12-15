import { db } from '../db/database'
import { Collection, Document, Category } from '../types'

const MIGRATION_KEY = 'patrapaha_migration_v3_completed'

/**
 * Migrate from single-collection (GAnAmruta Thuli) to multi-collection (PatraPaha)
 * This runs once automatically on first load after upgrade
 */
export async function migrateToMultiCollection(): Promise<boolean> {
  try {
    // Check if already migrated
    const migrated = localStorage.getItem(MIGRATION_KEY)
    if (migrated === 'true') {
      console.log('✓ Migration already completed')
      return true
    }

    console.log('Starting migration to PatraPaha multi-collection...')

    // Check if there's existing data to migrate
    const existingSongs = await db.songs.toArray()
    const existingDeities = await db.deities.toArray()
    
    if (existingSongs.length === 0 && existingDeities.length === 0) {
      console.log('No existing data to migrate. Fresh install.')
      localStorage.setItem(MIGRATION_KEY, 'true')
      return true
    }

    console.log(`Found ${existingSongs.length} songs and ${existingDeities.length} deities to migrate`)

    // Step 1: Create default Bhajana collection
    const bhajanaCollection: Collection = {
      id: 'bhajana-default',
      type: 'bhajana',
      name: 'My Bhajans',
      nameDevanagari: 'मेरे भजन',
      nameTamil: 'எனது பஜன்கள்',
      icon: '🎵',
      color: '#FF9933',
      accentColor: '#E68A2E',
      driveFolderId: '', // Will be set on first sync
      driveFolderPath: '/Namasankeerthanam',
      features: ['deity-organization', 'seasonal-ordering', 'ragam-filter'],
      createdAt: new Date().toISOString(),
    }

    // Check if collection already exists
    const existingCollection = await db.collections.get('bhajana-default')
    if (!existingCollection) {
      await db.collections.add(bhajanaCollection)
      console.log('✓ Created default Bhajana collection')
    }

    // Step 2: Migrate songs to documents
    if (existingSongs.length > 0) {
      const documents: Document[] = existingSongs.map(song => ({
        ...song,
        collectionId: 'bhajana-default',
        collectionType: 'bhajana' as const,
        category: song.deity, // deity becomes category
      }))

      await db.documents.bulkPut(documents)
      console.log(`✓ Migrated ${documents.length} songs to documents`)
    }

    // Step 3: Migrate deities to categories
    if (existingDeities.length > 0) {
      const categories: Category[] = existingDeities.map(deity => ({
        id: deity.id,
        collectionId: 'bhajana-default',
        name: deity.name,
        driveFolderId: deity.driveFolderId,
        order: deity.order,
        documentCount: deity.songCount,
      }))

      await db.categories.bulkPut(categories)
      console.log(`✓ Migrated ${categories.length} deities to categories`)
    }

    // Step 4: Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'true')
    console.log('✓ Migration to PatraPaha completed successfully!')

    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}

/**
 * Check if migration is needed
 */
export function isMigrationNeeded(): boolean {
  return localStorage.getItem(MIGRATION_KEY) !== 'true'
}

/**
 * Reset migration flag (for testing)
 */
export function resetMigration(): void {
  localStorage.removeItem(MIGRATION_KEY)
  console.log('Migration flag reset. App will re-migrate on next load.')
}
