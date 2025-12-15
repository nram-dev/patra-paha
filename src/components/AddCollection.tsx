import { useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { COLLECTION_CONFIGS } from '../config/collections'
import { useCollectionStore } from '../stores/collectionStore'
import { driveService } from '../services/driveService'
import { Collection, CollectionType } from '../types'

export const AddCollection = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { addCollection } = useCollectionStore()
  
  const [selectedType, setSelectedType] = useState<CollectionType>('bhajana')
  const [folderName, setFolderName] = useState('')
  const [customName, setCustomName] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = COLLECTION_CONFIGS[selectedType]

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

      // Create collection
      const collection: Collection = {
        id: `${selectedType}-${Date.now()}`,
        type: selectedType,
        name: customName.trim() || `My ${config.name}`,
        nameDevanagari: config.nameDevanagari,
        nameTamil: config.nameTamil,
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
        description: `${collection.name} has been added successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Navigate to the new collection
      navigate(`/collection/${collection.id}`)
    } catch (error) {
      console.error('Failed to add collection:', error)
      setError('Failed to add collection. Please try again.')
    } finally {
      setSearching(false)
    }
  }

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
          <FormControl>
            <FormLabel>Collection Type</FormLabel>
            <Select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value as CollectionType)}
            >
              <option value="bhajana">
                🎵 Bhajana PatraPaha (Devotional Songs)
              </option>
              <option value="anusthanam">
                🙏 Anusthanam PatraPaha (Spiritual Practices)
              </option>
            </Select>
            <FormHelperText>
              {config.features.join(', ')}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Google Drive Folder Name</FormLabel>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Namasankeerthanam, Anusthanam"
            />
            <FormHelperText>
              Enter the exact name of the folder in your Google Drive root directory
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Collection Name (Optional)</FormLabel>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={`My ${config.name}`}
            />
            <FormHelperText>
              Custom name for this collection (defaults to "My {config.name}")
            </FormHelperText>
          </FormControl>

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
