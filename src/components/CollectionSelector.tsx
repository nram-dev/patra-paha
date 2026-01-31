import { Box, Heading, Text, SimpleGrid, Card, CardBody, VStack, HStack, Icon, IconButton, Spinner, Tooltip, Button } from '@chakra-ui/react'
import { AddIcon, RepeatIcon, DeleteIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCollectionStore } from '../stores/collectionStore'
import { scanCollection } from '../services/scanService'

export const CollectionSelector = () => {
  const navigate = useNavigate()
  const { collections, documentCounts, loadCollections, deleteCollection, scanErrors, setScanError, clearScanError, refreshDocumentCounts } = useCollectionStore()
  const [scanning, setScanning] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  const handleScanNow = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return
    setScanning(prev => ({ ...prev, [collectionId]: true }))
    clearScanError(collectionId)
    try {
      await scanCollection(collection)
      // refresh counts so tile updates immediately
      await refreshDocumentCounts()
    } catch (err) {
      setScanError(collectionId, err)
    } finally {
      setScanning(prev => ({ ...prev, [collectionId]: false }))
    }
  }

  const handleDelete = async (collectionId: string, collectionName: string) => {
    if (!window.confirm(`Delete "${collectionName}"? This will remove the collection from PatraPaha but won't affect your Google Drive files.`)) {
      return
    }
    setDeleting(prev => ({ ...prev, [collectionId]: true }))
    try {
      await deleteCollection(collectionId)
    } catch (err) {
      console.error('Failed to delete collection:', err)
    } finally {
      setDeleting(prev => ({ ...prev, [collectionId]: false }))
    }
  }

  return (
    <Box p={8} bg="calm.background" minH="100vh">
      <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
        {/* Header */}
        <Box textAlign="center">
          <Box fontSize="5xl" mb={2}>📄</Box>
          <Heading size="2xl" mb={2} color="calm.textPrimary">
            PatraPaha
          </Heading>
          <Text fontSize="xl" color="calm.textSecondary" mb={1}>
            पत्रपहा
          </Text>
          <Text fontSize="md" color="calm.textSecondary">
            View Your Documents
          </Text>
        </Box>

        {/* Collections Grid */}
        {collections.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color="calm.textPrimary">
              Your Collections
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {collections.map(collection => (
                <Card
                  key={collection.id}
                  cursor="pointer"
                  onClick={() => navigate(`/collection/${collection.id}`)}
                  _hover={{ 
                    transform: 'translateY(-4px)', 
                    shadow: 'lg',
                    borderColor: collection.color
                  }}
                  transition="all 0.2s"
                  bg="white"
                  borderWidth={2}
                  borderColor="gray.200"
                >
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Box fontSize="4xl">{collection.icon}</Box>
                      <Heading size="md" color="calm.textPrimary">
                        {collection.name}
                      </Heading>
                      {(collection.nameDevanagari || collection.nameTamil) && (
                        <Text fontSize="sm" color="gray.600">
                          {collection.nameDevanagari || collection.nameTamil}
                        </Text>
                      )}
                      {/* Drive folder path for troubleshooting */}
                      {collection.driveFolderPath && (
                        <Text fontSize="xs" color="gray.500">
                          {collection.driveFolderPath}
                        </Text>
                      )}
                      <HStack spacing={2} justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.500">
                          <Text as="span" fontWeight="medium">{documentCounts[collection.id] || 0}</Text> documents
                        </Text>
                        <HStack spacing={1}>
                          <Tooltip label="Scan for changes" hasArrow>
                            <IconButton
                              aria-label="Scan collection"
                              icon={scanning[collection.id] ? <Spinner size="xs" /> : <RepeatIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="orange"
                              onClick={(e) => { e.stopPropagation(); handleScanNow(collection.id) }}
                              isDisabled={!!scanning[collection.id]}
                            />
                          </Tooltip>
                          <Tooltip label="Delete collection" hasArrow>
                            <IconButton
                              aria-label="Delete collection"
                              icon={deleting[collection.id] ? <Spinner size="xs" /> : <DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => { e.stopPropagation(); handleDelete(collection.id, collection.name) }}
                              isDisabled={!!deleting[collection.id]}
                            />
                          </Tooltip>
                        </HStack>
                      </HStack>
                      {/* Scan error, if any */}
                      {scanErrors[collection.id] && (
                        <Text fontSize="xs" color="red.600">
                          {scanErrors[collection.id]}
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}

              {/* Add Collection Card */}
              <Card
                cursor="pointer"
                onClick={() => navigate('/add-collection')}
                borderStyle="dashed"
                borderWidth={2}
                borderColor="gray.300"
                bg="gray.50"
                _hover={{ 
                  borderColor: 'calm.accent',
                  bg: 'gray.100'
                }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack justify="center" h="full" spacing={3}>
                    <Icon as={AddIcon} fontSize="2xl" color="gray.400" />
                    <Text color="gray.600" fontWeight="medium">
                      Add Collection
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>
        )}

        {/* Empty State */}
        {collections.length === 0 && (
          <Box textAlign="center" py={12}>
            <Box fontSize="6xl" mb={4}>📚</Box>
            <Heading size="lg" mb={3} color="calm.textPrimary">
              Welcome to PatraPaha!
            </Heading>
            <Text color="calm.textSecondary" mb={6}>
              Get started by adding your first collection
            </Text>
            <Button
              colorScheme="orange"
              size="lg"
              leftIcon={<AddIcon />}
              onClick={() => navigate('/add-collection')}
            >
              Add Collection
            </Button>
          </Box>
        )}

        {/* Footer Note */}
        <Box textAlign="center" pt={8} pb={4}>

        </Box>
      </VStack>
    </Box>
  )
}
