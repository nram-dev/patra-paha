import { Box, Button, HStack, IconButton, Spinner, Text, useColorMode } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from '@chakra-ui/icons'
import { useEffect, useRef, useState } from 'react'
import { Song } from '../../types'

interface AudioPanelProps {
  nowPlayingSong: Song | null
  loading: boolean
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export default function AudioPanel({
  nowPlayingSong,
  loading,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: AudioPanelProps) {
  const { colorMode } = useColorMode()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const speedOptions = [0.5, 0.7, 0.9, 1, 1.2, 1.5, 2]
  const skipOptions = [5, 10, 30, 60]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackRate
  }, [playbackRate, nowPlayingSong?.imageUrl])

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
      <HStack spacing={3} mb={2} justify="space-between" flexWrap="wrap">
        <Text
          fontSize="sm"
          color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
        >
          {nowPlayingSong ? `Now Playing: ${nowPlayingSong.name}` : 'Select audio to play'}
        </Text>
        <HStack spacing={2}>
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
            isDisabled={!nowPlayingSong?.imageUrl}
          />
        </HStack>
      </HStack>
      {loading ? (
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="sm" />
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
              <Text
                fontSize="xs"
                color={colorMode === 'dark' ? 'whiteAlpha.900' : 'blue.900'}
                bg={colorMode === 'dark' ? 'blue.700' : 'blue.200'}
                px={2}
                py={1}
                borderRadius="md"
              >
                Skip &lt;&lt;
              </Text>
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
                Skip &gt;&gt;
              </Text>
              {skipOptions.map((seconds) => (
                <Button key={`forward-${seconds}`} size="xs" onClick={() => adjustTime(seconds)}>
                  +{seconds}s
                </Button>
              ))}
            </HStack>
            <HStack spacing={2} flex="1" justify="flex-end">
              <Text
                fontSize="xs"
                color={colorMode === 'dark' ? 'whiteAlpha.900' : 'teal.900'}
                bg={colorMode === 'dark' ? 'teal.600' : 'teal.200'}
                px={2}
                py={1}
                borderRadius="md"
              >
                Speed
              </Text>
              {speedOptions.map((rate) => (
                <Button
                  key={`speed-${rate}`}
                  size="xs"
                  onClick={() => setPlaybackRate(rate)}
                  variant={playbackRate === rate ? 'solid' : 'outline'}
                  fontWeight={rate === 1 ? 'bold' : 'normal'}
                  fontSize={rate === 1 ? 'sm' : 'xs'}
                >
                  {rate}x
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
  )
}

