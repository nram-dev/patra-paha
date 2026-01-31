import { Box, Button, HStack, IconButton, Spinner, Text, useColorMode } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from '@chakra-ui/icons'
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
        <audio
          src={nowPlayingSong.imageUrl}
          controls
          style={{ width: '100%' }}
          onEnded={onNext}
        />
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

