import { Box, IconButton, useToast } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { driveService } from '../services/driveService'
import { db } from '../db/database'
import Header from './layout/Header'
import Navigation from './layout/Navigation'
import SongList from './layout/SongList'
import SongViewer from './layout/SongViewer'
import Search from './Search'
import { Deity, Song, TitleLanguage, Document, Category } from '../types'
import { useCollectionStore } from '../stores/collectionStore'
import { getCollectionConfig } from '../config/collections'

interface CollectionViewProps {
  onLogout: () => void
}

export const CollectionView = ({ onLogout }: CollectionViewProps) => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { collections } = useCollectionStore()
  
  const [deities, setDeities] = useState<Deity[]>([])
  const [selectedDeity, setSelectedDeity] = useState<Deity | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [showingFavorites, setShowingFavorites] = useState(false)
  const [language, setLanguage] = useState<TitleLanguage>('english')
  const [isColumn1Collapsed, setIsColumn1Collapsed] = useState(false)
  const [isColumn2Collapsed, setIsColumn2Collapsed] = useState(false)

  // Get collection config
  const collection = collections.find(c => c.id === collectionId)
  const collectionConfig = collection ? getCollectionConfig(collection.id) : null

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
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [collectionId])

  // Load column collapse state from localStorage
  useEffect(() => {
    const col1Collapsed = localStorage.getItem('column1Collapsed') === 'true'
    const col2Collapsed = localStorage.getItem('column2Collapsed') === 'true'
    setIsColumn1Collapsed(col1Collapsed)
    setIsColumn2Collapsed(col2Collapsed)
  }, [])

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
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDeitySelect = async (deity: Deity) => {
    setSelectedDeity(deity)
    setSelectedSong(null)
    setShowingFavorites(false)
    
    try {
      setLoading(true)
      // Load documents from this category
      const cachedDocs = await db.documents
        .where('collectionId')
        .equals(collectionId!)
        .and(doc => doc.category === deity.name)
        .toArray()
      
      if (cachedDocs.length > 0) {
        setSongs(cachedDocs)
      } else {
        // Load from Drive if not cached
        const files = await driveService.listFiles(deity.driveFolderId)
        
        const supportedFiles = files.filter(f => 
          f.mimeType === 'application/vnd.google-apps.document' ||
          driveService.isImageFile(f.mimeType) ||
          driveService.isPdfFile(f.mimeType)
        )
        
        const docList: Document[] = supportedFiles.map(file => {
          const isImage = driveService.isImageFile(file.mimeType)
          const isPdf = driveService.isPdfFile(file.mimeType)
          
          let contentType: 'text' | 'image' | 'pdf' | 'audio' = 'text'
          if (isImage) contentType = 'image'
          else if (isPdf) contentType = 'pdf'
          
          return {
            id: file.id,
            collectionId: collectionId!,
            collectionType: collection!.type,
            driveFileId: file.id,
            name: file.name,
            category: deity.name,
            contentType,
            imageUrl: isImage ? driveService.getImageUrl(file.id) : isPdf ? driveService.getPdfUrl(file.id) : undefined,
            modifiedTime: file.modifiedTime,
            cachedAt: new Date().toISOString(),
            size: parseInt(file.size || '0', 10),
            isFavorite: false,
            viewCount: 0,
            lastViewed: null,
          }
        })
        
        setSongs(docList)
        await db.documents.bulkPut(docList)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
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

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song)
    
    const updatedViewData = {
      ...song,
      viewCount: (song.viewCount || 0) + 1,
      lastViewed: new Date().toISOString(),
    }
    await db.documents.update(song.id, {
      viewCount: updatedViewData.viewCount,
      lastViewed: updatedViewData.lastViewed,
    })
    
    if (!song.content && song.contentType === 'text') {
      try {
        setLoading(true)
        const html = await driveService.exportAsHtml(song.driveFileId)
        
        const updatedSong = {
          ...updatedViewData,
          content: html,
          cachedAt: new Date().toISOString(),
        }
        
        setSelectedSong(updatedSong)
        await db.documents.put(updatedSong)
      } catch (error) {
        console.error('Failed to load document content:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSearchSongSelect = async (song: Song) => {
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
    await handleSongSelect(song)
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
      />
      <Box flex="1" display="flex" overflow="hidden" position="relative">
        {/* Column 1: Navigation */}
        {!isColumn1Collapsed && (
          <Navigation
            deities={deities}
            selectedDeity={selectedDeity}
            onDeitySelect={handleDeitySelect}
            onFavoritesSelect={handleFavoritesSelect}
            showingFavorites={showingFavorites}
            loading={loading}
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
          <SongList
            songs={songs}
            selectedSong={selectedSong}
            onSongSelect={handleSongSelect}
            onToggleFavorite={handleToggleFavorite}
            language={language}
            loading={loading}
          />
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

        {/* Column 3: Song Viewer */}
        <SongViewer
          song={selectedSong}
          loading={loading}
        />
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
