import { db } from '../db/database'
import { driveService } from './driveService'
import { Category, Collection, Document } from '../types'
import { extractSongId } from '../utils/songId'

/**
 * Scan a collection's Drive folder to discover categories (subfolders)
 * and persist them into IndexedDB.
 */
export async function scanCollection(collection: Collection): Promise<void> {
  // Resolve folder id if missing (based on stored path name)
  let driveFolderId = collection.driveFolderId
  if (!driveFolderId && collection.driveFolderPath) {
    const name = collection.driveFolderPath.replace(/^\//, '')
    const folder = await driveService.findFolderByName(name)
    if (!folder) {
      throw new Error(`Folder "${name}" not found`)
    }
    driveFolderId = folder.id
    await db.collections.update(collection.id, { driveFolderId: folder.id })
  }

  if (!driveFolderId) {
    throw new Error('No Drive folder set for this collection')
  }

  const folders = await driveService.listFolders(driveFolderId)

  // Filter out special folders (starting with "__") for collections with deity-organization feature
  const shouldFilterSpecialFolders = collection.features?.includes('deity-organization')
  const filteredFolders = shouldFilterSpecialFolders
    ? folders.filter(f => !driveService.isNonDeityFolder(f.name))
    : folders

  const categories: Category[] = []
  const documentsToUpsert: Document[] = []

  for (let index = 0; index < filteredFolders.length; index++) {
    const folder = filteredFolders[index]
    // Scan root folder only (not language subfolders like ENG/TAM/SAN)
    // Skip language subfolders
    if (folder.name === 'ENG' || folder.name === 'TAM' || folder.name === 'SAN') {
      continue
    }
    
    // Count supported files
    const files = await driveService.listFiles(folder.id)
    const supported = files.filter(
      f =>
        f.mimeType === 'application/vnd.google-apps.document' ||
        driveService.isImageFile(f.mimeType) ||
        driveService.isPdfFile(f.mimeType) ||
        driveService.isAudioFile(f.mimeType, f.name)
    )

    categories.push({
      id: folder.id,
      collectionId: collection.id,
      name: folder.name,
      driveFolderId: folder.id,
      order: index,
      documentCount: supported.length,
    })

    // Prepare document metadata entries (no content download here)
    for (const file of supported) {
      const isImage = driveService.isImageFile(file.mimeType)
      const isPdf = driveService.isPdfFile(file.mimeType)
      const isAudio = driveService.isAudioFile(file.mimeType, file.name)
      let contentType: 'text' | 'image' | 'pdf' | 'audio' = 'text'
      if (isImage) contentType = 'image'
      else if (isPdf) contentType = 'pdf'
      else if (isAudio) contentType = 'audio'

      // Extract optional song ID from filename
      const songId = extractSongId(file.name)

      documentsToUpsert.push({
        id: file.id,
        collectionId: collection.id,
        collectionType: collection.type,
        driveFileId: file.id,
        name: file.name,
        category: folder.name,
        language: 'english', // Default, will be determined when content is parsed
        contentType,
        imageUrl: isImage
          ? driveService.getImageUrl(file.id)
          : isPdf
          ? driveService.getPdfUrl(file.id)
          : undefined,
        modifiedTime: file.modifiedTime,
        cachedAt: new Date().toISOString(),
        size: parseInt(file.size || '0', 10),
        isFavorite: false,
        viewCount: 0,
        lastViewed: null,
        songId: songId || undefined,
      })
    }
  }

  // Replace existing categories for this collection
  await db.categories.where('collectionId').equals(collection.id).delete()
  if (categories.length > 0) {
    await db.categories.bulkPut(categories)
  }

  // Replace existing document metadata for this collection
  await db.documents.where('collectionId').equals(collection.id).delete()
  if (documentsToUpsert.length > 0) {
    await db.documents.bulkPut(documentsToUpsert)
  }
}


