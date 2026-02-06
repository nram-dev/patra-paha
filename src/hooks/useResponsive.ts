import { useBreakpointValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export const useResponsive = () => {
  // Mobile: < 768px (base, sm)
  // Tablet: 768px - 991px (md)
  // Desktop: >= 992px (lg, xl, 2xl)
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false
  const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false

  const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  // Orientation detection
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth
  })

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    // Check on resize (covers orientation change)
    window.addEventListener('resize', checkOrientation)

    // Also listen to orientation change event for mobile devices
    window.addEventListener('orientationchange', () => {
      // Small delay to let the browser update dimensions
      setTimeout(checkOrientation, 100)
    })

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return { isMobile, isTablet, isDesktop, deviceType, isPortrait }
}
