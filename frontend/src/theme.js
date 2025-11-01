import { extendTheme, theme as baseTheme } from '@chakra-ui/react';

const theme = extendTheme({
  // Extend the base theme
  ...baseTheme,
  // Add your customizations below
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: '#f8fafc',
        color: '#1e293b',
        lineHeight: 'tall',
      },
      a: {
        color: 'primary.600',
        _hover: {
          textDecoration: 'underline',
        },
      },
      'button:focus': {
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.4)',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'primary.600',
          color: 'white',
          _hover: {
            bg: 'primary.700',
            _disabled: {
              bg: 'primary.600',
            },
          },
        },
        outline: {
          borderColor: 'gray.200',
          _hover: {
            bg: 'gray.50',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'sm',
          border: '1px solid',
          borderColor: 'gray.100',
          _hover: {
            boxShadow: 'md',
          },
        },
      },
    },
  },
});

export default theme;
