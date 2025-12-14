import { Box, Flex, HStack, Text, IconButton, Button, Kbd, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon, SearchIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { TitleLanguage } from '../../types'

interface HeaderProps {
  onLogout: () => void
  onSearchOpen: () => void
  language: TitleLanguage
  onLanguageChange: (language: TitleLanguage) => void
}

export default function Header({ onLogout, onSearchOpen, language, onLanguageChange }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()

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
          <Text fontSize="xl" fontWeight="bold">
            🕉️ GAnAmruta Thuli
          </Text>
          <Text fontSize="sm" color={colorMode === 'dark' ? 'dark.textSecondary' : 'calm.textSecondary'} className="tamil-text">
            கானாம்ருத துளி
          </Text>
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
