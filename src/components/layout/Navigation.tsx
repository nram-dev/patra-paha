import { Box, VStack, Text, Spinner, Divider } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import { Deity } from '../../types'

interface NavigationProps {
  deities: Deity[]
  selectedDeity: Deity | null
  onDeitySelect: (deity: Deity | null) => void
  onFavoritesSelect: () => void
  showingFavorites: boolean
  loading: boolean
  categoryLabel?: string  // e.g., "Deities" or "Categories"
  itemLabel?: string      // e.g., "song" or "item"
}

export default function Navigation({
  deities,
  selectedDeity,
  onDeitySelect,
  onFavoritesSelect,
  showingFavorites,
  loading,
  categoryLabel = 'Deities',
  itemLabel = 'song',
}: NavigationProps) {
  const { colorMode } = useColorMode()

  return (
    <Box
      w="200px"
      h="100%"
      bg={colorMode === 'dark' ? 'dark.panelPrimary' : 'calm.panelPrimary'}
      borderRight="1px"
      borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
      overflowY="auto"
    >
      <Box p={4}>
        {/* Favorites Section */}
        <VStack spacing={1} align="stretch" mb={4}>
          <Box
            as="button"
            onClick={onFavoritesSelect}
            px={3}
            py={2}
            borderRadius="md"
            textAlign="left"
            bg={
              showingFavorites
                ? colorMode === 'dark'
                  ? 'dark.accent'
                  : 'calm.accent'
                : 'transparent'
            }
            color={
              showingFavorites
                ? 'white'
                : colorMode === 'dark'
                ? 'dark.textPrimary'
                : 'calm.textPrimary'
            }
            _hover={{
              bg:
                showingFavorites
                  ? undefined
                  : colorMode === 'dark'
                  ? 'dark.border'
                  : 'calm.border',
            }}
            transition="all 0.2s"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <StarIcon boxSize={3} />
              <Text fontSize="sm" fontWeight={showingFavorites ? 'semibold' : 'normal'}>
                Favorites
              </Text>
            </Box>
          </Box>
        </VStack>

        <Divider mb={4} borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'} />

        {/* Categories Section */}
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
          mb={3}
          textTransform="uppercase"
          letterSpacing="wide"
        >
          {categoryLabel}
        </Text>
        
        {loading && deities.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Spinner size="sm" />
          </Box>
        ) : (
          <VStack spacing={1} align="stretch">
            {deities.map((deity) => (
              <Box
                key={deity.id}
                as="button"
                onClick={() => onDeitySelect(deity)}
                px={3}
                py={2}
                borderRadius="md"
                textAlign="left"
                bg={
                  selectedDeity?.id === deity.id && !showingFavorites
                    ? colorMode === 'dark'
                      ? 'dark.accent'
                      : 'calm.accent'
                    : 'transparent'
                }
                color={
                  selectedDeity?.id === deity.id && !showingFavorites
                    ? 'white'
                    : colorMode === 'dark'
                    ? 'dark.textPrimary'
                    : 'calm.textPrimary'
                }
                _hover={{
                  bg:
                    selectedDeity?.id === deity.id && !showingFavorites
                      ? undefined
                      : colorMode === 'dark'
                      ? 'dark.border'
                      : 'calm.border',
                }}
                transition="all 0.2s"
              >
                <Text fontSize="sm" fontWeight={selectedDeity?.id === deity.id && !showingFavorites ? 'semibold' : 'normal'}>
                  {deity.name}
                </Text>
                <Text fontSize="xs" opacity={0.7}>
                  {deity.songCount} {deity.songCount === 1 ? itemLabel : `${itemLabel}s`}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  )
}
