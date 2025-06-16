import { TextStyle } from 'react-native';

export const typography = {
    // Font families
    fontFamily: {
        primary: 'System',
        secondary: 'System',
        mono: 'Courier New',
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        '6xl': 60,
    },

    // Font weights
    fontWeight: {
        thin: '100' as TextStyle['fontWeight'],
        light: '300' as TextStyle['fontWeight'],
        normal: '400' as TextStyle['fontWeight'],
        medium: '500' as TextStyle['fontWeight'],
        semibold: '600' as TextStyle['fontWeight'],
        bold: '700' as TextStyle['fontWeight'],
        extrabold: '800' as TextStyle['fontWeight'],
        black: '900' as TextStyle['fontWeight'],
    },

    // Line heights
    lineHeight: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },

    // Letter spacing
    letterSpacing: {
        tighter: -0.5,
        tight: -0.25,
        normal: 0,
        wide: 0.25,
        wider: 0.5,
        widest: 1,
    },

    // Text styles
    heading: {
        h1: {
            fontSize: 36,
            fontWeight: '700' as TextStyle['fontWeight'],
            lineHeight: 1.25,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 30,
            fontWeight: '600' as TextStyle['fontWeight'],
            lineHeight: 1.25,
            letterSpacing: -0.25,
        },
        h3: {
            fontSize: 24,
            fontWeight: '600' as TextStyle['fontWeight'],
            lineHeight: 1.375,
            letterSpacing: 0,
        },
        h4: {
            fontSize: 20,
            fontWeight: '500' as TextStyle['fontWeight'],
            lineHeight: 1.375,
            letterSpacing: 0,
        },
        h5: {
            fontSize: 18,
            fontWeight: '500' as TextStyle['fontWeight'],
            lineHeight: 1.5,
            letterSpacing: 0,
        },
        h6: {
            fontSize: 16,
            fontWeight: '500' as TextStyle['fontWeight'],
            lineHeight: 1.5,
            letterSpacing: 0,
        },
    },

    // Body text styles
    body: {
        large: {
            fontSize: 18,
            fontWeight: '400' as TextStyle['fontWeight'],
            lineHeight: 1.625,
            letterSpacing: 0,
        },
        base: {
            fontSize: 16,
            fontWeight: '400' as TextStyle['fontWeight'],
            lineHeight: 1.5,
            letterSpacing: 0,
        },
        small: {
            fontSize: 14,
            fontWeight: '400' as TextStyle['fontWeight'],
            lineHeight: 1.5,
            letterSpacing: 0,
        },
        xs: {
            fontSize: 12,
            fontWeight: '400' as TextStyle['fontWeight'],
            lineHeight: 1.5,
            letterSpacing: 0.25,
        },
    },

    // Caption and label styles
    caption: {
        fontSize: 12,
        fontWeight: '400' as TextStyle['fontWeight'],
        lineHeight: 1.375,
        letterSpacing: 0.25,
    },

    label: {
        fontSize: 14,
        fontWeight: '500' as TextStyle['fontWeight'],
        lineHeight: 1.375,
        letterSpacing: 0,
    },

    // Button text styles
    button: {
        large: {
            fontSize: 16,
            fontWeight: '600' as TextStyle['fontWeight'],
            lineHeight: 1.25,
            letterSpacing: 0,
        },
        base: {
            fontSize: 14,
            fontWeight: '500' as TextStyle['fontWeight'],
            lineHeight: 1.25,
            letterSpacing: 0,
        },
        small: {
            fontSize: 12,
            fontWeight: '500' as TextStyle['fontWeight'],
            lineHeight: 1.25,
            letterSpacing: 0.25,
        },
    },
} as const;

export type Typography = typeof typography;
