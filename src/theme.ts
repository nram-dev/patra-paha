import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  breakpoints: {
    base: '0em',
    sm: '30em',    // 480px - mobile landscape
    md: '48em',    // 768px - tablet
    lg: '62em',    // 992px - small desktop
    xl: '80em',    // 1280px - desktop
    '2xl': '96em', // 1536px - large desktop
  },
  colors: {
    calm: {
      background: '#FFFFFF',
      surface: '#FFFFFF',
      panelPrimary: '#E0E0E0',
      panelSecondary: '#EAEAEA',
      textPrimary: '#2C1810',
      textSecondary: '#6B5D52',
      accent: '#FF9933',
      border: '#D0D0D0',
      highlight: '#FFF9C4',
    },
    dark: {
      background: '#2D2D2D',
      surface: '#2D2D2D',
      panelPrimary: '#1A1A1A',
      panelSecondary: '#222222',
      textPrimary: '#F5F5F0',
      textSecondary: '#B8B5B0',
      accent: '#D4AF37',
      border: '#404040',
      highlight: '#3D3A2E',
    },
  },
  fonts: {
    tamil: "'Noto Sans Tamil', 'Lohit Tamil', sans-serif",
    body: "'Inter', sans-serif",
  },
  fontSizes: {
    small: '18px',
    medium: '22px',
    large: '28px',
    xlarge: '36px',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'dark.background' : 'calm.background',
        color: props.colorMode === 'dark' ? 'dark.textPrimary' : 'calm.textPrimary',
      },
    }),
  },
})
