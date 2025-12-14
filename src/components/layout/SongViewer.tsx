import { Box, Heading, VStack, Text, Spinner, HStack, IconButton } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { Song } from '../../types'
import { parseMetadata } from '../../services/metadataParser'
import { normalizeHtmlContent } from '../../services/contentNormalizer'
import { useState } from 'react'

interface SongViewerProps {
  song: Song | null
  loading: boolean
}

export default function SongViewer({ song, loading }: SongViewerProps) {
  const { colorMode } = useColorMode()
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium')

  if (!song) {
    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        p={8}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
        >
          Select a song to view
        </Text>
      </Box>
    )
  }

  if (loading && !song.content) {
    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        p={8}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" />
      </Box>
    )
  }

  // Parse metadata and content
  const rawContent = song.content || ''
  const { metadata, lyrics } = parseMetadata(rawContent)
  const normalizedHtml = normalizeHtmlContent(lyrics, colorMode === 'dark' ? 'dark' : 'calm')

  const fontSizes = {
    small: '18px',
    medium: '22px',
    large: '28px',
    xlarge: '36px',
  }

  return (
    <Box
      flex="1"
      h="100%"
      bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
      overflowY="auto"
    >
      <Box maxW="800px" mx="auto" p={8}>
        {/* Title */}
        <Heading
          size="lg"
          mb={4}
          color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
        >
          {metadata.title || song.name}
        </Heading>

        {/* Metadata if present */}
        {metadata.ragam && (
          <VStack
            align="start"
            bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
            p={4}
            borderRadius="md"
            mb={6}
            spacing={2}
          >
            {metadata.ragam && (
              <Text fontSize="sm">
                <strong>Ragam:</strong> {metadata.ragam}
              </Text>
            )}
            {metadata.talam && (
              <Text fontSize="sm">
                <strong>Talam:</strong> {metadata.talam}
              </Text>
            )}
            {metadata.tags && metadata.tags.length > 0 && (
              <Text fontSize="sm">
                <strong>Tags:</strong> {metadata.tags.join(', ')}
              </Text>
            )}
            {metadata.youtube && (
              <Text fontSize="sm">
                <strong>YouTube:</strong>{' '}
                <Text
                  as="a"
                  href={metadata.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  color={colorMode === 'dark' ? 'dark.accent' : 'calm.accent'}
                  _hover={{ textDecoration: 'underline' }}
                >
                  🎵 Watch
                </Text>
              </Text>
            )}
            {metadata.source && (
              <Text fontSize="sm">
                <strong>Source:</strong> {metadata.source}
              </Text>
            )}
          </VStack>
        )}

        {/* Font size controls */}
        <HStack mb={4} spacing={2}>
          <IconButton
            aria-label="Decrease font size"
            icon={<Text fontSize="sm">A-</Text>}
            size="sm"
            onClick={() => {
              const sizes: Array<'small' | 'medium' | 'large' | 'xlarge'> = ['small', 'medium', 'large', 'xlarge']
              const currentIndex = sizes.indexOf(fontSize)
              if (currentIndex > 0) setFontSize(sizes[currentIndex - 1])
            }}
          />
          <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
            {fontSize}
          </Text>
          <IconButton
            aria-label="Increase font size"
            icon={<Text fontSize="sm">A+</Text>}
            size="sm"
            onClick={() => {
              const sizes: Array<'small' | 'medium' | 'large' | 'xlarge'> = ['small', 'medium', 'large', 'xlarge']
              const currentIndex = sizes.indexOf(fontSize)
              if (currentIndex < sizes.length - 1) setFontSize(sizes[currentIndex + 1])
            }}
          />
        </HStack>

        {/* Lyrics */}
        <Box
          className="tamil-text"
          fontSize={fontSizes[fontSize]}
          lineHeight="1.8"
          color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: normalizedHtml }}
          sx={{
            '& p': {
              marginBottom: '1em',
            },
            '& strong': {
              fontWeight: 'bold',
            },
            '& em': {
              fontStyle: 'italic',
            },
          }}
        />
      </Box>
    </Box>
  )
}
