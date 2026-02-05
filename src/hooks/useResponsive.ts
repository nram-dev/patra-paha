import { useBreakpointValue } from '@chakra-ui/react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export const useResponsive = () => {
  // Mobile: < 768px (base, sm)
  // Tablet: 768px - 991px (md)
  // Desktop: >= 992px (lg, xl, 2xl)
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false
  const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false

  const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  return { isMobile, isTablet, isDesktop, deviceType }
}
