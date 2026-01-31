import { Box, Button, HStack, IconButton, Input, Spinner, Text, useColorMode } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, DownloadIcon } from '@chakra-ui/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Song } from '../../types'

interface AudioPanelProps {
  nowPlayingSong: Song | null
  loading: boolean
  panelHeight: number
  onHeightChange: (height: number) => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  autoExternalUrl?: string | null
}

export default function AudioPanel({
  nowPlayingSong,
  loading,
  panelHeight,
  onHeightChange,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  autoExternalUrl,
}: AudioPanelProps) {
  const { colorMode } = useColorMode()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastAudioSongIdRef = useRef<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [externalUrlInput, setExternalUrlInput] = useState('')
  const [externalEmbedUrl, setExternalEmbedUrl] = useState<string | null>(null)
  const [externalLabel, setExternalLabel] = useState<string | null>(null)
  const [externalError, setExternalError] = useState<string | null>(null)
  const [recentUrls, setRecentUrls] = useState<string[]>([])
  const speedOptions = [0.5, 0.7, 0.9, 1, 1.2, 1.5, 2]
  const skipOptions = [5, 10, 30, 60]
  const heightPresets = [
    { label: 'Small', value: 160 },
    { label: 'Medium', value: 300 },
    { label: 'Large', value: 520 },
  ]
  const smallHeight = 160
  const largeHeight = 520
  const prevExternalEmbedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackRate
  }, [playbackRate, nowPlayingSong?.imageUrl])

  useEffect(() => {
    const stored = localStorage.getItem('recentExternalAudioUrls')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setRecentUrls(parsed.filter((item) => typeof item === 'string'))
      }
    } catch {
      // Ignore malformed storage.
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('recentExternalAudioUrls', JSON.stringify(recentUrls))
  }, [recentUrls])

  useEffect(() => {
    const currentSongId = nowPlayingSong?.id ?? null
    if (lastAudioSongIdRef.current === currentSongId) return
    lastAudioSongIdRef.current = currentSongId
    if (!currentSongId || !externalEmbedUrl) return
    setExternalEmbedUrl(null)
    setExternalLabel(null)
    setExternalError(null)
  }, [nowPlayingSong?.id])

  useEffect(() => {
    if (!externalEmbedUrl) return
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
  }, [externalEmbedUrl])

  useEffect(() => {
    const prevExternal = prevExternalEmbedUrlRef.current
    prevExternalEmbedUrlRef.current = externalEmbedUrl

    if (!prevExternal && externalEmbedUrl) {
      onHeightChange(largeHeight)
      return
    }

    if (prevExternal && !externalEmbedUrl && nowPlayingSong) {
      onHeightChange(smallHeight)
    }
  }, [externalEmbedUrl, nowPlayingSong?.id, onHeightChange, largeHeight, smallHeight])

  const resolveExternalEmbed = useCallback((input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return null
    try {
      const url = new URL(trimmed)
      const hostname = url.hostname.replace(/^www\./, '').toLowerCase()

      if (hostname === 'youtu.be') {
        const id = url.pathname.split('/').filter(Boolean)[0]
        if (id) return { embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0`, label: 'YouTube' }
      }

      if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts[0] === 'watch') {
          const id = url.searchParams.get('v')
          if (id) return { embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0`, label: 'YouTube' }
        }
        if (pathParts[0] === 'embed' || pathParts[0] === 'shorts') {
          const id = pathParts[1]
          if (id) return { embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0`, label: 'YouTube' }
        }
      }

      if (hostname === 'open.spotify.com' || hostname === 'spotify.com') {
        const [type, id] = url.pathname.split('/').filter(Boolean)
        if (type && id && ['track', 'playlist', 'album', 'episode', 'show'].includes(type)) {
          return { embedUrl: `https://open.spotify.com/embed/${type}/${id}`, label: 'Spotify' }
        }
      }
    } catch {
      return null
    }

    return null
  }, [])

  useEffect(() => {
    if (!autoExternalUrl) return
    const resolved = resolveExternalEmbed(autoExternalUrl)
    if (!resolved) return
    if (externalEmbedUrl === resolved.embedUrl && externalLabel === resolved.label) return
    setExternalUrlInput(autoExternalUrl)
    setExternalEmbedUrl(resolved.embedUrl)
    setExternalLabel(resolved.label)
    setExternalError(null)
  }, [autoExternalUrl, externalEmbedUrl, externalLabel, resolveExternalEmbed])

  const handleExternalPlay = () => {
    const trimmedInput = externalUrlInput.trim()
    const resolved = resolveExternalEmbed(trimmedInput)
    if (!resolved) {
      setExternalError('Enter a valid YouTube or Spotify URL.')
      return
    }
    setExternalEmbedUrl(resolved.embedUrl)
    setExternalLabel(resolved.label)
    setExternalError(null)
    setRecentUrls((prev) => {
      const next = [trimmedInput, ...prev.filter((url) => url !== trimmedInput)]
      return next.slice(0, 10)
    })
  }

  const handleExternalClear = () => {
    setExternalEmbedUrl(null)
    setExternalLabel(null)
    setExternalError(null)
  }

  const adjustTime = (deltaSeconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0
    let nextTime = audio.currentTime + deltaSeconds
    if (nextTime < 0) nextTime = 0
    if (duration > 0 && nextTime > duration) nextTime = duration
    audio.currentTime = nextTime
  }

  const replayFromStart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    void audio.play()
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      void audio.play()
    } else {
      audio.pause()
    }
  }

  return (
    <Box
      h="100%"
      bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
      display="flex"
      flexDirection="column"
      px={4}
      py={3}
      pb="calc(env(safe-area-inset-bottom, 0px) + 12px)"
    >
      <Box
        mb={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={3}
        flexWrap="wrap"
      >
        <HStack spacing={2} flex="1" minW="280px" justify="flex-start">
          <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
            URL:
          </Text>
          <Input
            size="xs"
            value={externalUrlInput}
            onChange={(event) => setExternalUrlInput(event.target.value)}
            placeholder="Paste YouTube or Spotify URL"
            w="260px"
            list="recent-external-urls"
          />
          <Box as="datalist" id="recent-external-urls">
            {recentUrls.map((url) => (
              <option key={url} value={url} />
            ))}
          </Box>
          <IconButton
            aria-label="Play URL"
            size="xs"
            icon={<ChevronRightIcon />}
            onClick={handleExternalPlay}
            isDisabled={!externalUrlInput.trim()}
          />
          {(externalEmbedUrl || externalUrlInput.trim()) && (
            <IconButton
              aria-label="Clear URL"
              size="xs"
              variant="outline"
              icon={<CloseIcon />}
              onClick={handleExternalClear}
            />
          )}
        </HStack>
        <Box flex="1" minW="200px" textAlign="center">
          <Text
            fontSize="sm"
            color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
            noOfLines={1}
          >
            {externalEmbedUrl
              ? `Now Playing: ${externalLabel ?? 'External URL'}`
              : nowPlayingSong
              ? `Now Playing: ${nowPlayingSong.name}`
              : 'Select audio to play'}
          </Text>
        </Box>
        <HStack spacing={2} flex="1" minW="280px" justify="flex-end">
          <Button
            size="xs"
            leftIcon={<ChevronLeftIcon />}
            onClick={onPrev}
            isDisabled={!hasPrev || !onPrev || !nowPlayingSong || loading}
          >
            Prev
          </Button>
          <Button
            size="xs"
            rightIcon={<ChevronRightIcon />}
            onClick={onNext}
            isDisabled={!hasNext || !onNext || !nowPlayingSong || loading}
          >
            Next
          </Button>
          <IconButton
            aria-label="Download audio"
            icon={<DownloadIcon />}
            size="xs"
            as="a"
            href={nowPlayingSong?.imageUrl}
            download={nowPlayingSong?.name}
            target="_blank"
            isDisabled={!!externalEmbedUrl || !nowPlayingSong?.imageUrl}
          />
          <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
            Height:
          </Text>
          {heightPresets.map((preset) => (
            <Button
              key={preset.label}
              size="xs"
              variant={panelHeight === preset.value ? 'solid' : 'outline'}
              onClick={() => onHeightChange(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </HStack>
      </Box>
      {externalError && (
        <Text fontSize="xs" color="red.400" mb={2}>
          {externalError}
        </Text>
      )}
      <Box flex="1" minH="0" display="flex">
        <Box flex="1" minW="0" display="flex" flexDirection="column">
          {loading ? (
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <Spinner size="sm" />
            </Box>
          ) : externalEmbedUrl ? (
            <Box flex="1" minH="0">
              <Box
                as="iframe"
                src={externalEmbedUrl}
                title={externalLabel ?? 'External audio'}
                width="100%"
                height="100%"
                border="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            </Box>
          ) : nowPlayingSong?.imageUrl ? (
            <Box>
              <audio
                ref={audioRef}
                src={nowPlayingSong.imageUrl}
                controls
                style={{ width: '100%' }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              <HStack spacing={2} mt={2} justify="space-between" align="center" w="100%">
                <HStack spacing={2} flex="1" justify="flex-start">
                  <Button
                    size="xs"
                    onClick={togglePlayPause}
                    bg={isPlaying ? 'green.400' : 'orange.400'}
                    color="white"
                    _hover={{ bg: isPlaying ? 'green.500' : 'orange.500' }}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    size="xs"
                    onClick={replayFromStart}
                    bg={colorMode === 'dark' ? 'purple.600' : 'purple.200'}
                    color={colorMode === 'dark' ? 'whiteAlpha.900' : 'purple.900'}
                    _hover={{ bg: colorMode === 'dark' ? 'purple.500' : 'purple.300' }}
                  >
                    Replay
                  </Button>
                </HStack>
                <HStack spacing={2} flex="1" justify="center">
                  {[...skipOptions].reverse().map((seconds) => (
                    <Button key={`back-${seconds}`} size="xs" onClick={() => adjustTime(-seconds)}>
                      -{seconds}s
                    </Button>
                  ))}
                  <Text
                    fontSize="xs"
                    color={colorMode === 'dark' ? 'whiteAlpha.900' : 'blue.900'}
                    bg={colorMode === 'dark' ? 'blue.700' : 'blue.200'}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    &lt;&lt; Skip &gt;&gt;
                  </Text>
                  {skipOptions.map((seconds) => (
                    <Button key={`forward-${seconds}`} size="xs" onClick={() => adjustTime(seconds)}>
                      +{seconds}s
                    </Button>
                  ))}
                </HStack>
                <HStack spacing={2} flex="1" justify="flex-end">
                  {speedOptions.map((rate) => (
                    <Button
                      key={`speed-${rate}`}
                      size="xs"
                      onClick={() => setPlaybackRate(rate)}
                      variant={playbackRate === rate ? 'solid' : 'outline'}
                      fontWeight={rate === 1 ? 'bold' : 'normal'}
                      fontSize={rate === 1 ? 'sm' : 'xs'}
                      bg={
                        rate === 1
                          ? colorMode === 'dark'
                            ? 'purple.600'
                            : 'purple.200'
                          : undefined
                      }
                      color={
                        rate === 1
                          ? colorMode === 'dark'
                            ? 'whiteAlpha.900'
                            : 'purple.900'
                          : undefined
                      }
                      _hover={
                        rate === 1
                          ? {
                              bg: colorMode === 'dark' ? 'purple.500' : 'purple.300',
                            }
                          : undefined
                      }
                    >
                      {rate === 1 ? 'Normal Speed' : `${rate}x`}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            </Box>
          ) : !nowPlayingSong ? (
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                Select audio to play
              </Text>
            </Box>
          ) : (
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                Audio URL not available
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

