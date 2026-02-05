import { useState, useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Wrap,
  WrapItem,
  Flex,
} from '@chakra-ui/react'
import { ArrowBackIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { COLLECTION_CONFIGS, CUSTOM_COLORS, CUSTOM_ICONS, DEFAULT_CUSTOM_CONFIG, PREDEFINED_PRESETS, PredefinedPreset } from '../config/collections'
import { useCollectionStore } from '../stores/collectionStore'
import { driveService } from '../services/driveService'
import { scanCollection } from '../services/scanService'
import { Collection, CollectionType } from '../types'

export const AddCollection = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { addCollection, collections } = useCollectionStore()

  const [selectedPreset, setSelectedPreset] = useState<PredefinedPreset | null>(null)
  const [folderName, setFolderName] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(CUSTOM_ICONS[0])
  const [selectedColor, setSelectedColor] = useState(CUSTOM_COLORS[0])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if user has manually edited fields
  const userEditedName = useRef(false)
  const userEditedFolder = useRef(false)
  const userEditedIcon = useRef(false)
  const userEditedColor = useRef(false)

  // When preset changes, auto-populate fields (unless user manually edited them)
  useEffect(() => {
    if (selectedPreset) {
      if (!userEditedFolder.current) {
        setFolderName(selectedPreset.defaultFolderName)
      }
      if (!userEditedIcon.current) {
        setSelectedIcon(selectedPreset.icon)
      }
      if (!userEditedColor.current) {
        const presetColor = CUSTOM_COLORS.find(c => c.name === selectedPreset.color.name)
        if (presetColor) {
          setSelectedColor(presetColor)
        }
      }
    }
  }, [selectedPreset])

  // Auto-fill collection name when folder name changes (only if user hasn't manually edited)
  useEffect(() => {
    if (folderName.trim() && !userEditedName.current) {
      setCollectionName(folderName.trim())
    }
  }, [folderName])

  const handlePresetSelect = (preset: PredefinedPreset | null) => {
    // Reset user edit flags when changing preset
    userEditedFolder.current = false
    userEditedIcon.current = false
    userEditedColor.current = false
    userEditedName.current = false

    setSelectedPreset(preset)

    if (!preset) {
      // Reset to defaults for custom
      setFolderName('')
      setCollectionName('')
      setSelectedIcon(CUSTOM_ICONS[0])
      setSelectedColor(CUSTOM_COLORS[0])
    }
  }

  const handleFolderNameChange = (value: string) => {
    userEditedFolder.current = true
    setFolderName(value)
  }

  const handleCollectionNameChange = (value: string) => {
    userEditedName.current = true
    setCollectionName(value)
  }

  const handleIconSelect = (icon: string) => {
    userEditedIcon.current = true
    setSelectedIcon(icon)
  }

  const handleColorSelect = (color: typeof CUSTOM_COLORS[0]) => {
    userEditedColor.current = true
    setSelectedColor(color)
  }

  const getConfig = () => {
    if (selectedPreset) {
      const configKey = selectedPreset.configKey as keyof typeof COLLECTION_CONFIGS
      return {
        ...COLLECTION_CONFIGS[configKey],
        icon: selectedIcon,
        color: selectedColor.color,
        accentColor: selectedColor.accent,
      }
    }
    return {
      ...DEFAULT_CUSTOM_CONFIG,
      icon: selectedIcon,
      color: selectedColor.color,
      accentColor: selectedColor.accent,
    }
  }

  const handleSearch = async () => {
    if (!folderName.trim()) {
      setError('Please enter a folder name')
      return
    }

    setSearching(true)
    setError(null)

    try {
      let folder = null
      try {
        folder = await driveService.findFolderByName(folderName.trim())
      } catch (findError) {
        console.error('Error finding folder:', findError)
        setError(`Folder "${folderName}" not found or not accessible in Google Drive`)
        setSearching(false)
        return
      }

      if (!folder || !folder.id) {
        setError(`Folder "${folderName}" not found or not accessible in Google Drive`)
        setSearching(false)
        return
      }

      // Check if this folder is already added as a collection
      const existingCollection = collections.find(c => c.driveFolderId === folder.id)
      if (existingCollection) {
        setSearching(false)
        toast({
          title: 'Collection already added',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      // Check if folder has any content (files or subfolders)
      try {
        const files = await driveService.listFiles(folder.id)
        const subfolders = await driveService.listFolders(folder.id)
        if (files.length === 0 && subfolders.length === 0) {
          setError(`Folder "${folderName}" appears to be empty or not accessible`)
          setSearching(false)
          return
        }
      } catch (contentError) {
        console.error('Error checking folder contents:', contentError)
        setError(`Folder "${folderName}" not accessible - please check permissions`)
        setSearching(false)
        return
      }

      const config = getConfig()
      const collectionType = selectedPreset ? selectedPreset.configKey : 'custom'

      // Create collection
      const collection: Collection = {
        id: `${collectionType}-${Date.now()}`,
        type: collectionType as CollectionType,
        name: collectionName.trim() || folderName.trim(),
        nameDevanagari: selectedPreset && config.nameDevanagari ? config.nameDevanagari : undefined,
        nameTamil: selectedPreset && config.nameTamil ? config.nameTamil : undefined,
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
          <Heading size="lg" mb={2} color="gray.800">Add New Collection</Heading>
          <Text color="gray.600">
            Connect a Google Drive folder to create a new collection
          </Text>
        </Box>

        {/* Form */}
        <VStack spacing={5} w="full" bg="white" p={6} borderRadius="md" shadow="sm">
          {/* Predefined Type Selection - At Top */}
          <FormControl>
            <FormLabel color="gray.700">Predefined</FormLabel>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                w="full"
                textAlign="left"
                variant="outline"
                fontWeight="normal"
              >
                {selectedPreset ? (
                  <HStack>
                    <Text fontSize="lg">{selectedPreset.icon}</Text>
                    <Box
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      bg={selectedPreset.color.color}
                    />
                    <Text>{selectedPreset.name}</Text>
                  </HStack>
                ) : (
                  <Text color="gray.500">Select a preset (optional)</Text>
                )}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handlePresetSelect(null)}>
                  <HStack>
                    <Text fontSize="lg">📁</Text>
                    <Text color="gray.500">None (Custom)</Text>
                  </HStack>
                </MenuItem>
                {PREDEFINED_PRESETS.map((preset) => (
                  <MenuItem
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <HStack>
                      <Text fontSize="lg">{preset.icon}</Text>
                      <Box
                        w="16px"
                        h="16px"
                        borderRadius="full"
                        bg={preset.color.color}
                      />
                      <Text>{preset.name}</Text>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>

          {/* Google Drive Folder Name with Icon and Color */}
          <FormControl isRequired>
            <FormLabel color="gray.700">Google Drive Folder Name</FormLabel>
            <Flex gap={2} align="center">
              <Input
                flex={1}
                value={folderName}
                onChange={(e) => handleFolderNameChange(e.target.value)}
                placeholder="e.g., MyRecipes, StudyNotes, Bhajans"
                color="gray.800"
                _placeholder={{ color: 'gray.400' }}
              />

              {/* Icon Dropdown */}
              <Popover placement="bottom-end">
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    fontSize="xl"
                    w="50px"
                    h="40px"
                    p={0}
                  >
                    {selectedIcon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent w="auto">
                  <PopoverBody>
                    <Wrap spacing={1} maxW="200px">
                      {CUSTOM_ICONS.map((icon) => (
                        <WrapItem key={icon}>
                          <Button
                            size="sm"
                            variant={selectedIcon === icon ? 'solid' : 'ghost'}
                            colorScheme={selectedIcon === icon ? 'purple' : 'gray'}
                            onClick={() => handleIconSelect(icon)}
                            fontSize="lg"
                            w="36px"
                            h="36px"
                            p={0}
                          >
                            {icon}
                          </Button>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              {/* Color Dropdown */}
              <Popover placement="bottom-end">
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    w="50px"
                    h="40px"
                    p={0}
                  >
                    <Box
                      w="24px"
                      h="24px"
                      borderRadius="full"
                      bg={selectedColor.color}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent w="auto">
                  <PopoverBody>
                    <Wrap spacing={1} maxW="180px">
                      {CUSTOM_COLORS.map((colorOption) => (
                        <WrapItem key={colorOption.name}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleColorSelect(colorOption)}
                            w="36px"
                            h="36px"
                            p={0}
                            border={selectedColor.name === colorOption.name ? '2px solid' : 'none'}
                            borderColor="gray.800"
                          >
                            <Box
                              w="24px"
                              h="24px"
                              borderRadius="full"
                              bg={colorOption.color}
                            />
                          </Button>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>
          </FormControl>

          {/* Collection Name */}
          <FormControl>
            <FormLabel color="gray.700">Collection Name</FormLabel>
            <Input
              value={collectionName}
              onChange={(e) => handleCollectionNameChange(e.target.value)}
              placeholder={folderName.trim() || 'Same as folder name'}
              color="gray.800"
              _placeholder={{ color: 'gray.400' }}
            />
          </FormControl>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle color="red.800">Error</AlertTitle>
                <AlertDescription color="red.700">{error}</AlertDescription>
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
            <AlertTitle color="blue.800">Need Help?</AlertTitle>
            <AlertDescription color="blue.700">
              Make sure the folder exists in your Google Drive and you have given
              PatraPaha permission to access your Drive files.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  )
}
