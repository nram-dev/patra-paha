import { Box, Flex, HStack, Text, IconButton, Button, Menu, MenuButton, MenuList, MenuItem, Tooltip, useBreakpointValue } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon, SearchIcon, ChevronDownIcon, ArrowBackIcon, StarIcon, HamburgerIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { TitleLanguage, Deity } from '../../types'

// Layout mode type
export type LayoutMode = 'auto' | 'tablet' | 'desktop'

// Custom icons for layout modes
const TabletIcon = () => (
  <Box as="svg" viewBox="0 0 24 24" w="16px" h="16px" fill="currentColor">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </Box>
)

const DesktopIcon = () => (
  <Box as="svg" viewBox="0 0 24 24" w="16px" h="16px" fill="currentColor">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
  </Box>
)

interface HeaderProps {
  onLogout: () => void
  onSearchOpen: () => void
  language: TitleLanguage
  onLanguageChange: (language: TitleLanguage) => void
  collectionName?: string
  collectionIcon?: string
  showingFavorites?: boolean
  onFavoritesSelect?: () => void
  // Responsive props
  categories?: Deity[]
  selectedCategory?: Deity | null
  onCategorySelect?: (category: Deity) => void
  onMobileMenuOpen?: () => void
  // Layout mode override
  layoutMode?: LayoutMode
  onLayoutModeChange?: (mode: LayoutMode) => void
}

export default function Header({
  onLogout,
  onSearchOpen,
  language: _language,
  onLanguageChange: _onLanguageChange,
  collectionName,
  collectionIcon,
  showingFavorites = false,
  onFavoritesSelect,
  categories,
  selectedCategory,
  onCategorySelect,
  onMobileMenuOpen,
  layoutMode = 'auto',
  onLayoutModeChange,
}: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()

  // Responsive breakpoints - auto detection
  const autoIsMobile = useBreakpointValue({ base: true, md: false }) ?? true
  const autoIsTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false
  const autoIsDesktop = useBreakpointValue({ base: false, lg: true }) ?? false

  // Apply layout mode override
  const isMobile = autoIsMobile
  const isTablet = layoutMode === 'tablet' ? true : layoutMode === 'desktop' ? false : autoIsTablet
  const isDesktop = layoutMode === 'desktop' ? true : layoutMode === 'tablet' ? false : autoIsDesktop

  // Show layout toggle when not in mobile mode (auto-detected)
  const showLayoutToggle = !autoIsMobile && onLayoutModeChange && collectionName

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

          {/* Layout mode toggle - tablet/desktop icons */}
          {showLayoutToggle && (
            <HStack spacing={0}>
              <Tooltip label="Tablet layout" hasArrow>
                <IconButton
                  aria-label="Tablet layout"
                  icon={<TabletIcon />}
                  size="sm"
                  variant={isTablet ? 'solid' : 'ghost'}
                  colorScheme={isTablet ? 'blue' : undefined}
                  onClick={() => onLayoutModeChange?.('tablet')}
                />
              </Tooltip>
              <Tooltip label="Desktop layout" hasArrow>
                <IconButton
                  aria-label="Desktop layout"
                  icon={<DesktopIcon />}
                  size="sm"
                  variant={isDesktop ? 'solid' : 'ghost'}
                  colorScheme={isDesktop ? 'blue' : undefined}
                  onClick={() => onLayoutModeChange?.('desktop')}
                />
              </Tooltip>
            </HStack>
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
