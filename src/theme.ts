import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  colors: {
    calm: {
      background: '#FFFFFF',
      surface: '#FFFFFF',
      panelPrimary: '#E8E8E8',
      panelSecondary: '#F0F0F0',
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
