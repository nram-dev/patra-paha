import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  colors: {
    calm: {
      background: '#F5F5DC',
      surface: '#FFFFFF',
      textPrimary: '#2C1810',
      textSecondary: '#6B5D52',
      accent: '#FF9933',
      border: '#E0D5C7',
      highlight: '#FFF9C4',
    },
    dark: {
      background: '#262626',
      surface: '#2D2D2D',
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
