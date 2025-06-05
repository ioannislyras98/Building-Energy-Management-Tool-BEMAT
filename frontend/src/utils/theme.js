import { createTheme } from '@mui/material/styles'

// Get CSS custom properties for consistent theming
const getCSSCustomProperty = property => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim()
  }
  // Fallback values for SSR or when window is not available
  const fallbacks = {
    '--color-primary': '#2d5a27',
    '--color-primary-light': '#4a7c59',
    '--color-primary-dark': '#1a3a15',
    '--color-background-default': '#ffffff',
    '--color-background-paper': '#ffffff',
    '--color-text-primary': '#213547',
    '--color-text-secondary': '#6b7280'
  }
  return fallbacks[property] || ''
}

// Create Material UI theme using CSS custom properties
export const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: getCSSCustomProperty('--color-primary') || '#2d5a27',
      light: getCSSCustomProperty('--color-primary-light') || '#4a7c59',
      dark: getCSSCustomProperty('--color-primary-dark') || '#1a3a15'
    },
    background: {
      default: getCSSCustomProperty('--color-background-default') || '#ffffff',
      paper: getCSSCustomProperty('--color-background-paper') || '#ffffff'
    },
    text: {
      primary: getCSSCustomProperty('--color-text-primary') || '#213547',
      secondary: getCSSCustomProperty('--color-text-secondary') || '#6b7280'
    }
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #e0e0e0'
        }
      }
    }
  }
})

export default defaultTheme
