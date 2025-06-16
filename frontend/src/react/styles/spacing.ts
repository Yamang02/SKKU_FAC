export const spacing = {
    // Base spacing unit (4px)
    unit: 4,

    // Spacing scale
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
    40: 160,
    48: 192,
    56: 224,
    64: 256,

    // Semantic spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,

    // Component-specific spacing
    component: {
        // Padding
        padding: {
            xs: 8,
            sm: 12,
            md: 16,
            lg: 20,
            xl: 24,
        },

        // Margin
        margin: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 20,
        },

        // Gap (for flexbox)
        gap: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 20,
        },

        // Border radius
        borderRadius: {
            none: 0,
            sm: 4,
            md: 8,
            lg: 12,
            xl: 16,
            full: 9999,
        },

        // Button spacing
        button: {
            paddingVertical: {
                sm: 8,
                md: 12,
                lg: 16,
            },
            paddingHorizontal: {
                sm: 12,
                md: 16,
                lg: 20,
            },
        },

        // Input spacing
        input: {
            paddingVertical: 12,
            paddingHorizontal: 16,
        },

        // Card spacing
        card: {
            padding: 16,
            margin: 8,
        },

        // List item spacing
        listItem: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            gap: 8,
        },

        // Header spacing
        header: {
            height: 56,
            paddingHorizontal: 16,
        },

        // Tab bar spacing
        tabBar: {
            height: 60,
            paddingBottom: 8,
        },

        // Modal spacing
        modal: {
            padding: 20,
            margin: 16,
        },
    },

    // Layout spacing
    layout: {
        containerPadding: 16,
        sectionSpacing: 24,
        elementSpacing: 16,
        tightSpacing: 8,
        looseSpacing: 32,
    },

    // Screen spacing
    screen: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        safeAreaPadding: 16,
    },
} as const;

export type Spacing = typeof spacing;
