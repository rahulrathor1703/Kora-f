import { createTheme, type PaletteMode } from '@mui/material/styles';
import {
  focusRing,
  getModeColors,
  primaryButtonShadow,
  surfaceBorderColor,
} from './colors';

export function createAppTheme(mode: PaletteMode) {
  const colors = getModeColors(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
        light: colors.primaryLight,
      },
      secondary: {
        main: colors.secondary,
      },
      info: {
        main: colors.accent,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      divider: surfaceBorderColor(mode),
      text: {
        primary: colors.foreground,
        secondary: colors.secondary,
      },
    },
    typography: {
      fontFamily: 'var(--font-inter), Arial, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: 'none',
          },
          contained: {
            '&.MuiButton-colorPrimary': {
              backgroundColor: `${colors.primary} !important`,
              color: '#ffffff !important',
              backgroundImage: 'none !important',
              boxShadow: 'none !important',
              '@media (hover: hover)': {
                '&:hover': {
                  backgroundColor: `${colors.primaryDark} !important`,
                  boxShadow: `${primaryButtonShadow(mode)} !important`,
                },
              },
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              '&.Mui-focused': {
                boxShadow: focusRing(mode),
              },
            },
          },
        },
      },
    },
  });
}
