import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  VStack,
  Box,
  Text,
  HStack,
  Badge,
  useColorMode,
  Kbd,
} from '@chakra-ui/react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Song, SearchHistory } from '../types'
import { db } from '../db/database'

interface SearchProps {
  isOpen: boolean
  onClose: () => void
  songs: Song[]
  onSongSelect: (song: Song) => void
}

export default function Search({ isOpen, onClose, songs, onSongSelect }: SearchProps) {
  const { colorMode } = useColorMode()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([])

  // Configure Fuse.js for fuzzy search - memoize to prevent recreation on every render
  const fuse = useMemo(() => new Fuse(songs, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'metadata.title', weight: 2 },
      { name: 'metadata.title-tamil', weight: 2 },
      { name: 'metadata.title-sanskrit', weight: 2 },
      { name: 'metadata.title-malayalam', weight: 1.5 },
      { name: 'metadata.title-telugu', weight: 1.5 },
      { name: 'metadata.ragam', weight: 1.5 },
      { name: 'metadata.talam', weight: 1.5 },
      { name: 'metadata.tags', weight: 1.2 },
      { name: 'deity', weight: 1 },
      { name: 'content', weight: 0.5 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  }), [songs])

  // Load recent searches
  useEffect(() => {
    const loadRecentSearches = async () => {
      const searches = await db.searchHistory
        .orderBy('timestamp')
        .reverse()
        .limit(5)
        .toArray()
      setRecentSearches(searches)
    }
    if (isOpen) {
      loadRecentSearches()
    }
  }, [isOpen])

  // Perform search
  useEffect(() => {
    if (query.trim().length >= 2) {
      const searchResults = fuse.search(query)
      setResults(searchResults.map(result => result.item))
      setSelectedIndex(0)
    } else {
      setResults([])
      setSelectedIndex(0)
    }
  }, [query, fuse])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectSong(results[selectedIndex])
          }
          break
        case 'Escape':
          onClose()
          break
      }
    },
    [results, selectedIndex, onClose]
  )

  const handleSelectSong = async (song: Song) => {
    // Save to search history
    await db.searchHistory.add({
      query: query.trim(),
      timestamp: new Date().toISOString(),
    })
    
    onSongSelect(song)
    onClose()
    setQuery('')
  }

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const handleClose = () => {
    setQuery('')
    setResults([])
    setSelectedIndex(0)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
        maxH="80vh"
      >
        <ModalHeader
          borderBottom="1px"
          borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
          pb={3}
        >
          <HStack spacing={2}>
            <Text>Search Songs</Text>
            <HStack spacing={1} ml="auto">
              <Kbd fontSize="xs">↑</Kbd>
              <Kbd fontSize="xs">↓</Kbd>
              <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                to navigate
              </Text>
              <Kbd fontSize="xs">↵</Kbd>
              <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                to select
              </Text>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          <Box p={4} borderBottom="1px" borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}>
            <Input
              placeholder="Search by title, ragam, talam, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              size="lg"
              variant="filled"
              bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
            />
          </Box>

          {/* Recent searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <Box p={4}>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
                mb={2}
                textTransform="uppercase"
              >
                Recent Searches
              </Text>
              <VStack spacing={1} align="stretch">
                {recentSearches.map((search) => (
                  <Box
                    key={search.id}
                    as="button"
                    onClick={() => handleRecentSearchClick(search.query)}
                    px={3}
                    py={2}
                    borderRadius="md"
                    textAlign="left"
                    _hover={{
                      bg: colorMode === 'dark' ? 'dark.border' : 'calm.border',
                    }}
                    transition="all 0.2s"
                  >
                    <Text fontSize="sm">{search.query}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <VStack spacing={0} align="stretch" maxH="50vh" overflowY="auto">
              {results.map((song, index) => (
                <Box
                  key={song.id}
                  as="button"
                  onClick={() => handleSelectSong(song)}
                  px={4}
                  py={3}
                  textAlign="left"
                  bg={
                    index === selectedIndex
                      ? colorMode === 'dark'
                        ? 'dark.accent'
                        : 'calm.accent'
                      : 'transparent'
                  }
                  color={
                    index === selectedIndex
                      ? 'white'
                      : colorMode === 'dark'
                      ? 'dark.textPrimary'
                      : 'calm.textPrimary'
                  }
                  _hover={{
                    bg:
                      index === selectedIndex
                        ? undefined
                        : colorMode === 'dark'
                        ? 'dark.border'
                        : 'calm.border',
                  }}
                  transition="all 0.2s"
                  borderBottom="1px"
                  borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                      {song.metadata?.title || song.name}
                    </Text>
                    <Badge
                      colorScheme={index === selectedIndex ? 'whiteAlpha' : 'gray'}
                      fontSize="xs"
                    >
                      {song.deity}
                    </Badge>
                  </HStack>
                  {(song.metadata?.ragam || song.metadata?.talam) && (
                    <Text fontSize="xs" opacity={0.8} noOfLines={1}>
                      {song.metadata.ragam && `Ragam: ${song.metadata.ragam}`}
                      {song.metadata.ragam && song.metadata.talam && ' • '}
                      {song.metadata.talam && `Talam: ${song.metadata.talam}`}
                    </Text>
                  )}
                  {song.metadata?.tags && song.metadata.tags.length > 0 && (
                    <HStack spacing={1} mt={1}>
                      {song.metadata.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          size="xs"
                          variant="subtle"
                          colorScheme={index === selectedIndex ? 'whiteAlpha' : 'gray'}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </Box>
              ))}
            </VStack>
          )}

          {/* No results */}
          {query.length >= 2 && results.length === 0 && (
            <Box p={8} textAlign="center">
              <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                No songs found for "{query}"
              </Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
