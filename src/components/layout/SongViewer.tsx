import { Box, Heading, VStack, Text, Spinner, HStack, IconButton, Image, Button, Tabs, TabList, Tab, Table, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { AddIcon, MinusIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Song, MultiLanguageContent } from '../../types'
import { parseMetadata } from '../../services/metadataParser'
import { normalizeHtmlContent } from '../../services/contentNormalizer'
import { useState, useMemo, useEffect, useRef } from 'react'
import { extractFirstYouTubeUrl } from '../../utils/extractYouTubeUrl'
import { Document, Page, pdfjs } from 'react-pdf'
import { db } from '../../db/database'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface SongViewerProps {
  song: Song | null
  loading: boolean
  externalUrl?: string | null
  externalTitle?: string | null
  onClearExternal?: () => void
  onDetectedExternalUrl?: (url: string | null) => void
  onExternalUrlSelect?: (url: string) => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export default function SongViewer({
  song,
  loading,
  externalUrl,
  externalTitle,
  onClearExternal,
  onDetectedExternalUrl,
  onExternalUrlSelect,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: SongViewerProps) {
  const { colorMode } = useColorMode()

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium')
  const [imageZoom, setImageZoom] = useState(100)
  const contentRef = useRef<HTMLDivElement>(null)
  const [pdfNumPages, setPdfNumPages] = useState<number | null>(null)
  const [pdfPageNumber, setPdfPageNumber] = useState(1)
  const [pdfScale, setPdfScale] = useState(1.0)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english')

  // Check if content is multi-language
  const isMultiLanguage = useMemo(() => {
    if (!song?.content) return false
    // Check if it's an object (MultiLanguageContent) and not an array
    if (typeof song.content === 'object' && !Array.isArray(song.content)) {
      // Verify it has language keys (not just metadata)
      const keys = Object.keys(song.content)
      const hasLanguageKeys = keys.some(key => ['english', 'sanskrit', 'tamil'].includes(key))
      if (hasLanguageKeys) {
        console.log('Multi-language detected:', keys, 'Available languages:', song.availableLanguages)
      }
      return hasLanguageKeys
    }
    return false
  }, [song?.content, song?.availableLanguages])

  const availableLanguages = useMemo(() => {
    if (isMultiLanguage && song?.content && typeof song.content === 'object' && !Array.isArray(song.content)) {
      const multiContent = song.content as MultiLanguageContent
      // Only include languages that actually have content (non-empty strings)
      const languagesWithContent = (song.availableLanguages || Object.keys(multiContent)).filter(lang => {
        const content = multiContent[lang]
        return content && typeof content === 'string' && content.trim().length > 0
      })
      return languagesWithContent.length > 0 ? languagesWithContent : ['english']
    }
    return ['english']
  }, [isMultiLanguage, song?.availableLanguages, song?.content])

  // Initialize selected language based on user preference or first available
  // Also ensure selected language has content
  useEffect(() => {
    if (isMultiLanguage && availableLanguages.length > 0) {
      const loadUserLanguage = async () => {
        try {
          const settings = await db.settings.get('app')
          const userLanguage = settings?.language || 'english'
          
          // If user's preferred language is available and has content, use it; otherwise use first available
          if (availableLanguages.includes(userLanguage)) {
            setSelectedLanguage(userLanguage)
          } else {
            setSelectedLanguage(availableLanguages[0])
          }
        } catch (error) {
          // Fallback to first available language
          setSelectedLanguage(availableLanguages[0])
        }
      }
      loadUserLanguage()
    } else {
      setSelectedLanguage('english')
    }
  }, [isMultiLanguage, availableLanguages])
  
  // Ensure selected language has content - if not, switch to first available
  useEffect(() => {
    if (isMultiLanguage && availableLanguages.length > 0 && !availableLanguages.includes(selectedLanguage)) {
      setSelectedLanguage(availableLanguages[0])
    }
  }, [isMultiLanguage, availableLanguages, selectedLanguage])

  // Cleanup blob URLs when component unmounts or song changes
  useEffect(() => {
    return () => {
      // Revoke blob URL to prevent memory leaks
      if (song?.imageUrl?.startsWith('blob:') && song.contentType !== 'audio') {
        URL.revokeObjectURL(song.imageUrl)
      }
    }
  }, [song?.imageUrl])

  // Get current language content
  const currentLanguageContent = useMemo(() => {
    if (!song?.content) return ''
    
    if (isMultiLanguage) {
      const multiContent = song.content as MultiLanguageContent
      const content = multiContent[selectedLanguage] || multiContent[availableLanguages[0]] || ''
      // Ensure it's a string
      return typeof content === 'string' ? content : ''
    }
    
    // Single language content should be a string
    return typeof song.content === 'string' ? song.content : ''
  }, [song?.content, isMultiLanguage, selectedLanguage, availableLanguages])

  // Parse metadata and content for text songs
  // currentLanguageContent is already a string (extracted from MultiLanguageContent if needed)
  const rawContent = typeof currentLanguageContent === 'string' ? currentLanguageContent : ''

  // For multi-language content, metadata is already extracted, so just get lyrics
  // For single-language content, parse metadata
  let lyrics = rawContent
  let parsedMetadata = song?.metadata || {}
  if (!isMultiLanguage) {
    const parsed = parseMetadata(rawContent)
    lyrics = parsed.lyrics
    parsedMetadata = parsed.metadata || parsedMetadata
  }

  const normalizedHtml = normalizeHtmlContent(lyrics, colorMode === 'dark' ? 'dark' : 'calm')

  const detectedExternalUrl = useMemo(() => {
    return extractFirstYouTubeUrl([song?.metadata?.youtube, parsedMetadata?.youtube, rawContent, normalizedHtml])
  }, [song?.metadata?.youtube, parsedMetadata, rawContent, normalizedHtml])

  useEffect(() => {
    if (!onDetectedExternalUrl) return
    onDetectedExternalUrl(detectedExternalUrl)
  }, [detectedExternalUrl, onDetectedExternalUrl])


  if (externalUrl) {
    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        display="flex"
        flexDirection="column"
      >
        <Box flex="1" overflowY="auto">
          <Box maxW="1200px" mx="auto" p={8} pb={8} h="100%">
            <HStack justify="space-between" mb={4} flexWrap="wrap">
              <Heading
                size="lg"
                color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
              >
                {externalTitle || externalUrl}
              </Heading>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  as="a"
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in new tab
                </Button>
                {onClearExternal && (
                  <Button size="sm" variant="ghost" onClick={onClearExternal}>
                    Back to item
                  </Button>
                )}
              </HStack>
            </HStack>
            <Box
              borderRadius="md"
              overflow="hidden"
              bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
              h="calc(100vh - 260px)"
            >
              <Box
                as="iframe"
                src={externalUrl}
                title={externalTitle || externalUrl}
                w="100%"
                h="100%"
                border="0"
                loading="lazy"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  if (!song) {
    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        display="flex"
        flexDirection="column"
        overflowY="auto"
      >
        <Box p={8} flex="1" display="flex" alignItems="center" justifyContent="center">
          <Text
            color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
          >
            Select an item to view
          </Text>
        </Box>
      </Box>
    )
  }

  if (loading && !song.content) {
    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        display="flex"
        flexDirection="column"
        overflowY="auto"
      >
        <Box p={8} flex="1" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="lg" />
        </Box>
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
        display="flex"
        flexDirection="column"
      >
        <Box flex="1" overflowY="auto">
          <Box maxW="1200px" mx="auto" p={8} pb={8}>
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
        display="flex"
        flexDirection="column"
      >
        <Box flex="1" overflowY="auto">
          <Box maxW="1200px" mx="auto" p={8} pb={8}>
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
      </Box>
    )
  }

  // Handle audio display
  if (song.contentType === 'audio') {
    return (
      <Box
        flex="1"
        h="100%"
        bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
        display="flex"
        flexDirection="column"
      >
        <Box flex="1" overflowY="auto">
          <Box maxW="800px" mx="auto" p={8} pb={8}>
            {/* Title */}
            <Heading
              size="lg"
              mb={4}
              color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
            >
              {song.name}
            </Heading>

            {/* Playback controls */}
            <HStack mb={4} spacing={2} justify="space-between" flexWrap="wrap">
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<ChevronLeftIcon />}
                  onClick={onPrev}
                  isDisabled={!hasPrev || !onPrev}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  rightIcon={<ChevronRightIcon />}
                  onClick={onNext}
                  isDisabled={!hasNext || !onNext}
                >
                  Next
                </Button>
              </HStack>

              <IconButton
                aria-label="Download audio"
                icon={<DownloadIcon />}
                size="sm"
                as="a"
                href={song.imageUrl}
                download={song.name}
                target="_blank"
              />
            </HStack>

            {/* Audio player */}
            <Box
              borderRadius="md"
              bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
              p={4}
            >
              {song.imageUrl ? (
                <audio
                  src={song.imageUrl}
                  controls
                  style={{ width: '100%' }}
                  onEnded={onNext}
                />
              ) : (
                <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                  Audio URL not available
                </Text>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  const youtubeUrl = parsedMetadata?.youtube || song?.metadata?.youtube || null
  const normalizedYoutubeUrl = youtubeUrl ? extractFirstYouTubeUrl([youtubeUrl]) ?? youtubeUrl : null

  // Language label mapping (in native scripts)
  const languageLabels: Record<string, string> = {
    english: 'English',
    sanskrit: 'संस्कृतम्',
    tamil: 'தமிழ்',
  }

  // Zoom levels for scaling both text and images together
  const zoomLevels = {
    small: 0.82,
    medium: 1.0,
    large: 1.27,
    xlarge: 1.64,
  }

  return (
    <Box
      flex="1"
      h="100%"
      bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'}
      display="flex"
      flexDirection="column"
    >
      <Box flex="1" overflowY="auto">
        <Box maxW="800px" mx="auto" p={8} pb={8}>
        {/* Language Tabs (only show if multi-language) */}
        {isMultiLanguage && availableLanguages.length > 1 && (
          <Tabs
            index={availableLanguages.indexOf(selectedLanguage)}
            onChange={(index) => setSelectedLanguage(availableLanguages[index])}
            mb={6}
          >
            <TabList>
              {availableLanguages.map((lang) => (
                <Tab
                  key={lang}
                  fontSize="sm"
                  fontWeight="medium"
                  _selected={{
                    color: colorMode === 'dark' ? 'dark.accent' : 'calm.accent',
                    borderBottomColor: colorMode === 'dark' ? 'dark.accent' : 'calm.accent',
                  }}
                >
                  {languageLabels[lang] || lang.toUpperCase()}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        )}

        {/* Title - use language-specific title from __TIT if available */}
        <Heading
          size="lg"
          mb={4}
          color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
        >
          {song.languageMetadata?.[selectedLanguage]?.title || song.languageTitles?.[selectedLanguage] || song.metadata?.title || parsedMetadata?.title || song.name}
        </Heading>

        {/* Metadata table - use language-specific metadata from __RAG, __TAL, etc. */}
        {(song.languageMetadata?.[selectedLanguage] || song.metadata || parsedMetadata?.ragam) && (
          <Box
            bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
            p={4}
            borderRadius="md"
            mb={6}
          >
            <Table variant="simple" size="sm">
              <Tbody>
                {/* Title (from __TIT) */}
                {(song.languageMetadata?.[selectedLanguage]?.title) && (
                  <Tr>
                    <Th width="120px" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                      Title
                    </Th>
                    <Td color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
                      {song.languageMetadata[selectedLanguage].title}
                    </Td>
                  </Tr>
                )}
                {/* Raga */}
                {(song.languageMetadata?.[selectedLanguage]?.ragam || song.metadata?.ragam || parsedMetadata?.ragam) && (
                  <Tr>
                    <Th width="120px" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                      Raga
                    </Th>
                    <Td color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
                      {song.languageMetadata?.[selectedLanguage]?.ragam || song.metadata?.ragam || parsedMetadata?.ragam}
                    </Td>
                  </Tr>
                )}
                {/* Talam */}
                {(song.languageMetadata?.[selectedLanguage]?.talam || song.metadata?.talam || parsedMetadata?.talam) && (
                  <Tr>
                    <Th width="120px" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                      Talam
                    </Th>
                    <Td color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
                      {song.languageMetadata?.[selectedLanguage]?.talam || song.metadata?.talam || parsedMetadata?.talam}
                    </Td>
                  </Tr>
                )}
                {/* Composer */}
                {(song.languageMetadata?.[selectedLanguage]?.composer || song.metadata?.composer) && (
                  <Tr>
                    <Th width="120px" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                      Composer
                    </Th>
                    <Td color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
                      {song.languageMetadata?.[selectedLanguage]?.composer || song.metadata?.composer}
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
            
            {/* Other metadata (tags, YouTube, etc.) */}
            <VStack align="start" spacing={2} mt={4}>
            {((song.metadata?.tags && song.metadata.tags?.length > 0) || (parsedMetadata?.tags && parsedMetadata.tags.length > 0)) && (
              <Text fontSize="sm">
                <strong>Tags:</strong> {(song.metadata?.tags || parsedMetadata?.tags)?.join(', ')}
              </Text>
            )}
            {normalizedYoutubeUrl && (
              <Text fontSize="sm">
                <strong>YouTube:</strong>{' '}
                <Text
                  as="a"
                  href={normalizedYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  color={colorMode === 'dark' ? 'dark.accent' : 'calm.accent'}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    if (onExternalUrlSelect) {
                      onExternalUrlSelect(normalizedYoutubeUrl)
                    } else {
                      window.open(normalizedYoutubeUrl, '_blank', 'noopener,noreferrer')
                    }
                  }}
                >
                  🎵 Watch
                </Text>
              </Text>
            )}
            {(song.metadata?.spotify || parsedMetadata?.spotify) && (
              <Text fontSize="sm">
                <strong>Spotify:</strong>{' '}
                <Text
                  as="a"
                  href={song.metadata?.spotify || parsedMetadata?.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  color={colorMode === 'dark' ? 'dark.accent' : 'calm.accent'}
                  _hover={{ textDecoration: 'underline' }}
                >
                  🎧 Listen
                </Text>
              </Text>
            )}
            {(song.metadata?.source || parsedMetadata?.source) && (
              <Text fontSize="sm">
                <strong>Source:</strong> {song.metadata?.source || parsedMetadata?.source}
              </Text>
            )}
            </VStack>
          </Box>
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
          ref={contentRef}
          className="tamil-text"
          lineHeight="1.8"
          color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: normalizedHtml }}
          onClick={(event) => {
            const target = event.target as HTMLElement | null
            const anchor = target?.closest?.('a') as HTMLAnchorElement | null
            if (!anchor?.href) return
            const extracted = extractFirstYouTubeUrl([anchor.href])
            if (!extracted) return
            event.preventDefault()
            event.stopPropagation()
            if (onExternalUrlSelect) {
              onExternalUrlSelect(extracted)
            } else {
              window.open(extracted, '_blank', 'noopener,noreferrer')
            }
          }}
          style={{
            zoom: zoomLevels[fontSize],
            fontSize: '22px',
          }}
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
            '& img': {
              maxWidth: '100%',
              height: 'auto',
            },
          }}
        />
      </Box>
      </Box>
    </Box>
  )
}
