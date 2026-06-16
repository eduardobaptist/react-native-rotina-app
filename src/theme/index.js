import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F46E5',
    secondary: '#7C3AED',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F1F5',
    onSurface: '#111118',
    onSurfaceVariant: '#6B6B80',
    outline: '#D1D1DB',
    error: '#DC2626',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    secondary: '#A78BFA',
    background: '#0D0D14',
    surface: '#16161F',
    surfaceVariant: '#1E1E2E',
    onSurface: '#F0F0FA',
    onSurfaceVariant: '#9090A8',
    outline: '#3A3A50',
    error: '#F87171',
  },
};
