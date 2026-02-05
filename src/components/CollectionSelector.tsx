import {
  Box, Heading, Text, SimpleGrid, Card, CardBody, VStack, HStack, Icon, IconButton, Spinner, Tooltip, Button, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Popover, PopoverTrigger, PopoverContent, PopoverBody, Wrap, WrapItem, Flex, useToast
} from '@chakra-ui/react'
import { AddIcon, RepeatIcon, DeleteIcon, ViewIcon, ChevronDownIcon, CheckIcon, EditIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCollectionStore } from '../stores/collectionStore'
import { scanCollection } from '../services/scanService'
import { CUSTOM_COLORS, CUSTOM_ICONS } from '../config/collections'
import { Collection } from '../types'

type CollectionSelectorProps = {
  onLogout: () => void
}

export const CollectionSelector = ({ onLogout }: CollectionSelectorProps) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { collections, documentCounts, loadCollections, deleteCollection, updateCollection, scanErrors, setScanError, clearScanError, refreshDocumentCounts } = useCollectionStore()
  const [scanning, setScanning] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})
  const [showEmptyCollections, setShowEmptyCollections] = useState(() => {
    return localStorage.getItem('showEmptyCollections') === 'true'
  })

  // Edit modal state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState({ name: '', color: '', accent: '' })
  const [saving, setSaving] = useState(false)

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

  const toggleEmptyCollections = () => {
    const newState = !showEmptyCollections
    setShowEmptyCollections(newState)
    localStorage.setItem('showEmptyCollections', String(newState))
  }

  const handleEditOpen = (collection: Collection) => {
    setEditingCollection(collection)
    setEditName(collection.name)
    setEditIcon(collection.icon)
    // Find the matching color from CUSTOM_COLORS or create a custom entry
    const matchingColor = CUSTOM_COLORS.find(c => c.color === collection.color)
    setEditColor(matchingColor || { name: 'Custom', color: collection.color, accent: collection.accentColor || collection.color })
  }

  const handleEditClose = () => {
    setEditingCollection(null)
    setEditName('')
    setEditIcon('')
    setEditColor({ name: '', color: '', accent: '' })
  }

  const handleEditSave = async () => {
    if (!editingCollection) return
    setSaving(true)
    try {
      await updateCollection(editingCollection.id, {
        name: editName.trim() || editingCollection.name,
        icon: editIcon,
        color: editColor.color,
        accentColor: editColor.accent,
      })
      toast({
        title: 'Collection updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      handleEditClose()
    } catch (err) {
      console.error('Failed to update collection:', err)
      toast({
        title: 'Failed to update',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  // Filter collections based on showEmptyCollections setting
  const visibleCollections = showEmptyCollections
    ? collections
    : collections.filter(c => (documentCounts[c.id] || 0) > 0)

  return (
    <Box p={8} bg="calm.background" minH="100vh">
      <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
        {/* Header */}
        <Box textAlign="center" position="relative">
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
          {/* Actions (Sign Out + View Menu) */}
          <HStack position="absolute" top={0} right={0} spacing={2}>
            <Text
              as="button"
              onClick={onLogout}
              fontSize="sm"
              color="calm.textSecondary"
              _hover={{ color: 'calm.textPrimary' }}
            >
              Sign Out
            </Text>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="ghost"
                leftIcon={<ViewIcon />}
                rightIcon={<ChevronDownIcon />}
              >
                View
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={toggleEmptyCollections}
                  icon={showEmptyCollections ? <CheckIcon /> : undefined}
                >
                  <HStack justify="space-between" w="full">
                    <Text>Empty Collections</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        {/* Collections Grid */}
        {collections.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color="calm.textPrimary">
              Your Collections
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {visibleCollections.map(collection => (
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
                  bg={`${collection.color}12`}
                  borderWidth={2}
                  borderColor={`${collection.color}40`}
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
                          <Tooltip label="Edit collection" hasArrow>
                            <IconButton
                              aria-label="Edit collection"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={(e) => { e.stopPropagation(); handleEditOpen(collection) }}
                            />
                          </Tooltip>
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

      {/* Edit Collection Modal */}
      <Modal isOpen={!!editingCollection} onClose={handleEditClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Collection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {/* Collection Name */}
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Collection name"
                />
              </FormControl>

              {/* Icon and Color */}
              <FormControl>
                <FormLabel>Icon & Color</FormLabel>
                <Flex gap={2} align="center">
                  {/* Icon Picker */}
                  <Popover placement="bottom-start">
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        fontSize="xl"
                        w="60px"
                        h="40px"
                        p={0}
                      >
                        {editIcon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent w="auto">
                      <PopoverBody>
                        <Wrap spacing={1} maxW="200px">
                          {CUSTOM_ICONS.map((icon) => (
                            <WrapItem key={icon}>
                              <Button
                                size="sm"
                                variant={editIcon === icon ? 'solid' : 'ghost'}
                                colorScheme={editIcon === icon ? 'purple' : 'gray'}
                                onClick={() => setEditIcon(icon)}
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

                  {/* Color Picker */}
                  <Popover placement="bottom-start">
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        w="60px"
                        h="40px"
                        p={0}
                      >
                        <Box
                          w="24px"
                          h="24px"
                          borderRadius="full"
                          bg={editColor.color}
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
                                onClick={() => setEditColor(colorOption)}
                                w="36px"
                                h="36px"
                                p={0}
                                border={editColor.name === colorOption.name ? '2px solid' : 'none'}
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

              {/* Folder path (read-only info) */}
              {editingCollection?.driveFolderPath && (
                <FormControl>
                  <FormLabel color="gray.500" fontSize="sm">Drive Folder (read-only)</FormLabel>
                  <Text fontSize="sm" color="gray.600">{editingCollection.driveFolderPath}</Text>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleEditSave}
              isLoading={saving}
              isDisabled={!editName.trim()}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
