import { Box, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { useGoogleLogin } from '@react-oauth/google'
import { useState, useEffect } from 'react'
import { driveService } from './services/driveService'
import { db } from './db/database'
import Header from './components/layout/Header'
import Navigation from './components/layout/Navigation'
import SongList from './components/layout/SongList'
import SongViewer from './components/layout/SongViewer'
import Search from './components/Search'
import { Deity, Song, TitleLanguage } from './types'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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

  // Check for stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('google_access_token')
    if (token) {
      driveService.setAccessToken(token)
      setIsAuthenticated(true)
      loadDeities()
    }
  }, [])

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

  // Load all songs from DB for search
  useEffect(() => {
    const loadAllSongs = async () => {
      const allSongsFromDB = await db.songs.toArray()
      setAllSongs(allSongsFromDB)
    }
    if (isAuthenticated) {
      loadAllSongs()
    }
  }, [isAuthenticated, deities])

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
      // Search: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      // Toggle Column 1: Alt+1
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        setIsColumn1Collapsed(prev => {
          const newState = !prev
          localStorage.setItem('column1Collapsed', String(newState))
          return newState
        })
      }
      // Toggle Column 2: Alt+2
      if (e.altKey && e.key === '2') {
        e.preventDefault()
        setIsColumn2Collapsed(prev => {
          const newState = !prev
          localStorage.setItem('column2Collapsed', String(newState))
          return newState
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token
      localStorage.setItem('google_access_token', accessToken)
      driveService.setAccessToken(accessToken)
      setIsAuthenticated(true)
      await loadDeities()
    },
    onError: () => {
      console.error('Login failed')
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly',
  })

  const loadDeities = async () => {
    try {
      setLoading(true)
      const deityList = await driveService.getDeityFolders()
      setDeities(deityList)
      
      // Load deity order from settings
      const settings = await db.settings.get('app')
      if (settings && settings.deityOrder.length > 0) {
        // Reorder based on settings
        const ordered = settings.deityOrder
          .map(id => deityList.find(d => d.id === id))
          .filter(Boolean) as Deity[]
        const remaining = deityList.filter(d => !settings.deityOrder.includes(d.id))
        setDeities([...ordered, ...remaining])
      }
    } catch (error) {
      console.error('Failed to load deities:', error)
      
      // If authentication failed, clear token and force re-login
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        handleLogout()
        alert('Your session has expired. Please sign in again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeitySelect = async (deity: Deity) => {
    setSelectedDeity(deity)
    setSelectedSong(null)
    setShowingFavorites(false)
    
    try {
      setLoading(true)
      // Try to load from cache first
      const cachedSongs = await db.songs.where('deity').equals(deity.name).toArray()
      
      if (cachedSongs.length > 0) {
        setSongs(cachedSongs)
      } else {
        // Load from Drive
        const files = await driveService.listFiles(deity.driveFolderId)
        const textFiles = files.filter(f => 
          f.mimeType === 'application/vnd.google-apps.document'
        )
        
        const songList: Song[] = textFiles.map(file => ({
          id: file.id,
          driveFileId: file.id,
          name: file.name,
          deity: deity.name,
          contentType: 'text',
          modifiedTime: file.modifiedTime,
          cachedAt: new Date().toISOString(),
          size: parseInt(file.size || '0', 10),
          isFavorite: false,
          viewCount: 0,
          lastViewed: null,
        }))
        
        setSongs(songList)
        // Cache metadata
        await db.songs.bulkPut(songList)
      }
    } catch (error) {
      console.error('Failed to load songs:', error)
      
      // If authentication failed, clear token and force re-login
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        handleLogout()
        alert('Your session has expired. Please sign in again.')
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
      const favoriteSongs = await db.songs.where('isFavorite').equals(1).toArray()
      setSongs(favoriteSongs)
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (song: Song) => {
    const updatedSong = {
      ...song,
      isFavorite: !song.isFavorite,
    }
    
    await db.songs.update(song.id, { isFavorite: updatedSong.isFavorite })
    
    // Update the local state
    setSongs(prevSongs => 
      prevSongs.map(s => s.id === song.id ? updatedSong : s)
    )
    
    // Update allSongs for search
    setAllSongs(prevAllSongs =>
      prevAllSongs.map(s => s.id === song.id ? updatedSong : s)
    )
    
    // If showing favorites and unfavoriting, remove from list
    if (showingFavorites && !updatedSong.isFavorite) {
      setSongs(prevSongs => prevSongs.filter(s => s.id !== song.id))
    }
  }

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song)
    
    // Update view count and last viewed
    const updatedViewData = {
      ...song,
      viewCount: (song.viewCount || 0) + 1,
      lastViewed: new Date().toISOString(),
    }
    await db.songs.update(song.id, {
      viewCount: updatedViewData.viewCount,
      lastViewed: updatedViewData.lastViewed,
    })
    
    // If content is not cached, fetch it
    if (!song.content) {
      try {
        setLoading(true)
        const html = await driveService.exportAsHtml(song.driveFileId)
        
        // Update song with content
        const updatedSong = {
          ...updatedViewData,
          content: html,
          cachedAt: new Date().toISOString(),
        }
        
        setSelectedSong(updatedSong)
        await db.songs.put(updatedSong)
      } catch (error) {
        console.error('Failed to load song content:', error)
        
        // If authentication failed, clear token and force re-login
        if (error instanceof Error && error.message.includes('Authentication failed')) {
          handleLogout()
          alert('Your session has expired. Please sign in again.')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSearchSongSelect = async (song: Song) => {
    // Find and select the deity
    const deity = deities.find(d => d.name === song.deity)
    if (deity) {
      setSelectedDeity(deity)
      // Load songs for that deity
      const deitySongs = await db.songs.where('deity').equals(deity.name).toArray()
      setSongs(deitySongs)
    }
    // Select the song
    await handleSongSelect(song)
  }

  const handleLanguageChange = async (newLanguage: TitleLanguage) => {
    setLanguage(newLanguage)
    
    // Save to settings
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

  const handleLogout = () => {
    localStorage.removeItem('google_access_token')
    driveService.clearAccessToken()
    setIsAuthenticated(false)
    setDeities([])
    setSongs([])
    setSelectedDeity(null)
    setSelectedSong(null)
  }

  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="calm.background"
      >
        <Box textAlign="center" p={8}>
          <Box fontSize="4xl" mb={4}>🕉️</Box>
          <Box fontSize="2xl" fontWeight="bold" mb={2} className="tamil-text">
            GAnAmruta Thuli
          </Box>
          <Box fontSize="sm" color="calm.textSecondary" mb={6}>
            గానామృత துளி
          </Box>
          <Box
            as="button"
            onClick={() => login()}
            bg="calm.accent"
            color="white"
            px={6}
            py={3}
            borderRadius="md"
            fontWeight="semibold"
            _hover={{ bg: 'calm.accent', opacity: 0.9 }}
          >
            Sign in with Google
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box h="100vh" display="flex" flexDirection="column" bg="calm.background">
      <Header 
        onLogout={handleLogout} 
        onSearchOpen={() => setIsSearchOpen(true)}
        language={language}
        onLanguageChange={handleLanguageChange}
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

export default App
