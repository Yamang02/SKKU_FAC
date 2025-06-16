import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const componentStyles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    } as ViewStyle,

    containerPadded: {
        flex: 1,
        backgroundColor: colors.background.primary,
        paddingHorizontal: spacing.screen.paddingHorizontal,
        paddingVertical: spacing.screen.paddingVertical,
    } as ViewStyle,

    containerCentered: {
        flex: 1,
        backgroundColor: colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    // Card styles
    card: {
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.md,
        padding: spacing.component.card.padding,
        margin: spacing.component.card.margin,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    } as ViewStyle,

    cardElevated: {
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.md,
        padding: spacing.component.card.padding,
        margin: spacing.component.card.margin,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    } as ViewStyle,

    // Button styles
    buttonPrimary: {
        backgroundColor: colors.primary[500],
        borderRadius: spacing.component.borderRadius.md,
        paddingVertical: spacing.component.button.paddingVertical.md,
        paddingHorizontal: spacing.component.button.paddingHorizontal.md,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,

    buttonSecondary: {
        backgroundColor: colors.secondary[100],
        borderRadius: spacing.component.borderRadius.md,
        paddingVertical: spacing.component.button.paddingVertical.md,
        paddingHorizontal: spacing.component.button.paddingHorizontal.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border.medium,
    } as ViewStyle,

    buttonOutline: {
        backgroundColor: 'transparent',
        borderRadius: spacing.component.borderRadius.md,
        paddingVertical: spacing.component.button.paddingVertical.md,
        paddingHorizontal: spacing.component.button.paddingHorizontal.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primary[500],
    } as ViewStyle,

    buttonDisabled: {
        backgroundColor: colors.neutral[200],
        borderRadius: spacing.component.borderRadius.md,
        paddingVertical: spacing.component.button.paddingVertical.md,
        paddingHorizontal: spacing.component.button.paddingHorizontal.md,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,

    // Button text styles
    buttonTextPrimary: {
        ...typography.button.base,
        color: colors.text.inverse,
    } as TextStyle,

    buttonTextSecondary: {
        ...typography.button.base,
        color: colors.text.primary,
    } as TextStyle,

    buttonTextOutline: {
        ...typography.button.base,
        color: colors.primary[500],
    } as TextStyle,

    buttonTextDisabled: {
        ...typography.button.base,
        color: colors.text.disabled,
    } as TextStyle,

    // Input styles
    input: {
        borderWidth: 1,
        borderColor: colors.border.medium,
        borderRadius: spacing.component.borderRadius.md,
        paddingVertical: spacing.component.input.paddingVertical,
        paddingHorizontal: spacing.component.input.paddingHorizontal,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        backgroundColor: colors.background.primary,
    } as ViewStyle,

    inputFocused: {
        borderColor: colors.primary[500],
        shadowColor: colors.primary[200],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    } as ViewStyle,

    inputError: {
        borderColor: colors.error[500],
    } as ViewStyle,

    // Text styles
    textHeading1: {
        ...typography.heading.h1,
        color: colors.text.primary,
    } as TextStyle,

    textHeading2: {
        ...typography.heading.h2,
        color: colors.text.primary,
    } as TextStyle,

    textHeading3: {
        ...typography.heading.h3,
        color: colors.text.primary,
    } as TextStyle,

    textBody: {
        ...typography.body.base,
        color: colors.text.primary,
    } as TextStyle,

    textBodySecondary: {
        ...typography.body.base,
        color: colors.text.secondary,
    } as TextStyle,

    textCaption: {
        ...typography.caption,
        color: colors.text.secondary,
    } as TextStyle,

    textLabel: {
        ...typography.label,
        color: colors.text.primary,
    } as TextStyle,

    textError: {
        ...typography.body.small,
        color: colors.error[500],
    } as TextStyle,

    // List styles
    listContainer: {
        flex: 1,
    } as ViewStyle,

    listItem: {
        paddingVertical: spacing.component.listItem.paddingVertical,
        paddingHorizontal: spacing.component.listItem.paddingHorizontal,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        backgroundColor: colors.background.primary,
    } as ViewStyle,

    listItemPressed: {
        backgroundColor: colors.neutral[50],
    } as ViewStyle,

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    modalContent: {
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.lg,
        padding: spacing.component.modal.padding,
        margin: spacing.component.modal.margin,
        maxWidth: '90%',
        maxHeight: '80%',
    } as ViewStyle,

    // Header styles
    header: {
        height: spacing.component.header.height,
        backgroundColor: colors.background.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.component.header.paddingHorizontal,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    } as ViewStyle,

    headerTitle: {
        ...typography.heading.h6,
        color: colors.text.primary,
        flex: 1,
        textAlign: 'center',
    } as TextStyle,

    // Loading styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    } as ViewStyle,

    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    } as ViewStyle,

    // Error styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        padding: spacing.lg,
    } as ViewStyle,

    errorText: {
        ...typography.body.base,
        color: colors.error[500],
        textAlign: 'center',
        marginBottom: spacing.md,
    } as TextStyle,

    // Utility styles
    flexRow: {
        flexDirection: 'row',
    } as ViewStyle,

    flexColumn: {
        flexDirection: 'column',
    } as ViewStyle,

    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    flexBetween: {
        justifyContent: 'space-between',
        alignItems: 'center',
    } as ViewStyle,

    flex1: {
        flex: 1,
    } as ViewStyle,

    // Shadow styles
    shadowLight: {
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
    } as ViewStyle,

    shadowMedium: {
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    } as ViewStyle,

    shadowLarge: {
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    } as ViewStyle,
});

export type ComponentStyles = typeof componentStyles;
