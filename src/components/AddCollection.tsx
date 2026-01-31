import { useState, useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  SimpleGrid,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { COLLECTION_CONFIGS, CUSTOM_COLORS, CUSTOM_ICONS, DEFAULT_CUSTOM_CONFIG } from '../config/collections'
import { useCollectionStore } from '../stores/collectionStore'
import { driveService } from '../services/driveService'
import { scanCollection } from '../services/scanService'
import { Collection, CollectionType } from '../types'

type PresetType = 'bhajana' | 'anusthanam' | 'custom'

export const AddCollection = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { addCollection } = useCollectionStore()

  const [folderName, setFolderName] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [usePreset, setUsePreset] = useState<PresetType>('custom')
  const [selectedIcon, setSelectedIcon] = useState(CUSTOM_ICONS[0])
  const [selectedColor, setSelectedColor] = useState(CUSTOM_COLORS[0])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if user has manually edited collection name
  const userEditedName = useRef(false)

  // Auto-fill collection name when folder name changes (only if user hasn't manually edited)
  useEffect(() => {
    if (folderName.trim() && !userEditedName.current) {
      setCollectionName(folderName.trim())
    }
  }, [folderName])

  const handleCollectionNameChange = (value: string) => {
    userEditedName.current = true
    setCollectionName(value)
  }

  const getConfig = () => {
    if (usePreset === 'custom') {
      return {
        ...DEFAULT_CUSTOM_CONFIG,
        icon: selectedIcon,
        color: selectedColor.color,
        accentColor: selectedColor.accent,
      }
    }
    return COLLECTION_CONFIGS[usePreset]
  }

  const handleSearch = async () => {
    if (!folderName.trim()) {
      setError('Please enter a folder name')
      return
    }

    setSearching(true)
    setError(null)

    try {
      const folder = await driveService.findFolderByName(folderName.trim())

      if (!folder) {
        setError(`Folder "${folderName}" not found in your Google Drive. Please check the name and try again.`)
        setSearching(false)
        return
      }

      const config = getConfig()

      // Create collection
      const collection: Collection = {
        id: `${usePreset}-${Date.now()}`,
        type: usePreset as CollectionType,
        name: collectionName.trim() || folderName.trim(),
        nameDevanagari: usePreset !== 'custom' ? config.nameDevanagari : undefined,
        nameTamil: usePreset !== 'custom' ? config.nameTamil : undefined,
        icon: config.icon,
        color: config.color,
        accentColor: config.accentColor,
        driveFolderId: folder.id,
        driveFolderPath: `/${folderName}`,
        features: config.features,
        createdAt: new Date().toISOString(),
      }

      await addCollection(collection)

      toast({
        title: 'Collection added!',
        description: `Scanning folder contents...`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      })

      // Auto-scan the collection to populate categories
      try {
        await scanCollection(collection)
        toast({
          title: 'Scan complete!',
          description: `${collection.name} is ready to use.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (scanError) {
        console.error('Failed to scan collection:', scanError)
        toast({
          title: 'Scan failed',
          description: 'Collection added but folder scan failed. Try "Scan now" from the home page.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }

      // Navigate to the new collection
      navigate(`/collection/${collection.id}`)
    } catch (error) {
      console.error('Failed to add collection:', error)
      setError('Failed to add collection. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const config = getConfig()

  return (
    <Box p={8} bg="calm.background" minH="100vh">
      <VStack spacing={6} maxW="600px" mx="auto">
        {/* Back Button */}
        <Box w="full">
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>

        {/* Header */}
        <Box textAlign="center" w="full">
          <Box fontSize="4xl" mb={2}>{config.icon}</Box>
          <Heading size="lg" mb={2}>Add New Collection</Heading>
          <Text color="gray.600">
            Connect a Google Drive folder to create a new collection
          </Text>
        </Box>

        {/* Form */}
        <VStack spacing={5} w="full" bg="white" p={6} borderRadius="md" shadow="sm">
          {/* Google Drive Folder Name */}
          <FormControl isRequired>
            <FormLabel>Google Drive Folder Name</FormLabel>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., MyRecipes, StudyNotes, Bhajans"
            />
            <FormHelperText>
              Enter the exact name of the folder in your Google Drive
            </FormHelperText>
          </FormControl>

          {/* Collection Name */}
          <FormControl>
            <FormLabel>Collection Name</FormLabel>
            <Input
              value={collectionName}
              onChange={(e) => handleCollectionNameChange(e.target.value)}
              placeholder={folderName.trim() || 'Will default to folder name'}
            />
            <FormHelperText>
              You can customize this name (defaults to folder name)
            </FormHelperText>
          </FormControl>

          {/* Collection Type Selection */}
          <FormControl>
            <FormLabel>Collection Type</FormLabel>
            <SimpleGrid columns={3} spacing={3}>
              <Button
                variant={usePreset === 'bhajana' ? 'solid' : 'outline'}
                colorScheme={usePreset === 'bhajana' ? 'orange' : 'gray'}
                onClick={() => setUsePreset('bhajana')}
                h="auto"
                py={3}
                flexDirection="column"
              >
                <Text fontSize="2xl">🎵</Text>
                <Text fontSize="sm">Bhajana</Text>
              </Button>
              <Button
                variant={usePreset === 'anusthanam' ? 'solid' : 'outline'}
                colorScheme={usePreset === 'anusthanam' ? 'red' : 'gray'}
                onClick={() => setUsePreset('anusthanam')}
                h="auto"
                py={3}
                flexDirection="column"
              >
                <Text fontSize="2xl">🙏</Text>
                <Text fontSize="sm">Anusthanam</Text>
              </Button>
              <Button
                variant={usePreset === 'custom' ? 'solid' : 'outline'}
                colorScheme={usePreset === 'custom' ? 'purple' : 'gray'}
                onClick={() => setUsePreset('custom')}
                h="auto"
                py={3}
                flexDirection="column"
              >
                <Text fontSize="2xl">📁</Text>
                <Text fontSize="sm">Custom</Text>
              </Button>
            </SimpleGrid>
            <FormHelperText>
              {usePreset === 'custom'
                ? 'Create a custom collection with your own icon and color'
                : `Uses ${COLLECTION_CONFIGS[usePreset]?.name} settings`}
            </FormHelperText>
          </FormControl>

          {/* Custom Options - Icon and Color */}
          {usePreset === 'custom' && (
            <>
              {/* Icon Picker */}
              <FormControl>
                <FormLabel>Icon</FormLabel>
                <Wrap spacing={2}>
                  {CUSTOM_ICONS.map((icon) => (
                    <WrapItem key={icon}>
                      <Button
                        size="lg"
                        variant={selectedIcon === icon ? 'solid' : 'outline'}
                        colorScheme={selectedIcon === icon ? 'purple' : 'gray'}
                        onClick={() => setSelectedIcon(icon)}
                        fontSize="xl"
                        w="50px"
                        h="50px"
                      >
                        {icon}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>

              {/* Color Picker */}
              <FormControl>
                <FormLabel>Color</FormLabel>
                <HStack spacing={2}>
                  {CUSTOM_COLORS.map((colorOption) => (
                    <Button
                      key={colorOption.name}
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      bg={colorOption.color}
                      border={selectedColor.name === colorOption.name ? '3px solid' : '2px solid'}
                      borderColor={selectedColor.name === colorOption.name ? 'gray.800' : 'gray.300'}
                      _hover={{ transform: 'scale(1.1)' }}
                      onClick={() => setSelectedColor(colorOption)}
                      aria-label={colorOption.name}
                    />
                  ))}
                </HStack>
                <FormHelperText>{selectedColor.name}</FormHelperText>
              </FormControl>
            </>
          )}

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          <Button
            colorScheme="orange"
            w="full"
            size="lg"
            onClick={handleSearch}
            isLoading={searching}
            loadingText="Searching..."
            isDisabled={!folderName.trim()}
          >
            Find Folder & Add Collection
          </Button>
        </VStack>

        {/* Info Box */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Need Help?</AlertTitle>
            <AlertDescription>
              Make sure the folder exists in your Google Drive and you have given
              PatraPaha permission to access your Drive files.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  )
}
