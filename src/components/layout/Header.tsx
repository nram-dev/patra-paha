import { Box, Flex, HStack, Text, IconButton, Button, Kbd, Menu, MenuButton, MenuList, MenuItem, Tooltip, useBreakpointValue } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon, SearchIcon, ChevronDownIcon, ArrowBackIcon, ViewIcon, CheckIcon, StarIcon, HamburgerIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { TitleLanguage, Deity } from '../../types'

interface HeaderProps {
  onLogout: () => void
  onSearchOpen: () => void
  language: TitleLanguage
  onLanguageChange: (language: TitleLanguage) => void
  collectionName?: string
  collectionIcon?: string
  showCategories?: boolean
  showItems?: boolean
  showEmptyCategories?: boolean
  onToggleCategories?: () => void
  onToggleItems?: () => void
  onToggleEmptyCategories?: () => void
  showingFavorites?: boolean
  onFavoritesSelect?: () => void
  // Responsive props
  categories?: Deity[]
  selectedCategory?: Deity | null
  onCategorySelect?: (category: Deity) => void
  onMobileMenuOpen?: () => void
}

export default function Header({
  onLogout,
  onSearchOpen,
  language: _language,
  onLanguageChange: _onLanguageChange,
  collectionName,
  collectionIcon,
  showCategories = true,
  showItems = true,
  showEmptyCategories = false,
  onToggleCategories,
  onToggleItems,
  onToggleEmptyCategories,
  showingFavorites = false,
  onFavoritesSelect,
  categories,
  selectedCategory,
  onCategorySelect,
  onMobileMenuOpen,
}: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false
  const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false

  return (
    <Box
      bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
      borderBottom="1px"
      borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
      px={{ base: 2, md: 4 }}
      py={{ base: 2, md: 3 }}
      shadow="sm"
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={{ base: 1, md: 2 }}>
          {/* Mobile hamburger menu */}
          {isMobile && onMobileMenuOpen && (
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              size="sm"
              variant="ghost"
              onClick={onMobileMenuOpen}
            />
          )}

          {collectionName ? (
            <>
              {/* Back button */}
              <IconButton
                aria-label="Back to home"
                icon={<ArrowBackIcon />}
                size="sm"
                variant="ghost"
                onClick={() => navigate('/')}
              />

              {/* Favorites button */}
              {onFavoritesSelect && (
                <Tooltip label="Favorites" hasArrow>
                  <IconButton
                    aria-label="Favorites"
                    icon={<StarIcon />}
                    size="sm"
                    variant={showingFavorites ? 'solid' : 'ghost'}
                    colorScheme={showingFavorites ? 'yellow' : undefined}
                    color={showingFavorites ? 'yellow.500' : (colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary')}
                    onClick={onFavoritesSelect}
                    _hover={{
                      color: 'yellow.500',
                    }}
                  />
                </Tooltip>
              )}

              {/* Category dropdown for tablet - positioned before collection name */}
              {isTablet && categories && onCategorySelect && (
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronDownIcon />}
                    maxW="180px"
                  >
                    <Text noOfLines={1} fontSize="sm">
                      {selectedCategory?.name || 'Select Category'}
                    </Text>
                  </MenuButton>
                  <MenuList
                    bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
                    borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
                    maxH="300px"
                    overflowY="auto"
                  >
                    {categories.map(cat => (
                      <MenuItem
                        key={cat.id}
                        onClick={() => onCategorySelect(cat)}
                        bg={selectedCategory?.id === cat.id ? (colorMode === 'dark' ? 'dark.accent' : 'calm.accent') : 'transparent'}
                        color={selectedCategory?.id === cat.id ? 'white' : undefined}
                        _hover={{
                          bg: selectedCategory?.id === cat.id ? undefined : (colorMode === 'dark' ? 'dark.border' : 'calm.border'),
                        }}
                      >
                        {cat.name} ({cat.songCount})
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              )}

              {/* Collection icon and name */}
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" noOfLines={1}>
                {collectionIcon} {!isMobile && collectionName}
              </Text>
            </>
          ) : (
            <>
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
                📄 PatraPaha
              </Text>
              {!isMobile && (
                <Text fontSize="sm" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                  पत्रपहा
                </Text>
              )}
            </>
          )}
        </HStack>

        <HStack spacing={{ base: 1, md: 2 }}>
          {/* Search button - icon only in all layouts */}
          <IconButton
            aria-label="Search"
            icon={<SearchIcon />}
            onClick={onSearchOpen}
            size="sm"
            variant="ghost"
          />

          {/* View menu - desktop only */}
          {isDesktop && onToggleCategories && onToggleItems && onToggleEmptyCategories && (
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
              <MenuList
                bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
                borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
              >
                <MenuItem
                  onClick={onToggleCategories}
                  icon={showCategories ? <CheckIcon /> : undefined}
                  _hover={{
                    bg: colorMode === 'dark' ? 'dark.border' : 'calm.border',
                  }}
                >
                  <HStack justify="space-between" w="full">
                    <Text>Categories</Text>
                    <HStack spacing={0.5}>
                      <Kbd fontSize="xs">Alt</Kbd>
                      <Kbd fontSize="xs">1</Kbd>
                    </HStack>
                  </HStack>
                </MenuItem>
                <MenuItem
                  onClick={onToggleItems}
                  icon={showItems ? <CheckIcon /> : undefined}
                  _hover={{
                    bg: colorMode === 'dark' ? 'dark.border' : 'calm.border',
                  }}
                >
                  <HStack justify="space-between" w="full">
                    <Text>Items</Text>
                    <HStack spacing={0.5}>
                      <Kbd fontSize="xs">Alt</Kbd>
                      <Kbd fontSize="xs">2</Kbd>
                    </HStack>
                  </HStack>
                </MenuItem>
                <MenuItem
                  onClick={onToggleEmptyCategories}
                  icon={showEmptyCategories ? <CheckIcon /> : undefined}
                  _hover={{
                    bg: colorMode === 'dark' ? 'dark.border' : 'calm.border',
                  }}
                >
                  <HStack justify="space-between" w="full">
                    <Text>Empty Categories</Text>
                    <HStack spacing={0.5}>
                      <Kbd fontSize="xs">Alt</Kbd>
                      <Kbd fontSize="xs">3</Kbd>
                    </HStack>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          {/* Theme toggle */}
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />

          {/* Sign out - icon on tablet, text on desktop, hidden on mobile */}
          {isDesktop ? (
            <Text
              as="button"
              onClick={onLogout}
              fontSize="sm"
              color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
              _hover={{ color: colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary' }}
            >
              Sign Out
            </Text>
          ) : isTablet ? (
            <Tooltip label="Sign Out" hasArrow>
              <IconButton
                aria-label="Sign out"
                icon={<ExternalLinkIcon />}
                onClick={onLogout}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
          ) : null}
        </HStack>
      </Flex>
    </Box>
  )
}
