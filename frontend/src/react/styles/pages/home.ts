import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../index';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const homeStyles = StyleSheet.create({
    // Hero Section
    heroContainer: {
        position: 'relative',
        width: '100%',
        height: 500,
        overflow: 'hidden',
        marginBottom: spacing.xl * 3,
    },

    featuredExhibitionsContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },

    heroSlide: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    heroSlideActive: {
        opacity: 1,
        zIndex: 1,
    },

    heroSlideBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
    },

    heroContent: {
        alignItems: 'center',
        maxWidth: 800,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        zIndex: 2,
    },

    heroTitle: {
        ...typography.heading.h1,
        color: '#FFFFFF',
        marginBottom: spacing.md,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 8,
        lineHeight: typography.heading.h1.fontSize * 1.2,
    },

    heroTitleWithBackground: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: spacing.component.borderRadius.md,
    },

    heroDescription: {
        ...typography.body.large,
        color: '#FFFFFF',
        marginBottom: spacing.lg,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
        maxWidth: 600,
    },

    heroButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
        backgroundColor: '#1a73e8',
        borderRadius: spacing.component.borderRadius.sm,
    },

    heroButtonText: {
        ...typography.body.base,
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
    },

    // Slider Navigation
    heroSliderNavigation: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        width: '100%',
        alignItems: 'center',
        zIndex: 10,
    },

    heroSliderDots: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
    },

    heroSliderDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },

    heroSliderDotActive: {
        backgroundColor: '#FFFFFF',
        transform: [{ scale: 1.2 }],
    },

    // Loading States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },

    loadingSpinner: {
        width: 40,
        height: 40,
        marginBottom: spacing.md,
    },

    loadingText: {
        ...typography.body.base,
        color: '#FFFFFF',
    },

    // Featured Section
    featuredSection: {
        marginBottom: spacing.xl * 3,
    },

    contentContainer: {
        paddingHorizontal: spacing.lg,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },

    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },

    featuredTitle: {
        ...typography.heading.h2,
        color: colors.text.primary,
    },

    featuredLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background.secondary,
        borderRadius: spacing.component.borderRadius.md,
    },

    linkText: {
        ...typography.body.base,
        color: colors.text.primary,
        marginRight: spacing.xs,
    },

    linkIcon: {
        fontSize: 16,
        color: colors.text.secondary,
    },

    // Artwork Grid
    artworkGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.lg,
        justifyContent: 'space-between',
    },

    cardHome: {
        width: screenWidth > 768 ? '23%' : screenWidth > 480 ? '48%' : '100%',
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.md,
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },

    // Notice Section
    noticeSection: {
        marginBottom: spacing.xl * 3,
    },

    noticeList: {
        gap: spacing.sm,
    },

    noticeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
    },

    noticeItemContent: {
        flex: 1,
    },

    noticeBadgeImportant: {
        backgroundColor: '#ef4444',
        color: '#FFFFFF',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: spacing.component.borderRadius.sm,
        fontSize: 12,
        fontWeight: '600',
        marginRight: spacing.sm,
    },

    noticeItemTitle: {
        ...typography.body.base,
        color: colors.text.primary,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },

    noticeItemMeta: {
        flexDirection: 'row',
        gap: spacing.md,
    },

    noticeItemDate: {
        ...typography.body.small,
        color: colors.text.secondary,
    },

    noticeItemAuthor: {
        ...typography.body.small,
        color: colors.text.secondary,
    },

    noticeItemArrow: {
        fontSize: 16,
        color: colors.text.secondary,
    },

    noticeEmpty: {
        alignItems: 'center',
        paddingVertical: spacing.xl * 2,
    },

    noticeEmptyText: {
        ...typography.body.base,
        color: colors.text.secondary,
    },

    // Modal Styles
    artworkModal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.lg,
        maxWidth: 900,
        width: '90%',
        maxHeight: '90%',
        overflow: 'hidden',
    },

    modalBody: {
        flexDirection: screenWidth > 768 ? 'row' : 'column',
    },

    modalImageContainer: {
        flex: screenWidth > 768 ? 1 : undefined,
        height: screenWidth > 768 ? undefined : 300,
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    modalInfo: {
        flex: screenWidth > 768 ? 1 : undefined,
        padding: spacing.lg,
    },

    modalInfoContent: {
        gap: spacing.md,
    },

    modalInfoTitle: {
        ...typography.heading.h4,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },

    artworkInfoSection: {
        gap: spacing.sm,
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },

    infoItemText: {
        ...typography.body.base,
        color: colors.text.primary,
        flex: 1,
    },

    modalDetailLink: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: spacing.component.borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.lg,
    },

    modalDetailLinkText: {
        ...typography.body.base,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

// Responsive styles
export const getResponsiveHomeStyles = () => {
    const { width } = Dimensions.get('window');

    return StyleSheet.create({
        // Mobile styles
        ...(width <= 768 && {
            heroContainer: {
                height: 400,
            },
            heroTitle: {
                fontSize: 32,
                textShadowColor: 'rgba(0, 0, 0, 0.9)',
            },
            heroDescription: {
                fontSize: 16,
                textShadowColor: 'rgba(0, 0, 0, 0.9)',
            },
            heroTitleWithBackground: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm + 2,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
            featuredHeader: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: spacing.md,
            },
            artworkGrid: {
                gap: spacing.md,
            },
            noticeItem: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
            },
            noticeItemMeta: {
                flexDirection: 'column',
                gap: spacing.xs,
            },
        }),

        // Small mobile styles
        ...(width <= 480 && {
            heroContainer: {
                height: 300,
            },
            heroTitle: {
                fontSize: 24,
                textShadowColor: 'rgba(0, 0, 0, 0.95)',
            },
            heroTitleWithBackground: {
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
            },
            noticeItemTitle: {
                fontSize: 14,
            },
            noticeItemMeta: {
                fontSize: 12,
            },
            modalDetailLink: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
            },
        }),
    });
};

export default homeStyles;
