import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#03DAC4',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#B00020',
    text: '#000000',
    onSurface: '#000000',
    disabled: '#C0C0C0',
    placeholder: '#A0A0A0',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF5722',
    
    // Custom colors
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    light: '#F8F9FA',
    dark: '#343A40',
    
    // Analysis specific colors
    spermPrimary: '#1976D2',
    spermSecondary: '#42A5F5',
    motilityHigh: '#4CAF50',
    motilityMedium: '#FF9800',
    motilityLow: '#F44336',
    
    // Chart colors
    chartColors: [
      '#2196F3',
      '#4CAF50',
      '#FF9800',
      '#F44336',
      '#9C27B0',
      '#00BCD4',
      '#FFEB3B',
      '#795548'
    ]
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  roundness: 8,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

export const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  button: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  secondaryButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  input: {
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  successText: {
    color: theme.colors.success,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
};