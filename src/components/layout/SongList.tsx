import { Box, VStack, Text, Spinner, HStack, IconButton, Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { StarIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Song, TitleLanguage, SortOption } from '../../types'
import { getSongTitle } from '../../utils/songTitle'
import { useState, useMemo } from 'react'

interface SongListProps {
  songs: Song[]
  selectedSong: Song | null
  onSongSelect: (song: Song) => void
  onToggleFavorite: (song: Song) => void
  language: TitleLanguage
  loading: boolean
}

export default function SongList({
  songs,
  selectedSong,
  onSongSelect,
  onToggleFavorite,
  language,
  loading,
}: SongListProps) {
  const { colorMode } = useColorMode()
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical')

  const sortOptions: Record<SortOption, string> = {
    alphabetical: 'Alphabetical',
    recent: 'Recently Viewed',
    mostViewed: 'Most Viewed',
    recentlyModified: 'Recently Modified',
  }

  // Sort songs based on selected option
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

  if (!songs.length && !loading) {
    return (
      <Box
        w="280px"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
        borderRight="1px"
        borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
        p={4}
      >
        <Text
          fontSize="sm"
          color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
        >
          Select a deity to view songs
        </Text>
      </Box>
    )
  }

  return (
    <Box
      w="280px"
      h="100%"
      bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
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
            Songs ({songs.length})
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
        ) : (
          <VStack spacing={1} align="stretch">
            {sortedSongs.map((song) => (
              <HStack
                key={song.id}
                spacing={0}
                align="stretch"
                borderRadius="md"
                bg={
                  selectedSong?.id === song.id
                    ? colorMode === 'dark'
                      ? 'dark.accent'
                      : 'calm.accent'
                    : 'transparent'
                }
                _hover={{
                  bg:
                    selectedSong?.id === song.id
                      ? undefined
                      : colorMode === 'dark'
                      ? 'dark.border'
                      : 'calm.border',
                }}
                transition="all 0.2s"
              >
                <Box
                  as="button"
                  onClick={() => onSongSelect(song)}
                  flex="1"
                  px={3}
                  py={2}
                  textAlign="left"
                  color={
                    selectedSong?.id === song.id
                      ? 'white'
                      : colorMode === 'dark'
                      ? 'dark.textPrimary'
                      : 'calm.textPrimary'
                  }
                >
                  <Text
                    fontSize="sm"
                    fontWeight={selectedSong?.id === song.id ? 'semibold' : 'normal'}
                    noOfLines={2}
                    className={language !== 'english' ? 'tamil-text' : undefined}
                  >
                    {getSongTitle(song, language)}
                  </Text>
                  {song.metadata?.ragam && (
                    <Text fontSize="xs" opacity={0.7} mt={1}>
                      {song.metadata.ragam}
                    </Text>
                  )}
                </Box>
                <IconButton
                  aria-label="Toggle favorite"
                  icon={<StarIcon />}
                  size="xs"
                  variant="ghost"
                  color={
                    song.isFavorite
                      ? 'yellow.400'
                      : selectedSong?.id === song.id
                      ? 'whiteAlpha.600'
                      : colorMode === 'dark'
                      ? 'dark.textSecondary'
                      : 'calm.textSecondary'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(song)
                  }}
                  _hover={{
                    color: 'yellow.400',
                  }}
                  mr={1}
                />
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  )
}
