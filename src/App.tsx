import { Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { useGoogleLogin } from '@react-oauth/google'
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { driveService } from './services/driveService'
import { migrateToMultiCollection } from './utils/migration'
import { CollectionSelector } from './components/CollectionSelector'
import { AddCollection } from './components/AddCollection'
import { CollectionView } from './components/CollectionView'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMigrating, setIsMigrating] = useState(true)
  const [migrationError, setMigrationError] = useState<string | null>(null)

  // Run migration on mount
  useEffect(() => {
    const runMigration = async () => {
      try {
        setIsMigrating(true)
        const success = await migrateToMultiCollection()
        if (!success) {
          setMigrationError('Migration failed. Please refresh the page.')
        }
      } catch (error) {
        console.error('Migration error:', error)
        setMigrationError('Migration failed. Please refresh the page.')
      } finally {
        setIsMigrating(false)
      }
    }
    runMigration()
  }, [])

  // Check for stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('google_access_token')
    if (token) {
      driveService.setAccessToken(token)
      setIsAuthenticated(true)
    }
  }, [])

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token
      localStorage.setItem('google_access_token', accessToken)
      driveService.setAccessToken(accessToken)
      setIsAuthenticated(true)
    },
    onError: () => {
      console.error('Login failed')
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly',
  })

  const handleLogout = () => {
    localStorage.removeItem('google_access_token')
    driveService.clearAccessToken()
    setIsAuthenticated(false)
  }

  // Show migration screen
  if (isMigrating) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="calm.background"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="calm.accent" thickness="4px" />
          <Text fontSize="lg" color="calm.textPrimary">
            Initializing PatraPaha...
          </Text>
        </VStack>
      </Box>
    )
  }

  // Show migration error
  if (migrationError) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="calm.background"
      >
        <VStack spacing={4} textAlign="center" p={8}>
          <Text fontSize="2xl" color="red.500">⚠️</Text>
          <Text fontSize="lg" color="calm.textPrimary" fontWeight="bold">
            Initialization Error
          </Text>
          <Text color="calm.textSecondary">
            {migrationError}
          </Text>
        </VStack>
      </Box>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="calm.background"
      >
        <Box textAlign="center" p={8}>
          <Box fontSize="5xl" mb={4}>📄</Box>
          <Box fontSize="2xl" fontWeight="bold" mb={2} color="calm.textPrimary">
            PatraPaha
          </Box>
          <Box fontSize="lg" color="calm.textSecondary" mb={2}>
            पत्रपहा
          </Box>
          <Box fontSize="sm" color="calm.textSecondary" mb={6}>
            View Your Documents
          </Box>
          <Box
            as="button"
            onClick={() => login()}
            bg="calm.accent"
            color="white"
            px={6}
            py={3}
            borderRadius="md"
            fontWeight="semibold"
            _hover={{ bg: 'calm.accent', opacity: 0.9 }}
          >
            Sign in with Google
          </Box>

        </Box>
      </Box>
    )
  }

  // Main app with routing
  return (
    <Routes>
      <Route path="/" element={<CollectionSelector />} />
      <Route path="/add-collection" element={<AddCollection />} />
      <Route 
        path="/collection/:collectionId" 
        element={<CollectionView onLogout={handleLogout} />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
