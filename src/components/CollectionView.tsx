import { Box, IconButton, useToast, HStack, Text, Spinner, VStack, Menu, MenuButton, MenuList, MenuItem, Button, useColorMode, Input, Select } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ExternalLinkIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { driveService } from '../services/driveService'
import { db } from '../db/database'
import Header from './layout/Header'
import Navigation from './layout/Navigation'
import SongList from './layout/SongList'
import SongViewer from './layout/SongViewer'
import AudioPanel from './layout/AudioPanel'
import Search from './Search'
import { Deity, Song, TitleLanguage, Document, SortOption } from '../types'
import { useCollectionStore } from '../stores/collectionStore'
import { getCollectionConfig } from '../config/collections'
import { parseMultiLanguageContent } from '../services/metadataParser'
import { extractSongId } from '../utils/songId'
import { getSongTitle } from '../utils/songTitle'
import { extractFirstYouTubeUrl } from '../utils/extractYouTubeUrl'

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
  const [showEmptyCategories, setShowEmptyCategories] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical')
  const [externalUrl, setExternalUrl] = useState<string | null>(null)
  const [externalUrlTitle, setExternalUrlTitle] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [recentUrls, setRecentUrls] = useState<Array<{ title: string; url: string; lastUsed: string }>>([])
  const [docExternalUrl, setDocExternalUrl] = useState<string | null>(null)

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
    const emptyCategories = localStorage.getItem('showEmptyCategories') === 'true'
    setIsColumn1Collapsed(col1Collapsed)
    setIsColumn2Collapsed(col2Collapsed)
    setShowEmptyCategories(emptyCategories)
  }, [])

  useEffect(() => {
    if (!collectionId) return
    const stored = localStorage.getItem(`recentUrls:${collectionId}`)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as Array<{ title: string; url: string; lastUsed: string }>
      if (Array.isArray(parsed)) {
        setRecentUrls(parsed)
      }
    } catch {
      // Ignore malformed storage
    }
  }, [collectionId])

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
  }

  const toggleColumn2 = () => {
    const newState = !isColumn2Collapsed
    setIsColumn2Collapsed(newState)
    localStorage.setItem('column2Collapsed', String(newState))
  }

  const toggleEmptyCategories = () => {
    const newState = !showEmptyCategories
    setShowEmptyCategories(newState)
    localStorage.setItem('showEmptyCategories', String(newState))
  }

  const normalizeUrlInput = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      return new URL(trimmed).toString()
    } catch {
      try {
        return new URL(`https://${trimmed}`).toString()
      } catch {
        return null
      }
    }
  }

  const openExternalUrl = (value: string) => {
    if (!collectionId) return
    const normalized = normalizeUrlInput(value)
    if (!normalized) {
      toast({
        title: 'Invalid URL',
        description: 'Enter a valid URL to open in the viewer.',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    const derivedTitle = (() => {
      try {
        return new URL(normalized).hostname
      } catch {
        return normalized
      }
    })()

    const updated = [
      { title: derivedTitle, url: normalized, lastUsed: new Date().toISOString() },
      ...recentUrls.filter(entry => entry.url !== normalized),
    ].slice(0, 10)

    setRecentUrls(updated)
    localStorage.setItem(`recentUrls:${collectionId}`, JSON.stringify(updated))
    setExternalUrl(normalized)
    setExternalUrlTitle(derivedTitle)
    setSelectedSong(null)
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
        showCategories={!isColumn1Collapsed}
        showItems={!isColumn2Collapsed}
        showEmptyCategories={showEmptyCategories}
        onToggleCategories={toggleColumn1}
        onToggleItems={toggleColumn2}
        onToggleEmptyCategories={toggleEmptyCategories}
      />
      <Box flex="1" display="flex" overflow="hidden" position="relative">
        {/* Column 1: Navigation */}
        {!isColumn1Collapsed && (
          <Navigation
            deities={showEmptyCategories ? deities : deities.filter(d => d.songCount > 0)}
            selectedDeity={selectedDeity}
            onDeitySelect={handleDeitySelect}
            onFavoritesSelect={handleFavoritesSelect}
            showingFavorites={showingFavorites}
            loading={loading}
            categoryLabel={categoryLabel}
            itemLabel={itemLabel}
          />
        )}
        
        {/* Toggle button for Column 1 */}
        <IconButton
          aria-label={isColumn1Collapsed ? 'Expand navigation' : 'Collapse navigation'}
          icon={isColumn1Collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={toggleColumn1}
          size="sm"
          position="absolute"
          left={isColumn1Collapsed ? 0 : '200px'}
          top="50%"
          transform="translateY(-50%)"
          zIndex={10}
          variant="solid"
          opacity={0.7}
          _hover={{ opacity: 1 }}
          transition="all 0.3s"
        />

        {/* Column 2: Song List */}
        {!isColumn2Collapsed && (
          <Box
            w="280px"
            h="100%"
            bg={colorMode === 'dark' ? 'dark.panelSecondary' : 'calm.panelSecondary'}
            borderRight="1px"
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

              <Box
                mb={4}
                p={3}
                borderRadius="md"
                bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
              >
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={2}
                >
                  URL
                </Text>
                <HStack spacing={2}>
                  <Input
                    size="sm"
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        openExternalUrl(urlInput)
                      }
                    }}
                  />
                  <IconButton
                    aria-label="Open URL"
                    size="sm"
                    icon={<ExternalLinkIcon />}
                    onClick={() => openExternalUrl(urlInput)}
                  />
                  <IconButton
                    aria-label="Clear URL"
                    size="sm"
                    variant="ghost"
                    icon={<CloseIcon />}
                    isDisabled={!externalUrl}
                    onClick={() => {
                      setExternalUrl(null)
                      setExternalUrlTitle(null)
                    }}
                  />
                </HStack>
                {recentUrls.length > 0 && (
                  <HStack spacing={2} mt={2} align="center">
                    <Select
                      size="sm"
                      placeholder="Recent URLs"
                      value=""
                      onChange={e => {
                        if (e.target.value) {
                          setUrlInput(e.target.value)
                          openExternalUrl(e.target.value)
                        }
                      }}
                    >
                      {recentUrls.map(entry => (
                        <option key={entry.url} value={entry.url}>
                          {entry.title} — {entry.url}
                        </option>
                      ))}
                    </Select>
                    <IconButton
                      aria-label="Clear recent URLs"
                      size="sm"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => {
                        if (!collectionId) return
                        localStorage.removeItem(`recentUrls:${collectionId}`)
                        setRecentUrls([])
                      }}
                    />
                  </HStack>
                )}
              </Box>

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
                </VStack>
              )}
            </Box>
          </Box>
        )}
        
        {/* Toggle button for Column 2 */}
        <IconButton
          aria-label={isColumn2Collapsed ? 'Expand song list' : 'Collapse song list'}
          icon={isColumn2Collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={toggleColumn2}
          size="sm"
          position="absolute"
          left={
            isColumn1Collapsed 
              ? (isColumn2Collapsed ? '0px' : '280px')
              : (isColumn2Collapsed ? '200px' : '480px')
          }
          top="50%"
          transform="translateY(-50%)"
          zIndex={10}
          variant="solid"
          opacity={0.7}
          _hover={{ opacity: 1 }}
          transition="all 0.3s"
        />

        {/* Column 3: Doc + Audio Viewer */}
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
            />
          </Box>
          <Box
            h={`${audioPanelHeight}px`}
            borderTop="1px"
            borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
            flexShrink={0}
          >
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
            />
          </Box>
        </Box>
      </Box>
      
      <Search
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        songs={allSongs}
        onSongSelect={handleSearchSongSelect}
      />
    </Box>
  )
}
