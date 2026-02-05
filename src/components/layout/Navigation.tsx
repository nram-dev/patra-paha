import { Box, VStack, Text, Spinner } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { Deity } from '../../types'

interface NavigationProps {
  deities: Deity[]
  selectedDeity: Deity | null
  onDeitySelect: (deity: Deity | null) => void
  showingFavorites: boolean
  loading: boolean
  categoryLabel?: string  // e.g., "Deities" or "Categories"
  itemLabel?: string      // e.g., "song" or "item"
  // Responsive props
  isDrawerMode?: boolean  // When rendered inside a drawer
}

export default function Navigation({
  deities,
  selectedDeity,
  onDeitySelect,
  showingFavorites,
  loading,
  categoryLabel = 'Deities',
  itemLabel = 'song',
  isDrawerMode = false,
}: NavigationProps) {
  const { colorMode } = useColorMode()

  return (
    <Box
      w={isDrawerMode ? '100%' : '200px'}
      h="100%"
      bg={colorMode === 'dark' ? 'dark.panelPrimary' : 'calm.panelPrimary'}
      borderRight={isDrawerMode ? 'none' : '1px'}
      borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
      overflowY="auto"
    >
      <Box p={4}>
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
                <Text fontSize="md" fontWeight="semibold">
                  {deity.name}
                </Text>
                <Text fontSize="sm" opacity={0.8}>
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
