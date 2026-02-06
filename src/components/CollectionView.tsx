import { Box, IconButton, useToast, HStack, Text, Spinner, VStack, Menu, MenuButton, MenuList, MenuItem, Button, useColorMode, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, useDisclosure, useBreakpointValue } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { driveService } from '../services/driveService'
import { db } from '../db/database'
import Header, { LayoutMode } from './layout/Header'
import Navigation from './layout/Navigation'
import SongList from './layout/SongList'
import SongViewer from './layout/SongViewer'
import AudioPanel from './layout/AudioPanel'
import Search from './Search'
import { Deity, Song, TitleLanguage, Document, SortOption, ExtractedLink } from '../types'
import { useCollectionStore } from '../stores/collectionStore'
import { getCollectionConfig } from '../config/collections'
import { parseMultiLanguageContent } from '../services/metadataParser'
import { extractSongId } from '../utils/songId'
import { getSongTitle } from '../utils/songTitle'
import { extractFirstYouTubeUrl } from '../utils/extractYouTubeUrl'
import { extractLinksFromHtml, filterMediaLinks } from '../utils/extractLinks'

const extractFirstYouTubeUrlFromSong = (song: Song | null): string | null => {
  if (!song) return null

  const metadataUrl = song.metadata?.youtube?.trim()
  if (metadataUrl) {
    return extractFirstYouTubeUrl([metadataUrl]) ?? metadataUrl
  }

  const contentValues: string[] = []
  if (typeof song.content === 'string') {
    contentValues.push(song.content)
  } else if (song.content && typeof song.content === 'object') {
    Object.values(song.content).forEach((value) => {
      if (typeof value === 'string') contentValues.push(value)
    })
  }

  return extractFirstYouTubeUrl(contentValues)
}

interface CollectionViewProps {
  onLogout: () => void
}

export const CollectionView = ({ onLogout }: CollectionViewProps) => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { colorMode } = useColorMode()
  const { collections, setScanError, clearScanError } = useCollectionStore()

  // Responsive breakpoints - auto detection
  const autoIsMobile = useBreakpointValue({ base: true, md: false }) ?? true
  const autoIsTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false
  const autoIsDesktop = useBreakpointValue({ base: false, lg: true }) ?? false

  // Layout mode override (persisted in localStorage)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const stored = localStorage.getItem('layoutMode')
    return (stored as LayoutMode) || 'auto'
  })

  const handleLayoutModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode)
    localStorage.setItem('layoutMode', mode)
  }

  // Apply layout mode override (only affects non-mobile)
  const isMobile = autoIsMobile
  const isTablet = layoutMode === 'tablet' ? true : layoutMode === 'desktop' ? false : autoIsTablet
  const isDesktop = layoutMode === 'desktop' ? true : layoutMode === 'tablet' ? false : autoIsDesktop

  // Orientation detection for tablet portrait auto-collapse
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth
  })

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100)
    })

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  // Mobile drawer for navigation
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()

  // Mobile panel state
  const [activeMobilePanel, setActiveMobilePanel] = useState<'categories' | 'songs' | 'viewer' | 'audio'>('songs')
  
  const [deities, setDeities] = useState<Deity[]>([])
  const [selectedDeity, setSelectedDeity] = useState<Deity | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [nowPlayingSong, setNowPlayingSong] = useState<Song | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewerLoading, setViewerLoading] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioPanelHeight, setAudioPanelHeight] = useState(180)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [showingFavorites, setShowingFavorites] = useState(false)
  const [language, setLanguage] = useState<TitleLanguage>('english')
  const [isColumn1Collapsed, setIsColumn1Collapsed] = useState(false)
  const [isColumn2Collapsed, setIsColumn2Collapsed] = useState(false)
  // Track if user manually toggled columns (to avoid overriding their preference)
  const userToggledColumn1 = useRef(false)
  const userToggledColumn2 = useRef(false)
  const [showEmptyCategories, setShowEmptyCategories] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical')
  const [externalUrl, setExternalUrl] = useState<string | null>(null)
  const [externalUrlTitle, setExternalUrlTitle] = useState<string | null>(null)
  const [docExternalUrl, setDocExternalUrl] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium')
  const [isAudioPanelCollapsed, setIsAudioPanelCollapsed] = useState(false)

  useEffect(() => {
    setDocExternalUrl(null)
  }, [selectedSong?.id])

  const autoExternalUrl = useMemo(
    () => docExternalUrl ?? extractFirstYouTubeUrlFromSong(selectedSong),
    [docExternalUrl, selectedSong]
  )

  const sortOptions: Record<SortOption, string> = {
    alphabetical: 'Alphabetical',
    recent: 'Recently Viewed',
    mostViewed: 'Most Viewed',
    recentlyModified: 'Recently Modified',
  }

  // Get collection config
  const collection = collections.find(c => c.id === collectionId)
  const collectionConfig = collection ? getCollectionConfig(collection.id) : null

  // Determine labels based on collection type
  const isBhajana = collection?.type === 'bhajana'
  const categoryLabel = isBhajana ? 'Deities' : 'Categories'
  const categoryLabelSingular = isBhajana ? 'deity' : 'category'
  const itemLabel = isBhajana ? 'song' : 'item'
  const itemsLabel = isBhajana ? 'Songs' : 'Items'

  // Redirect if collection not found
  useEffect(() => {
    if (!collection && collectionId) {
      toast({
        title: 'Collection not found',
        description: 'Redirecting to home...',
        status: 'error',
        duration: 3000,
      })
      navigate('/')
    }
  }, [collection, collectionId, navigate, toast])

  // Clear Items panel and audio when collection changes
  useEffect(() => {
    setSongs([])
    setSelectedSong(null)
    setSelectedDeity(null)
    setShowingFavorites(false)
    setExternalUrl(null)
    setExternalUrlTitle(null)
    // Clear audio state
    setNowPlayingSong(null)
    setAudioBlobUrl(null)
  }, [collectionId])

  // Load language preference from settings
  useEffect(() => {
    const loadLanguage = async () => {
      const settings = await db.settings.get('app')
      if (settings && settings.language) {
        setLanguage(settings.language)
      }
    }
    loadLanguage()
  }, [])

  // Load documents for this collection
  useEffect(() => {
    const loadCollectionDocuments = async () => {
      if (!collectionId) return
      
      const docs = await db.documents
        .where('collectionId')
        .equals(collectionId)
        .toArray()
      setAllSongs(docs)
    }
    
    loadCollectionDocuments()
  }, [collectionId])

  // Load categories (deities or folders) for this collection
  useEffect(() => {
    const loadCategories = async () => {
      if (!collectionId) return

      try {
        setLoading(true)
        // On a fresh load attempt, clear any previous error for this collection
        clearScanError(collectionId)
        const cats = await db.categories
          .where('collectionId')
          .equals(collectionId)
          .sortBy('order')
        
        // Convert categories to deities format for compatibility
        const deityList: Deity[] = cats.map(cat => ({
          id: cat.id,
          name: cat.name,
          driveFolderId: cat.driveFolderId,
          order: cat.order,
          songCount: cat.documentCount,
        }))
        
        setDeities(deityList)
      } catch (error) {
        console.error('Failed to load categories:', error)
        if (collectionId) {
          setScanError(collectionId, error)
        }
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [collectionId])

  // Load column collapse state and empty categories preference from localStorage
  useEffect(() => {
    const col1Collapsed = localStorage.getItem('column1Collapsed') === 'true'
    const col2Collapsed = localStorage.getItem('column2Collapsed') === 'true'
    const audioPanelCollapsed = localStorage.getItem('audioPanelCollapsed') === 'true'
    const emptyCategories = localStorage.getItem('showEmptyCollections') === 'true'
    setIsColumn1Collapsed(col1Collapsed)
    setIsColumn2Collapsed(col2Collapsed)
    setIsAudioPanelCollapsed(audioPanelCollapsed)
    setShowEmptyCategories(emptyCategories)
  }, [])

  // Auto-collapse panels based on layout mode
  // Desktop: expand all panels
  // Tablet Landscape: collapse Column 1 (Categories)
  // Tablet Portrait: collapse both Column 1 and Column 2
  useEffect(() => {
    if (isDesktop) {
      // Desktop mode: expand all panels
      setIsColumn1Collapsed(false)
      setIsColumn2Collapsed(false)
      setIsAudioPanelCollapsed(false)
      // Reset manual toggle tracking
      userToggledColumn1.current = false
      userToggledColumn2.current = false
    } else if (isTablet) {
      // Only auto-adjust if user hasn't manually toggled
      if (!userToggledColumn1.current) {
        // Always collapse Column 1 in tablet mode (both portrait and landscape)
        setIsColumn1Collapsed(true)
      }
      if (!userToggledColumn2.current) {
        // Collapse Column 2 only in portrait mode
        setIsColumn2Collapsed(isPortrait)
      }
      // Collapse audio panel in tablet mode
      setIsAudioPanelCollapsed(true)
    } else {
      // Mobile mode: reset manual toggle tracking
      userToggledColumn1.current = false
      userToggledColumn2.current = false
    }
  }, [isDesktop, isTablet, isPortrait])

  // Cleanup audio blob URLs when track changes/unmounts
  useEffect(() => {
    return () => {
      if (audioBlobUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(audioBlobUrl)
      }
    }
  }, [audioBlobUrl])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        toggleColumn1()
      }
      if (e.altKey && e.key === '2') {
        e.preventDefault()
        toggleColumn2()
      }
      if (e.altKey && e.key === '3') {
        e.preventDefault()
        toggleEmptyCategories()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDeitySelect = async (deity: Deity | null, _languageOverride?: TitleLanguage) => {
    if (!deity) return
    setSelectedDeity(deity)
    setSelectedSong(null)
    setShowingFavorites(false)
    // Clear audio state when category changes
    setNowPlayingSong(null)
    setAudioBlobUrl(null)
    
    try {
      if (collectionId) {
        clearScanError(collectionId)
      }
      
      // Always load from root deity folder (not language subfolders)
      const targetFolderId = deity.driveFolderId
      
      // Check cache first
      const cachedDocs = await db.documents
        .where('collectionId')
        .equals(collectionId!)
        .and(doc => doc.category === deity.name)
        .toArray()
      
      const hasCache = cachedDocs.length > 0
      if (hasCache) {
        setSongs(cachedDocs)
      }

      // Only show loading state when we have no cache
      setLoading(!hasCache)
      
      // Load from Drive root folder (refresh even with cache to pick up audio)
      const files = await driveService.listFiles(targetFolderId)
        
      const supportedFiles = files.filter(f => 
        f.mimeType === 'application/vnd.google-apps.document' ||
        driveService.isImageFile(f.mimeType) ||
        driveService.isPdfFile(f.mimeType) ||
        driveService.isAudioFile(f.mimeType, f.name)
      )
      
      const docList: Document[] = supportedFiles.map(file => {
        const isImage = driveService.isImageFile(file.mimeType)
        const isPdf = driveService.isPdfFile(file.mimeType)
        const isAudio = driveService.isAudioFile(file.mimeType, file.name)
        
        let contentType: 'text' | 'image' | 'pdf' | 'audio' = 'text'
        if (isImage) contentType = 'image'
        else if (isPdf) contentType = 'pdf'
        else if (isAudio) contentType = 'audio'
        
        // Extract optional song ID from filename
        const songId = extractSongId(file.name)
        
        return {
          id: file.id,
          collectionId: collectionId!,
          collectionType: collection!.type,
          driveFileId: file.id,
          name: file.name,
          category: deity.name,
          language: 'english', // Default, will be determined when content is parsed
          contentType,
          imageUrl: isImage ? driveService.getImageUrl(file.id) : isPdf ? driveService.getPdfUrl(file.id) : undefined,
          modifiedTime: file.modifiedTime,
          cachedAt: new Date().toISOString(),
          size: parseInt(file.size || '0', 10),
          isFavorite: false,
          viewCount: 0,
          lastViewed: null,
          songId: songId || undefined,
        }
      })
      
      setSongs(docList)
      await db.documents.bulkPut(docList)
    } catch (error) {
      console.error('Failed to load documents:', error)
      if (collectionId) {
        setScanError(collectionId, error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFavoritesSelect = async () => {
    setShowingFavorites(true)
    setSelectedDeity(null)
    setSelectedSong(null)
    // Clear audio state when switching to favorites
    setNowPlayingSong(null)
    setAudioBlobUrl(null)
    
    try {
      setLoading(true)
      const favDocs = await db.documents
        .where('collectionId')
        .equals(collectionId!)
        .and(doc => doc.isFavorite === true)
        .toArray()
      setSongs(favDocs)
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (song: Song) => {
    const updated = { ...song, isFavorite: !song.isFavorite }
    await db.documents.update(song.id, { isFavorite: updated.isFavorite })
    
    setSongs(prev => prev.map(s => s.id === song.id ? updated : s))
    setAllSongs(prev => prev.map(s => s.id === song.id ? updated : s))
    
    if (showingFavorites && !updated.isFavorite) {
      setSongs(prev => prev.filter(s => s.id !== song.id))
    }
  }

  const updateViewData = async (song: Song) => {
    const updatedViewData = {
      ...song,
      viewCount: (song.viewCount || 0) + 1,
      lastViewed: new Date().toISOString(),
    }
    await db.documents.update(song.id, {
      viewCount: updatedViewData.viewCount,
      lastViewed: updatedViewData.lastViewed,
    })
    return updatedViewData
  }

  const handleContentSelect = async (song: Song) => {
    if (song.contentType === 'audio') return
    setExternalUrl(null)
    setExternalUrlTitle(null)
    setSelectedSong(song)
    // Clear audio state when selecting a new document
    setNowPlayingSong(null)
    setAudioBlobUrl(null)

    const updatedViewData = await updateViewData(song)

    // Handle PDF and image files - fetch blob URL to bypass CORS
    if (song.contentType === 'pdf' || song.contentType === 'image') {
      try {
        setViewerLoading(true)
        // Fetch blob URL (bypasses CORS issues with direct Google Drive URLs)
        const blobUrl = await driveService.getFileBlobUrl(song.driveFileId)
        const updatedSong = {
          ...updatedViewData,
          imageUrl: blobUrl,
        }
        setSelectedSong(updatedSong)
        // Note: We don't cache blob URLs in DB as they're temporary
      } catch (error) {
        console.error('Failed to load file:', error)
      } finally {
        setViewerLoading(false)
      }
      return
    }

    if (!song.content && song.contentType === 'text') {
      try {
        setViewerLoading(true)
        const html = await driveService.exportAsHtml(song.driveFileId)
        
        // Parse multi-language content
        const parsed = parseMultiLanguageContent(html)
        
        console.log('Parsed multi-language content:', {
          availableLanguages: parsed.availableLanguages,
          languageCount: parsed.availableLanguages.length,
          languages: Object.keys(parsed.languages),
        })
        
        // If multi-language content detected, store it as MultiLanguageContent
        // Otherwise, store as single string (backward compatible)
        const isMultiLang = parsed.availableLanguages.length > 1
        const content = isMultiLang 
          ? parsed.languages 
          : parsed.languages[parsed.availableLanguages[0] || 'english'] || html
        
        console.log('Storing content:', {
          isMultiLang,
          contentType: typeof content,
          contentKeys: typeof content === 'object' ? Object.keys(content) : 'string',
          availableLanguages: isMultiLang ? parsed.availableLanguages : undefined,
        })
        
        const updatedSong = {
          ...updatedViewData,
          content,
          metadata: parsed.metadata || updatedViewData.metadata,
          availableLanguages: isMultiLang ? parsed.availableLanguages : undefined,
          languageTitles: parsed.languageTitles,
          languageMetadata: parsed.languageMetadata,
          cachedAt: new Date().toISOString(),
        }
        
        setSelectedSong(updatedSong)
        await db.documents.put(updatedSong)
      } catch (error) {
        console.error('Failed to load document content:', error)
      } finally {
        setViewerLoading(false)
      }
    } else if (song.content && typeof song.content === 'string' && song.contentType === 'text') {
      // Re-parse cached content to check if it's multi-language
      // This handles the case where content was cached before multi-language support
      try {
        const parsed = parseMultiLanguageContent(song.content)
        const isMultiLang = parsed.availableLanguages.length > 1
        
        console.log('Re-parsing cached content:', {
          isMultiLang,
          availableLanguages: parsed.availableLanguages,
          currentAvailableLanguages: song.availableLanguages,
        })
        
        if (isMultiLang) {
          // Update the song with multi-language structure
          const updatedSong = {
            ...updatedViewData,
            content: parsed.languages,
            metadata: parsed.metadata || song.metadata,
            availableLanguages: parsed.availableLanguages,
            languageTitles: parsed.languageTitles,
            languageMetadata: parsed.languageMetadata,
          }
          
          console.log('Updating cached song to multi-language:', {
            contentKeys: Object.keys(parsed.languages),
            availableLanguages: parsed.availableLanguages,
          })
          
          setSelectedSong(updatedSong)
          await db.documents.put(updatedSong)
        }
      } catch (error) {
        console.error('Failed to re-parse cached content:', error)
      }
    }
  }

  const handleAudioSelect = async (song: Song) => {
    if (song.contentType !== 'audio') return
    setExternalUrl(null)
    setExternalUrlTitle(null)
    const updatedViewData = await updateViewData(song)

    try {
      setAudioLoading(true)
      const blobUrl = await driveService.getFileBlobUrl(song.driveFileId)
      const updatedSong = {
        ...updatedViewData,
        imageUrl: blobUrl,
      }
      setNowPlayingSong(updatedSong)
      setAudioBlobUrl(blobUrl)
    } catch (error) {
      console.error('Failed to load audio:', error)
    } finally {
      setAudioLoading(false)
    }
  }

  const sortedSongs = useMemo(() => {
    const songsCopy = [...songs]
    
    switch (sortBy) {
      case 'alphabetical':
        return songsCopy.sort((a, b) => {
          const titleA = getSongTitle(a, language).toLowerCase()
          const titleB = getSongTitle(b, language).toLowerCase()
          return titleA.localeCompare(titleB)
        })
      case 'recent':
        return songsCopy.sort((a, b) => {
          if (!a.lastViewed) return 1
          if (!b.lastViewed) return -1
          return new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
        })
      case 'mostViewed':
        return songsCopy.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      case 'recentlyModified':
        return songsCopy.sort((a, b) => 
          new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
        )
      default:
        return songsCopy
    }
  }, [songs, sortBy, language])

  const viewableSongs = useMemo(
    () => sortedSongs.filter(song => song.contentType !== 'audio'),
    [sortedSongs]
  )
  const docSongs = useMemo(
    () => viewableSongs.filter(song => song.contentType === 'text' || song.contentType === 'pdf'),
    [viewableSongs]
  )
  const imageSongs = useMemo(
    () => viewableSongs.filter(song => song.contentType === 'image'),
    [viewableSongs]
  )
  const audioSongs = useMemo(
    () => sortedSongs.filter(song => song.contentType === 'audio'),
    [sortedSongs]
  )

  const handleAdjacentSelect = (direction: 'prev' | 'next') => {
    if (!selectedSong) return
    const currentIndex = viewableSongs.findIndex(song => song.id === selectedSong.id)
    if (currentIndex === -1) return
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    const nextSong = viewableSongs[nextIndex]
    if (nextSong) {
      handleContentSelect(nextSong)
    }
  }

  const audioQueue = audioSongs

  // Extract links from the selected song's content (YouTube/Spotify only)
  const documentLinks: ExtractedLink[] = useMemo(() => {
    if (!selectedSong?.content) return []

    // Get HTML content - could be string or MultiLanguageContent
    let htmlContent = ''
    if (typeof selectedSong.content === 'string') {
      htmlContent = selectedSong.content
    } else if (typeof selectedSong.content === 'object') {
      // Combine all language content for link extraction
      htmlContent = Object.values(selectedSong.content).join('\n')
    }

    if (!htmlContent) return []

    // Extract and filter to only YouTube/Spotify links
    const allLinks = extractLinksFromHtml(htmlContent)
    return filterMediaLinks(allLinks)
  }, [selectedSong?.content])

  const handleAudioAdjacentSelect = (direction: 'prev' | 'next') => {
    if (!nowPlayingSong) return
    const currentIndex = audioQueue.findIndex(song => song.id === nowPlayingSong.id)
    if (currentIndex === -1) return
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    const nextSong = audioQueue[nextIndex]
    if (nextSong) {
      handleAudioSelect(nextSong)
    }
  }

  const handleSearchSongSelect = async (song: Song) => {
    setExternalUrl(null)
    setExternalUrlTitle(null)
    const deity = deities.find(d => d.name === song.category)
    if (deity) {
      setSelectedDeity(deity)
      const deitySongs = await db.documents
        .where('collectionId')
        .equals(collectionId!)
        .and(doc => doc.category === deity.name)
        .toArray()
      setSongs(deitySongs)
    }
    if (song.contentType === 'audio') {
      await handleAudioSelect(song)
    } else {
      await handleContentSelect(song)
    }
  }

  const handleLanguageChange = async (newLanguage: TitleLanguage) => {
    setLanguage(newLanguage)
    
    const settings = await db.settings.get('app')
    if (settings) {
      await db.settings.update('app', { language: newLanguage })
    } else {
      await db.settings.put({
        id: 'app',
        theme: 'calm',
        fontSize: 'medium',
        lineSpacing: 1.8,
        language: newLanguage,
        deityOrder: [],
        autoDownload: {
          text: true,
          imagesOnView: false,
          allImages: false,
          pdfs: false,
          audio: false,
        },
      })
    }
    // Language change now only affects title display, not document loading
    // All languages are in the same document, so no need to reload
  }

  const toggleColumn1 = () => {
    const newState = !isColumn1Collapsed
    setIsColumn1Collapsed(newState)
    localStorage.setItem('column1Collapsed', String(newState))
    // Mark that user manually toggled (for tablet auto-collapse)
    if (isTablet) {
      userToggledColumn1.current = true
    }
  }

  const toggleColumn2 = () => {
    const newState = !isColumn2Collapsed
    setIsColumn2Collapsed(newState)
    localStorage.setItem('column2Collapsed', String(newState))
    // Mark that user manually toggled (for tablet portrait auto-collapse)
    if (isTablet) {
      userToggledColumn2.current = true
    }
  }

  const toggleEmptyCategories = () => {
    const newState = !showEmptyCategories
    setShowEmptyCategories(newState)
    localStorage.setItem('showEmptyCollections', String(newState))
  }

  const toggleAudioPanel = () => {
    const newState = !isAudioPanelCollapsed
    setIsAudioPanelCollapsed(newState)
    localStorage.setItem('audioPanelCollapsed', String(newState))
  }

  if (!collection || !collectionConfig) {
    return null
  }

  return (
    <Box h="100vh" display="flex" flexDirection="column" bg="calm.background">
      <Header
        onLogout={onLogout}
        onSearchOpen={() => setIsSearchOpen(true)}
        language={language}
        onLanguageChange={handleLanguageChange}
        collectionName={collection.name}
        collectionIcon={collection.icon}
        collectionId={collection.id}
        showingFavorites={showingFavorites}
        onFavoritesSelect={handleFavoritesSelect}
        // Responsive props
        categories={showEmptyCategories ? deities : deities.filter(d => d.songCount > 0)}
        selectedCategory={selectedDeity}
        onCategorySelect={handleDeitySelect}
        onMobileMenuOpen={onDrawerOpen}
        // Layout mode override
        layoutMode={layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        // Font size controls
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        // Document title
        documentTitle={selectedSong?.metadata?.title || selectedSong?.name}
        // Collections for desktop dropdown
        collections={collections}
      />
      {/* Mobile Drawer for Categories */}
      <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent bg={colorMode === 'dark' ? 'dark.panelPrimary' : 'calm.panelPrimary'}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">{categoryLabel}</DrawerHeader>
          <DrawerBody p={0}>
            <Navigation
              deities={showEmptyCategories ? deities : deities.filter(d => d.songCount > 0)}
              selectedDeity={selectedDeity}
              onDeitySelect={(deity) => {
                handleDeitySelect(deity)
                onDrawerClose()
                if (isMobile) setActiveMobilePanel('songs')
              }}
              showingFavorites={showingFavorites}
              loading={loading}
              categoryLabel={categoryLabel}
              itemLabel={itemLabel}
              isDrawerMode
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box flex="1" display="flex" overflow="hidden" position="relative">
        {/* Column 1: Navigation - Desktop and Tablet Landscape */}
        {(isDesktop || (isTablet && !isPortrait)) && !isColumn1Collapsed && (
          <Navigation
            deities={showEmptyCategories ? deities : deities.filter(d => d.songCount > 0)}
            selectedDeity={selectedDeity}
            onDeitySelect={handleDeitySelect}
            showingFavorites={showingFavorites}
            loading={loading}
            categoryLabel={categoryLabel}
            itemLabel={itemLabel}
          />
        )}

        {/* Toggle button for Column 1 - Desktop and Tablet Landscape */}
        {(isDesktop || (isTablet && !isPortrait)) && (
          <IconButton
            aria-label={isColumn1Collapsed ? 'Expand navigation' : 'Collapse navigation'}
            icon={isColumn1Collapsed ? <ChevronRightIcon boxSize={5} /> : <ChevronLeftIcon boxSize={5} />}
            onClick={toggleColumn1}
            size="md"
            position="absolute"
            left={isColumn1Collapsed ? 0 : (isTablet ? '200px' : '200px')}
            top="50%"
            transform="translateY(-50%)"
            zIndex={10}
            bg={colorMode === 'dark' ? 'orange.500' : 'orange.400'}
            color="white"
            _hover={{ bg: colorMode === 'dark' ? 'orange.400' : 'orange.500' }}
            borderRadius="full"
            boxShadow="md"
            transition="all 0.3s"
          />
        )}

        {/* Column 2: Song List */}
        {/* Desktop/Tablet: Show based on collapse state; Mobile: Show only when activeMobilePanel is 'songs' */}
        {((isDesktop || isTablet) && !isColumn2Collapsed) || (isMobile && activeMobilePanel === 'songs') ? (
          <Box
            w={{ base: '100%', md: '240px', lg: '280px' }}
            h="100%"
            bg={colorMode === 'dark' ? 'dark.panelSecondary' : 'calm.panelSecondary'}
            borderRight={{ base: 'none', md: '1px' }}
            borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
            overflowY="auto"
          >
            <Box p={4}>
              <HStack justify="space-between" mb={3}>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {itemsLabel} ({sortedSongs.length})
                </Text>
                <Menu>
                  <MenuButton
                    as={Button}
                    size="xs"
                    variant="ghost"
                    rightIcon={<ChevronDownIcon />}
                    fontSize="xs"
                  >
                    {sortOptions[sortBy]}
                  </MenuButton>
                  <MenuList
                    bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
                    borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
                    minW="150px"
                  >
                    {Object.entries(sortOptions).map(([key, label]) => (
                      <MenuItem
                        key={key}
                        onClick={() => setSortBy(key as SortOption)}
                        fontSize="sm"
                        bg={sortBy === key ? (colorMode === 'dark' ? 'dark.accent' : 'calm.accent') : 'transparent'}
                        color={sortBy === key ? 'white' : undefined}
                        _hover={{
                          bg: sortBy === key ? undefined : (colorMode === 'dark' ? 'dark.border' : 'calm.border'),
                        }}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </HStack>

              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="sm" />
                </Box>
              ) : sortedSongs.length === 0 ? (
                <Text fontSize="sm" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                  Select a {categoryLabelSingular} to view items
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {docSongs.length > 0 && (
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                        textTransform="uppercase"
                        letterSpacing="wide"
                        mb={2}
                      >
                        Docs ({docSongs.length})
                      </Text>
                      <SongList
                        songs={docSongs}
                        selectedSong={selectedSong}
                        onSongSelect={handleContentSelect}
                        onToggleFavorite={handleToggleFavorite}
                        language={language}
                        loading={loading}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        showContainer={false}
                        showHeader={false}
                        showSort={false}
                        showEmptyState={false}
                        categoryLabel={categoryLabel}
                        itemsLabel={itemsLabel}
                      />
                    </Box>
                  )}

                  {imageSongs.length > 0 && (
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                        textTransform="uppercase"
                        letterSpacing="wide"
                        mb={2}
                      >
                        Images ({imageSongs.length})
                      </Text>
                      <SongList
                        songs={imageSongs}
                        selectedSong={selectedSong}
                        onSongSelect={handleContentSelect}
                        onToggleFavorite={handleToggleFavorite}
                        language={language}
                        loading={loading}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        showContainer={false}
                        showHeader={false}
                        showSort={false}
                        showEmptyState={false}
                        categoryLabel={categoryLabel}
                        itemsLabel={itemsLabel}
                      />
                    </Box>
                  )}

                  {audioSongs.length > 0 && (
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                        textTransform="uppercase"
                        letterSpacing="wide"
                        mb={2}
                      >
                        Audio ({audioSongs.length})
                      </Text>
                      <SongList
                        songs={audioSongs}
                        selectedSong={nowPlayingSong}
                        onSongSelect={handleAudioSelect}
                        onToggleFavorite={handleToggleFavorite}
                        language={language}
                        loading={loading}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        showContainer={false}
                        showHeader={false}
                        showSort={false}
                        showEmptyState={false}
                        categoryLabel={categoryLabel}
                        itemsLabel={itemsLabel}
                      />
                    </Box>
                  )}

                  {/* Links Section - YouTube/Spotify links from selected document */}
                  {documentLinks.length > 0 && (
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                        textTransform="uppercase"
                        letterSpacing="wide"
                        mb={2}
                      >
                        Links ({documentLinks.length})
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {documentLinks.map((link, index) => (
                          <Box
                            key={`${link.url}-${index}`}
                            as="button"
                            onClick={() => {
                              // Clear local audio so external URL can load
                              setNowPlayingSong(null)
                              setAudioBlobUrl(null)
                              setDocExternalUrl(link.url)
                            }}
                            px={3}
                            py={2}
                            borderRadius="md"
                            textAlign="left"
                            bg="transparent"
                            _hover={{
                              bg: colorMode === 'dark' ? 'dark.border' : 'calm.border',
                            }}
                            transition="all 0.2s"
                          >
                            <HStack spacing={2}>
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color={link.type === 'youtube' ? '#FF0000' : link.type === 'spotify' ? '#1DB954' : '#718096'}
                                minW="20px"
                              >
                                {link.type === 'youtube' ? 'YT' : link.type === 'spotify' ? 'SP' : ''}
                              </Text>
                              <Text
                                fontSize="sm"
                                color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
                                noOfLines={1}
                                flex={1}
                              >
                                {link.text || `Link ${index + 1}`}
                              </Text>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              )}
            </Box>
          </Box>
        ) : null}

        {/* Toggle button for Column 2 - Desktop and Tablet */}
        {(isDesktop || isTablet) && (
          <IconButton
            aria-label={isColumn2Collapsed ? 'Expand song list' : 'Collapse song list'}
            icon={isColumn2Collapsed ? <ChevronRightIcon boxSize={5} /> : <ChevronLeftIcon boxSize={5} />}
            onClick={toggleColumn2}
            size="md"
            position="absolute"
            left={
              isTablet
                ? (isColumn2Collapsed ? (isPortrait ? '0px' : (isColumn1Collapsed ? '0px' : '200px')) : (isPortrait ? '240px' : (isColumn1Collapsed ? '240px' : '440px')))
                : isColumn1Collapsed
                  ? (isColumn2Collapsed ? '0px' : '280px')
                  : (isColumn2Collapsed ? '200px' : '480px')
            }
            top="50%"
            transform="translateY(-50%)"
            zIndex={10}
            bg={colorMode === 'dark' ? 'orange.500' : 'orange.400'}
            color="white"
            _hover={{ bg: colorMode === 'dark' ? 'orange.400' : 'orange.500' }}
            borderRadius="full"
            boxShadow="md"
            transition="all 0.3s"
          />
        )}

        {/* Column 3: Doc + Audio Viewer */}
        {/* Desktop/Tablet: Always show; Mobile: Show based on activeMobilePanel */}
        {(!isMobile || activeMobilePanel === 'viewer') && (
          <Box flex="1" display="flex" flexDirection="column" minW="0">
            <Box flex="1" minH="0" display="flex">
              <SongViewer
                song={selectedSong}
                loading={viewerLoading}
                externalUrl={externalUrl}
                externalTitle={externalUrlTitle}
                onDetectedExternalUrl={setDocExternalUrl}
                onExternalUrlSelect={(url) => {
                  setDocExternalUrl(url)
                }}
                onClearExternal={() => {
                  setExternalUrl(null)
                  setExternalUrlTitle(null)
                }}
                onPrev={selectedSong ? () => handleAdjacentSelect('prev') : undefined}
                onNext={selectedSong ? () => handleAdjacentSelect('next') : undefined}
                hasPrev={selectedSong ? viewableSongs.findIndex(song => song.id === selectedSong.id) > 0 : false}
                hasNext={selectedSong ? viewableSongs.findIndex(song => song.id === selectedSong.id) < viewableSongs.length - 1 : false}
                fontSize={fontSize}
              />
            </Box>
            {/* Audio panel - hide on mobile (shown separately) */}
            {!isMobile && (
              <Box
                position="relative"
                borderTop="1px"
                borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
                flexShrink={0}
              >
                {/* Audio panel collapse toggle */}
                <IconButton
                  aria-label={isAudioPanelCollapsed ? 'Expand audio panel' : 'Collapse audio panel'}
                  icon={isAudioPanelCollapsed ? <ChevronUpIcon boxSize={5} /> : <ChevronDownIcon boxSize={5} />}
                  onClick={toggleAudioPanel}
                  size="md"
                  position="absolute"
                  left="50%"
                  top="-18px"
                  transform="translateX(-50%)"
                  zIndex={10}
                  bg={colorMode === 'dark' ? 'orange.500' : 'orange.400'}
                  color="white"
                  _hover={{ bg: colorMode === 'dark' ? 'orange.400' : 'orange.500' }}
                  borderRadius="full"
                  boxShadow="md"
                  transition="all 0.3s"
                />
                {isAudioPanelCollapsed ? (
                  <Box
                    h="36px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
                    px={4}
                  >
                    <Text
                      fontSize="sm"
                      color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                      noOfLines={1}
                    >
                      {nowPlayingSong ? `🎵 ${nowPlayingSong.name}` : 'Audio Panel'}
                    </Text>
                  </Box>
                ) : (
                  <Box h={`${audioPanelHeight}px`}>
                    <AudioPanel
                      nowPlayingSong={nowPlayingSong}
                      loading={audioLoading}
                      panelHeight={audioPanelHeight}
                      onHeightChange={setAudioPanelHeight}
                      onPrev={nowPlayingSong ? () => handleAudioAdjacentSelect('prev') : undefined}
                      onNext={nowPlayingSong ? () => handleAudioAdjacentSelect('next') : undefined}
                      hasPrev={nowPlayingSong ? audioQueue.findIndex(song => song.id === nowPlayingSong.id) > 0 : false}
                      hasNext={nowPlayingSong ? audioQueue.findIndex(song => song.id === nowPlayingSong.id) < audioQueue.length - 1 : false}
                      autoExternalUrl={autoExternalUrl}
                      isDesktopOverride={isDesktop}
                      resetKey={`${selectedDeity?.id}-${selectedSong?.id}`}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Mobile Audio Panel - shown when audio tab is active */}
        {isMobile && activeMobilePanel === 'audio' && (
          <Box flex="1" display="flex" flexDirection="column" minW="0">
            <AudioPanel
              nowPlayingSong={nowPlayingSong}
              loading={audioLoading}
              panelHeight={400}
              onHeightChange={() => {}}
              onPrev={nowPlayingSong ? () => handleAudioAdjacentSelect('prev') : undefined}
              onNext={nowPlayingSong ? () => handleAudioAdjacentSelect('next') : undefined}
              hasPrev={nowPlayingSong ? audioQueue.findIndex(song => song.id === nowPlayingSong.id) > 0 : false}
              hasNext={nowPlayingSong ? audioQueue.findIndex(song => song.id === nowPlayingSong.id) < audioQueue.length - 1 : false}
              autoExternalUrl={autoExternalUrl}
              isDesktopOverride={false}
              resetKey={`${selectedDeity?.id}-${selectedSong?.id}`}
            />
          </Box>
        )}
      </Box>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <HStack
          bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
          borderTop="1px"
          borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
          px={2}
          py={2}
          justify="space-around"
          position="sticky"
          bottom={0}
          zIndex={10}
        >
          <Button
            variant={activeMobilePanel === 'songs' ? 'solid' : 'ghost'}
            colorScheme={activeMobilePanel === 'songs' ? 'orange' : undefined}
            size="sm"
            flexDir="column"
            h="auto"
            py={2}
            onClick={() => setActiveMobilePanel('songs')}
          >
            <Text fontSize="lg">📄</Text>
            <Text fontSize="xs">{itemsLabel}</Text>
          </Button>
          <Button
            variant={activeMobilePanel === 'viewer' ? 'solid' : 'ghost'}
            colorScheme={activeMobilePanel === 'viewer' ? 'orange' : undefined}
            size="sm"
            flexDir="column"
            h="auto"
            py={2}
            onClick={() => setActiveMobilePanel('viewer')}
          >
            <Text fontSize="lg">👁</Text>
            <Text fontSize="xs">Viewer</Text>
          </Button>
          <Button
            variant={activeMobilePanel === 'audio' ? 'solid' : 'ghost'}
            colorScheme={activeMobilePanel === 'audio' ? 'orange' : undefined}
            size="sm"
            flexDir="column"
            h="auto"
            py={2}
            onClick={() => setActiveMobilePanel('audio')}
          >
            <Text fontSize="lg">🎵</Text>
            <Text fontSize="xs">Audio</Text>
          </Button>
        </HStack>
      )}
      
      <Search
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        songs={allSongs}
        onSongSelect={handleSearchSongSelect}
      />
    </Box>
  )
}
