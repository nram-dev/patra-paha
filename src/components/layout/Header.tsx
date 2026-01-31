import { Box, Flex, HStack, Text, IconButton, Button, Kbd, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon, SearchIcon, ChevronDownIcon, ArrowBackIcon, ViewIcon, CheckIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { TitleLanguage } from '../../types'

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
}

export default function Header({
  onLogout,
  onSearchOpen,
  language,
  onLanguageChange,
  collectionName,
  collectionIcon,
  showCategories = true,
  showItems = true,
  showEmptyCategories = false,
  onToggleCategories,
  onToggleItems,
  onToggleEmptyCategories,
}: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()

  const languageLabels: Record<TitleLanguage, string> = {
    english: 'English',
    tamil: 'தமிழ்',
    sanskrit: 'संस्कृत',
  }

  return (
    <Box
      bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
      borderBottom="1px"
      borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
      px={4}
      py={3}
      shadow="sm"
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={3}>
          {collectionName ? (
            <>
              <IconButton
                aria-label="Back to home"
                icon={<ArrowBackIcon />}
                size="sm"
                variant="ghost"
                onClick={() => navigate('/')}
              />
              <Text fontSize="xl" fontWeight="bold">
                {collectionIcon} {collectionName}
              </Text>
            </>
          ) : (
            <>
              <Text fontSize="xl" fontWeight="bold">
                📄 PatraPaha
              </Text>
              <Text fontSize="sm" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}>
                पत्रपहा
              </Text>
            </>
          )}
        </HStack>

        <HStack spacing={2}>
          <Button
            leftIcon={<SearchIcon />}
            onClick={onSearchOpen}
            size="sm"
            variant="ghost"
            rightIcon={
              <HStack spacing={0.5}>
                <Kbd fontSize="xs">Ctrl</Kbd>
                <Kbd fontSize="xs">K</Kbd>
              </HStack>
            }
          >
            Search
          </Button>
          {onToggleCategories && onToggleItems && onToggleEmptyCategories && (
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
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
            >
              {languageLabels[language]}
            </MenuButton>
            <MenuList
              bg={colorMode === 'dark' ? 'dark.surface' : 'calm.surface'}
              borderColor={colorMode === 'dark' ? 'dark.border' : 'calm.border'}
            >
              <MenuItem
                onClick={() => onLanguageChange('english')}
                bg={language === 'english' ? (colorMode === 'dark' ? 'dark.accent' : 'calm.accent') : 'transparent'}
                color={language === 'english' ? 'white' : undefined}
                _hover={{
                  bg: language === 'english' ? undefined : (colorMode === 'dark' ? 'dark.border' : 'calm.border'),
                }}
              >
                English
              </MenuItem>
              <MenuItem
                onClick={() => onLanguageChange('tamil')}
                bg={language === 'tamil' ? (colorMode === 'dark' ? 'dark.accent' : 'calm.accent') : 'transparent'}
                color={language === 'tamil' ? 'white' : undefined}
                _hover={{
                  bg: language === 'tamil' ? undefined : (colorMode === 'dark' ? 'dark.border' : 'calm.border'),
                }}
                className="tamil-text"
              >
                தமிழ் (Tamil)
              </MenuItem>
              <MenuItem
                onClick={() => onLanguageChange('sanskrit')}
                bg={language === 'sanskrit' ? (colorMode === 'dark' ? 'dark.accent' : 'calm.accent') : 'transparent'}
                color={language === 'sanskrit' ? 'white' : undefined}
                _hover={{
                  bg: language === 'sanskrit' ? undefined : (colorMode === 'dark' ? 'dark.border' : 'calm.border'),
                }}
              >
                संस्कृत (Sanskrit)
              </MenuItem>
            </MenuList>
          </Menu>
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          <Text
            as="button"
            onClick={onLogout}
            fontSize="sm"
            color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'}
            _hover={{ color: colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary' }}
          >
            Sign Out
          </Text>
        </HStack>
      </Flex>
    </Box>
  )
}
