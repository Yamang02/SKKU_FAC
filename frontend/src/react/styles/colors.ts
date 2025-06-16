export const colors = {
    // Primary colors
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

    // Secondary colors
    secondary: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
    },

    // Semantic colors
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
    },

    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
    },

    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },

    // Neutral colors
    neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
    },

    // Background colors
    background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Text colors
    text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        inverse: '#ffffff',
        disabled: '#d1d5db',
    },

    // Border colors
    border: {
        light: '#e5e7eb',
        medium: '#d1d5db',
        dark: '#9ca3af',
    },

    // Shadow colors
    shadow: {
        light: 'rgba(0, 0, 0, 0.1)',
        medium: 'rgba(0, 0, 0, 0.15)',
        dark: 'rgba(0, 0, 0, 0.25)',
    },
} as const;

export type ColorPalette = typeof colors;
