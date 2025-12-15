import { Song, Deity } from '../types'

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const DRIVE_EXPORT_BASE = 'https://www.googleapis.com/drive/v3/files'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  size?: string
  parents?: string[]
}

export interface DriveFolder {
  id: string
  name: string
  modifiedTime: string
}

/**
 * Google Drive API service using client-side OAuth
 */
export class DriveService {
  private accessToken: string | null = null

  setAccessToken(token: string) {
    this.accessToken = token
  }

  clearAccessToken() {
    this.accessToken = null
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.')
      }
      if (response.status === 403) {
        throw new Error('Access denied. Please check your Google Drive API permissions.')
      }
      throw new Error(`Drive API error: ${response.status} ${response.statusText}`)
    }

    return response
  }

  /**
   * Find a folder by name (generic method for multi-collection support)
   */
  async findFolderByName(folderName: string): Promise<DriveFolder | null> {
    const url = `${DRIVE_API_BASE}/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,modifiedTime)`
    const response = await this.makeRequest(url)
    const data = await response.json()
    
    if (data.files && data.files.length > 0) {
      return {
        id: data.files[0].id,
        name: data.files[0].name,
        modifiedTime: data.files[0].modifiedTime,
      }
    }
    
    return null
  }

  /**
   * Find the Namasankeerthanam folder (legacy method, uses findFolderByName)
   */
  async findNamasankeerthanamFolder(): Promise<DriveFolder | null> {
    return this.findFolderByName('Namasankeerthanam')
  }

  /**
   * List all folders in a parent folder
   */
  async listFolders(parentId: string): Promise<DriveFolder[]> {
    const url = `${DRIVE_API_BASE}/files?q='${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,modifiedTime)&orderBy=name`
    const response = await this.makeRequest(url)
    const data = await response.json()
    
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
    }))
  }

  /**
   * List all files in a folder
   */
  async listFiles(folderId: string): Promise<DriveFile[]> {
    const url = `${DRIVE_API_BASE}/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,mimeType,modifiedTime,size,parents)&orderBy=name`
    const response = await this.makeRequest(url)
    const data = await response.json()
    
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size,
      parents: file.parents,
    }))
  }

  /**
   * Export Google Doc as HTML
   */
  async exportAsHtml(fileId: string): Promise<string> {
    const url = `${DRIVE_EXPORT_BASE}/${fileId}/export?mimeType=text/html`
    const response = await this.makeRequest(url)
    return await response.text()
  }

  /**
   * Export Google Doc as plain text
   */
  async exportAsText(fileId: string): Promise<string> {
    const url = `${DRIVE_EXPORT_BASE}/${fileId}/export?mimeType=text/plain`
    const response = await this.makeRequest(url)
    return await response.text()
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<DriveFile> {
    const url = `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime,size,parents`
    const response = await this.makeRequest(url)
    return await response.json()
  }

  /**
   * Get image thumbnail URL
   */
  getImageThumbnailUrl(fileId: string, size: number = 500): string {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }
    return `${DRIVE_API_BASE}/files/${fileId}?alt=media&access_token=${this.accessToken}`
  }

  /**
   * Get full-size image URL
   */
  getImageUrl(fileId: string): string {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }
    return `${DRIVE_API_BASE}/files/${fileId}?alt=media&access_token=${this.accessToken}`
  }

  /**
   * Download image as blob
   */
  async downloadImageAsBlob(fileId: string): Promise<Blob> {
    const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`
    const response = await this.makeRequest(url)
    return await response.blob()
  }

  /**
   * Check if file is an image
   */
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  /**
   * Check if file is a PDF
   */
  isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf'
  }

  /**
   * Get PDF URL
   */
  getPdfUrl(fileId: string): string {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }
    return `${DRIVE_API_BASE}/files/${fileId}?alt=media&access_token=${this.accessToken}`
  }

  /**
   * Check if folder name starts with __ (non-deity folder)
   */
  isNonDeityFolder(folderName: string): boolean {
    return folderName.startsWith('__')
  }

  /**
   * Get all deity folders from Namasankeerthanam
   */
  async getDeityFolders(): Promise<Deity[]> {
    const namaFolder = await this.findNamasankeerthanamFolder()
    if (!namaFolder) {
      throw new Error('Namasankeerthanam folder not found')
    }

    const folders = await this.listFolders(namaFolder.id)
    const deityFolders: Deity[] = []

    for (const folder of folders) {
      // Skip non-deity folders (those starting with __)
      if (this.isNonDeityFolder(folder.name)) {
        continue
      }

      const files = await this.listFiles(folder.id)
      const songCount = files.filter(f => 
        f.mimeType === 'application/vnd.google-apps.document'
      ).length

      deityFolders.push({
        id: folder.id,
        name: folder.name,
        driveFolderId: folder.id,
        order: 0, // Will be set from settings
        songCount,
      })
    }

    return deityFolders.sort((a, b) => a.name.localeCompare(b.name))
  }
}

export const driveService = new DriveService()
