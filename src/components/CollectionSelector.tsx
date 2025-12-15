import { Box, Heading, Text, SimpleGrid, Card, CardBody, VStack, HStack, Icon, Button } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useCollectionStore } from '../stores/collectionStore'

export const CollectionSelector = () => {
  const navigate = useNavigate()
  const { collections, documentCounts, loadCollections } = useCollectionStore()

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

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
            View Your Spiritual Documents
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
                      <HStack spacing={2}>
                        <Text fontSize="sm" color="gray.500" fontWeight="medium">
                          {documentCounts[collection.id] || 0}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          documents
                        </Text>
                      </HStack>
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
          <Text fontSize="sm" color="gray.500">
            Previously <strong>GAnAmruta Thuli</strong> • Now expanded for all spiritual documents
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
