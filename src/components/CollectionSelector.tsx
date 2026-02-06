import {
  Box, Heading, Text, SimpleGrid, Card, CardBody, VStack, HStack, Icon, IconButton, Spinner, Tooltip, Button, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Popover, PopoverTrigger, PopoverContent, PopoverBody, Wrap, WrapItem, Flex, useToast, useBreakpointValue, Link, useColorMode
} from '@chakra-ui/react'
import { AddIcon, RepeatIcon, DeleteIcon, SettingsIcon, ChevronDownIcon, CheckIcon, EditIcon, InfoIcon, ExternalLinkIcon, LockIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
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
  const { colorMode, toggleColorMode } = useColorMode()
  const { collections, documentCounts, loadCollections, deleteCollection, updateCollection, scanErrors, setScanError, clearScanError, refreshDocumentCounts } = useCollectionStore()
  const [scanning, setScanning] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})

  // Responsive - use compact layout for mobile and tablet
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false
  const [showEmptyCollections, setShowEmptyCollections] = useState(() => {
    return localStorage.getItem('showEmptyCollections') === 'true'
  })

  // Edit modal state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState({ name: '', color: '', accent: '' })
  const [saving, setSaving] = useState(false)

  // About modal state
  const [showAboutModal, setShowAboutModal] = useState(false)

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
    <Box p={{ base: 4, md: 8 }} bg={colorMode === 'dark' ? 'dark.background' : 'calm.background'} minH="100vh">
      <VStack spacing={{ base: 4, md: 8 }} align="stretch" maxW="1200px" mx="auto">
        {/* Header - compact on mobile */}
        <Box textAlign="center" position="relative">
          {isMobile ? (
            /* Mobile/Tablet compact header */
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Text fontSize="2xl">📄</Text>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>PatraPaha</Heading>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>पत्रपहा</Text>
                </VStack>
              </HStack>
              <HStack spacing={1}>
                {/* About */}
                <IconButton
                  aria-label="About"
                  icon={<InfoIcon />}
                  onClick={() => setShowAboutModal(true)}
                  size="sm"
                  variant="ghost"
                />
                {/* Theme toggle */}
                <IconButton
                  aria-label="Toggle theme"
                  icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                  onClick={toggleColorMode}
                  size="sm"
                  variant="ghost"
                />
                {/* Settings Menu */}
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Settings"
                    icon={<SettingsIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem
                      onClick={toggleEmptyCollections}
                      icon={showEmptyCollections ? <CheckIcon /> : undefined}
                    >
                      View empty collections and categories
                    </MenuItem>
                  </MenuList>
                </Menu>
                {/* Sign Out */}
                <IconButton
                  aria-label="Sign Out"
                  icon={<LockIcon />}
                  onClick={onLogout}
                  size="sm"
                  variant="ghost"
                />
              </HStack>
            </HStack>
          ) : (
            /* Desktop header */
            <>
              <Box fontSize="5xl" mb={2}>📄</Box>
              <Heading size="2xl" mb={2} color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
                PatraPaha
              </Heading>
              <Text fontSize="xl" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'} mb={1}>
                पत्रपहा
              </Text>
              <Text fontSize="md" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                Integrated personal document viewer and media player.
              </Text>
              {/* Actions: About | Theme | Settings | Sign Out */}
              <HStack position="absolute" top={0} right={0} spacing={2}>
                {/* About */}
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<InfoIcon />}
                  onClick={() => setShowAboutModal(true)}
                >
                  About
                </Button>
                {/* Theme toggle */}
                <IconButton
                  aria-label="Toggle theme"
                  icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                  onClick={toggleColorMode}
                  size="sm"
                  variant="ghost"
                />
                {/* Settings Menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    variant="ghost"
                    leftIcon={<SettingsIcon />}
                    rightIcon={<ChevronDownIcon />}
                  >
                    Settings
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={toggleEmptyCollections}
                      icon={showEmptyCollections ? <CheckIcon /> : undefined}
                    >
                      View empty collections and categories
                    </MenuItem>
                  </MenuList>
                </Menu>
                {/* Sign Out */}
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<LockIcon />}
                  onClick={onLogout}
                >
                  Sign Out
                </Button>
              </HStack>
            </>
          )}
        </Box>

        {/* Collections Grid */}
        {collections.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
              Your Collections
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {visibleCollections.map(collection => (
                <Card
                  key={collection.id}
                  cursor="pointer"
                  onClick={() => navigate(`/collection/${collection.id}`)}
                  _hover={{
                    transform: isMobile ? 'none' : 'translateY(-4px)',
                    shadow: 'lg',
                    borderColor: collection.color
                  }}
                  transition="all 0.2s"
                  bg={`${collection.color}12`}
                  borderWidth={2}
                  borderColor={`${collection.color}40`}
                >
                  <CardBody py={{ base: 2, md: 4 }} px={{ base: 3, md: 4 }}>
                    {/* Mobile: Compact 2-line layout */}
                    {isMobile ? (
                      <VStack align="stretch" spacing={1}>
                        {/* Line 1: Icon, Name, Edit, Refresh, Delete */}
                        <HStack justify="space-between" align="center">
                          <HStack spacing={2} flex="1" minW="0">
                            <Text fontSize="xl">{collection.icon}</Text>
                            <Text fontWeight="semibold" color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'} noOfLines={1} flex="1">
                              {collection.name}
                            </Text>
                          </HStack>
                          <HStack spacing={0}>
                            <IconButton
                              aria-label="Edit"
                              icon={<EditIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={(e) => { e.stopPropagation(); handleEditOpen(collection) }}
                            />
                            <IconButton
                              aria-label="Refresh"
                              icon={scanning[collection.id] ? <Spinner size="xs" /> : <RepeatIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="orange"
                              onClick={(e) => { e.stopPropagation(); handleScanNow(collection.id) }}
                              isDisabled={!!scanning[collection.id]}
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={deleting[collection.id] ? <Spinner size="xs" /> : <DeleteIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => { e.stopPropagation(); handleDelete(collection.id, collection.name) }}
                              isDisabled={!!deleting[collection.id]}
                            />
                          </HStack>
                        </HStack>
                        {/* Line 2: Folder path (count) */}
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {collection.driveFolderPath || 'No folder'} ({documentCounts[collection.id] || 0})
                        </Text>
                        {/* Scan error */}
                        {scanErrors[collection.id] && (
                          <Text fontSize="xs" color="red.600" noOfLines={1}>
                            {scanErrors[collection.id]}
                          </Text>
                        )}
                      </VStack>
                    ) : (
                      /* Desktop: Original layout */
                      <VStack align="start" spacing={3}>
                        <Box fontSize="4xl">{collection.icon}</Box>
                        <Heading size="md" color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
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
                    )}
                  </CardBody>
                </Card>
              ))}

              {/* Add Collection Card */}
              <Card
                cursor="pointer"
                onClick={() => navigate('/add-collection')}
                borderStyle="dashed"
                borderWidth={2}
                borderColor={colorMode === 'dark' ? 'dark.border' : 'gray.300'}
                bg={colorMode === 'dark' ? 'dark.surface' : 'gray.50'}
                _hover={{
                  borderColor: colorMode === 'dark' ? 'dark.accent' : 'calm.accent',
                  bg: colorMode === 'dark' ? 'dark.panelSecondary' : 'gray.100'
                }}
                transition="all 0.2s"
              >
                <CardBody py={{ base: 2, md: 4 }} px={{ base: 3, md: 4 }}>
                  {isMobile ? (
                    <HStack justify="center" spacing={2}>
                      <Icon as={AddIcon} fontSize="md" color={colorMode === 'dark' ? 'dark.textSecondary' : 'gray.400'} />
                      <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'gray.600'} fontWeight="medium" fontSize="sm">
                        Add Collection
                      </Text>
                    </HStack>
                  ) : (
                    <VStack justify="center" h="full" spacing={3}>
                      <Icon as={AddIcon} fontSize="2xl" color={colorMode === 'dark' ? 'dark.textSecondary' : 'gray.400'} />
                      <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'gray.600'} fontWeight="medium">
                        Add Collection
                      </Text>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>
        )}

        {/* Empty State */}
        {collections.length === 0 && (
          <Box textAlign="center" py={12}>
            <Box fontSize="6xl" mb={4}>📚</Box>
            <Heading size="lg" mb={3} color={colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary'}>
              Welcome to PatraPaha!
            </Heading>
            <Text color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'} mb={6}>
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
          <Text fontSize="sm" color="gray.400" fontWeight="normal">
            Version 2.5.39 © 2026 Edge2.Cloud
          </Text>
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

      {/* About Modal */}
      <Modal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Text fontSize="2xl">📄</Text>
              <VStack align="start" spacing={0}>
                <Text>PatraPaha</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.500">पत्रपहा</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Description */}
              <Box>
                <Text fontWeight="semibold" mb={1}>About</Text>
                <Text fontSize="sm" color="gray.600">
                  PatraPaha is an integrated personal document viewer and media player.
                  It helps you organize and view your document collections from Google Drive
                  with support for PDFs, images, and audio files.
                  (Patra : Document in Tamil + PahA : Viewer in Marathi)
                </Text>
              </Box>

              {/* Version */}
              <Box>
                <Text fontWeight="semibold" mb={1}>Version</Text>
                <Text fontSize="sm" color="gray.600">2.5.28</Text>
              </Box>

              {/* Developer Info */}
              <Box>
                <Text fontWeight="semibold" mb={1}>Developed by</Text>
                <Text fontSize="sm" color="gray.600">
                  Edge2.Cloud
                </Text>
                <Text fontSize="sm" color="gray.500">
                  
                </Text>
              </Box>

              {/* Support */}
              <Box>
                <Text fontWeight="semibold" mb={1}>Support</Text>
                <Text fontSize="sm" color="gray.600">
                  For questions, issues, or feature requests, please contact:
                </Text>
                <Link
                  href="mailto:support@edge2.cloud"
                  color="blue.500"
                  fontSize="sm"
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                >
                  support@edge2.cloud <ExternalLinkIcon boxSize={3} />
                </Link>
              </Box>

              {/* Additional Info */}
              <Box>
                <Text fontWeight="semibold" mb={1}>Features</Text>
                <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                  <Text>• Google Drive integration for document storage</Text>
                  <Text>• Support for PDFs, images, and audio files</Text>
                  <Text>• Organize documents into custom collections</Text>
                  <Text>• Offline caching with IndexedDB</Text>
                  <Text>• Responsive design for desktop and mobile</Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setShowAboutModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
