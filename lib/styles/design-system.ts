// Design System - Reputraq Brand Guidelines

export const colors = {
  // Brand Colors
  brand: {
    primary: '#0093DD',      // Vibrant Blue
    secondary: '#004163',    // Ocean Depth
    gradient: {
      from: '#0093DD',
      to: '#004163'
    }
  },
  
  // Neutral Colors
  neutral: {
    charcoal: '#101010',     // Charcoal Core
    white: '#FFFFFF',        // Pure White
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  
  // Semantic Colors
  semantic: {
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#10B981',
      600: '#059669',
      700: '#047857'
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309'
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C'
    },
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8'
    }
  }
} as const;

export const typography = {
  fontFamily: {
    primary: 'Helvetica, Arial, sans-serif',
    secondary: 'Montserrat, sans-serif'
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem'    // 60px
  },
  
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem'       // 128px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  brand: '0 4px 12px rgba(0, 147, 221, 0.4)',
  brandHover: '0 8px 20px rgba(0, 147, 221, 0.6)'
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Utility functions
export const getBrandGradient = (direction: 'to-r' | 'to-b' | 'to-br' | 'to-bl' = 'to-br') => {
  return `linear-gradient(${direction}, ${colors.brand.gradient.from}, ${colors.brand.gradient.to})`;
};

export const getTextColor = (variant: 'primary' | 'secondary' | 'muted' | 'inverse' = 'primary') => {
  switch (variant) {
    case 'primary':
      return colors.neutral.charcoal;
    case 'secondary':
      return colors.neutral.gray[600];
    case 'muted':
      return colors.neutral.gray[500];
    case 'inverse':
      return colors.neutral.white;
    default:
      return colors.neutral.charcoal;
  }
};

export const getBackgroundColor = (variant: 'primary' | 'secondary' | 'muted' | 'brand' = 'primary') => {
  switch (variant) {
    case 'primary':
      return colors.neutral.white;
    case 'secondary':
      return colors.neutral.gray[50];
    case 'muted':
      return colors.neutral.gray[100];
    case 'brand':
      return colors.brand.primary;
    default:
      return colors.neutral.white;
  }
};

// Component variants
export const buttonVariants = {
  primary: {
    background: getBrandGradient(),
    color: colors.neutral.white,
    border: 'none',
    shadow: shadows.brand,
    hoverShadow: shadows.brandHover,
    borderRadius: borderRadius.lg,
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.secondary
  },
  secondary: {
    background: colors.neutral.white,
    color: colors.brand.primary,
    border: `2px solid ${colors.brand.primary}`,
    shadow: shadows.sm,
    hoverShadow: shadows.md,
    borderRadius: borderRadius.lg,
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.secondary
  },
  ghost: {
    background: 'transparent',
    color: colors.brand.primary,
    border: 'none',
    shadow: 'none',
    hoverShadow: 'none',
    borderRadius: borderRadius.lg,
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.secondary
  },
  sleek: {
    background: `linear-gradient(135deg, ${colors.brand.primary}15, ${colors.brand.secondary}15)`,
    color: colors.brand.primary,
    border: `1px solid ${colors.brand.primary}30`,
    shadow: 'none',
    hoverShadow: shadows.sm,
    borderRadius: borderRadius.xl,
    padding: `${spacing[4]} ${spacing[8]}`,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.secondary
  }
} as const;

export const cardVariants = {
  default: {
    background: colors.neutral.white,
    border: `1px solid ${colors.neutral.gray[200]}`,
    shadow: shadows.base,
    borderRadius: borderRadius.xl
  },
  elevated: {
    background: colors.neutral.white,
    border: 'none',
    shadow: shadows.lg,
    borderRadius: borderRadius['2xl']
  },
  brand: {
    background: getBrandGradient(),
    border: 'none',
    shadow: shadows.brand,
    borderRadius: borderRadius.xl
  }
} as const;
