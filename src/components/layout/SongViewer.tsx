import { Box, Heading, VStack, Text, Spinner, HStack, IconButton, Image, Button } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { AddIcon, MinusIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Song } from '../../types'
import { parseMetadata } from '../../services/metadataParser'
import { normalizeHtmlContent } from '../../services/contentNormalizer'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface SongViewerProps {
  song: Song | null
  loading: boolean
}

export default function SongViewer({ song, loading }: SongViewerProps) {
  const { colorMode } = useColorMode()
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium')
  const [imageZoom, setImageZoom] = useState(100)
  const [pdfNumPages, setPdfNumPages] = useState<number | null>(null)
  const [pdfPageNumber, setPdfPageNumber] = useState(1)
  const [pdfScale, setPdfScale] = useState(1.0)

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

  // Handle PDF display
  if (song.contentType === 'pdf') {
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
      setPdfNumPages(numPages)
      setPdfPageNumber(1)
    }

    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        overflowY="auto"
      >
        <Box maxW="1200px" mx="auto" p={8}>
          {/* Title */}
          <Heading
            size="lg"
            mb={4}
            color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
          >
            {song.name}
          </Heading>

          {/* PDF controls */}
          <HStack mb={4} spacing={2} justify="space-between" flexWrap="wrap">
            <HStack spacing={2}>
              <IconButton
                aria-label="Zoom out"
                icon={<MinusIcon />}
                size="sm"
                onClick={() => setPdfScale(prev => Math.max(0.5, prev - 0.25))}
              />
              <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                {Math.round(pdfScale * 100)}%
              </Text>
              <IconButton
                aria-label="Zoom in"
                icon={<AddIcon />}
                size="sm"
                onClick={() => setPdfScale(prev => Math.min(2.0, prev + 0.25))}
              />
              <IconButton
                aria-label="Reset zoom"
                icon={<Text fontSize="xs">100%</Text>}
                size="sm"
                onClick={() => setPdfScale(1.0)}
              />
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<ChevronLeftIcon />}
                onClick={() => setPdfPageNumber(prev => Math.max(1, prev - 1))}
                isDisabled={pdfPageNumber <= 1}
              >
                Prev
              </Button>
              <Text fontSize="sm" color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
                Page {pdfPageNumber} of {pdfNumPages || '...'}
              </Text>
              <Button
                size="sm"
                rightIcon={<ChevronRightIcon />}
                onClick={() => setPdfPageNumber(prev => Math.min(pdfNumPages || 1, prev + 1))}
                isDisabled={pdfPageNumber >= (pdfNumPages || 1)}
              >
                Next
              </Button>
              <IconButton
                aria-label="Download PDF"
                icon={<DownloadIcon />}
                size="sm"
                as="a"
                href={song.imageUrl}
                download={song.name}
                target="_blank"
              />
            </HStack>
          </HStack>

          {/* PDF display */}
          <Box
            borderRadius="md"
            overflow="auto"
            bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
            p={4}
            display="flex"
            justifyContent="center"
          >
            {song.imageUrl ? (
              <Document
                file={song.imageUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <Box textAlign="center" py={8}>
                    <Spinner size="lg" />
                    <Text mt={2} color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                      Loading PDF...
                    </Text>
                  </Box>
                }
                error={
                  <Text color="red.500" textAlign="center" py={8}>
                    Failed to load PDF. Please try again.
                  </Text>
                }
              >
                <Page
                  pageNumber={pdfPageNumber}
                  scale={pdfScale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            ) : (
              <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                PDF URL not available
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  // Handle image display
  if (song.contentType === 'image') {
    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        overflowY="auto"
      >
        <Box maxW="1200px" mx="auto" p={8}>
          {/* Title */}
          <Heading
            size="lg"
            mb={4}
            color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
          >
            {song.name}
          </Heading>

          {/* Image controls */}
          <HStack mb={4} spacing={2}>
            <IconButton
              aria-label="Zoom out"
              icon={<MinusIcon />}
              size="sm"
              onClick={() => setImageZoom(prev => Math.max(25, prev - 25))}
            />
            <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
              {imageZoom}%
            </Text>
            <IconButton
              aria-label="Zoom in"
              icon={<AddIcon />}
              size="sm"
              onClick={() => setImageZoom(prev => Math.min(200, prev + 25))}
            />
            <IconButton
              aria-label="Reset zoom"
              icon={<Text fontSize="xs">100%</Text>}
              size="sm"
              onClick={() => setImageZoom(100)}
            />
            <IconButton
              aria-label="Download image"
              icon={<DownloadIcon />}
              size="sm"
              as="a"
              href={song.imageUrl}
              download={song.name}
              target="_blank"
            />
          </HStack>

          {/* Image display */}
          <Box
            borderRadius="md"
            overflow="auto"
            maxH="calc(100vh - 250px)"
            bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
            p={4}
          >
            {song.imageUrl ? (
              <Image
                src={song.imageUrl}
                alt={song.name}
                style={{
                  transform: `scale(${imageZoom / 100})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s',
                }}
                maxW="none"
              />
            ) : (
              <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                Image URL not available
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  // Parse metadata and content for text songs
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
            {metadata.spotify && (
              <Text fontSize="sm">
                <strong>Spotify:</strong>{' '}
                <Text
                  as="a"
                  href={metadata.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  color={colorMode === 'dark' ? 'dark.accent' : 'calm.accent'}
                  _hover={{ textDecoration: 'underline' }}
                >
                  🎧 Listen
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
