import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../../styles';

export interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    onPress?: () => void;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    variant?: 'default' | 'outlined' | 'elevated' | 'filled';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    testID?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    subtitle,
    onPress,
    style,
    titleStyle,
    subtitleStyle,
    variant = 'default',
    size = 'medium',
    disabled = false,
    testID,
}) => {
    const getCardStyle = () => {
        const sizeStyle = size === 'small' ? styles.cardSmall :
            size === 'large' ? styles.cardLarge :
                styles.cardMedium;

        const baseStyles = [styles.card, sizeStyle];

        switch (variant) {
            case 'outlined':
                return [styles.card, sizeStyle, styles.cardOutlined];
            case 'elevated':
                return [styles.card, sizeStyle, styles.cardElevated];
            case 'filled':
                return [styles.card, sizeStyle, styles.cardFilled];
            default:
                return baseStyles;
        }
    };

    const CardContent = () => (
        <View style={[getCardStyle(), style, disabled && styles.cardDisabled]}>
            {/* Header */}
            {(title || subtitle) && (
                <View style={styles.header}>
                    {title && (
                        <Text
                            style={[styles.title, titleStyle]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {title}
                        </Text>
                    )}
                    {subtitle && (
                        <Text
                            style={[styles.subtitle, subtitleStyle]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
            )}

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );

    if (onPress && !disabled) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                testID={testID}
                accessibilityRole="button"
                style={styles.touchable}
            >
                <CardContent />
            </TouchableOpacity>
        );
    }

    return (
        <View testID={testID}>
            <CardContent />
        </View>
    );
};

const styles = StyleSheet.create({
    touchable: {
        borderRadius: spacing.component.borderRadius.md,
    },
    card: {
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.md,
        overflow: 'hidden',
    },
    cardSmall: {
        padding: spacing.sm,
    },
    cardMedium: {
        padding: spacing.md,
    },
    cardLarge: {
        padding: spacing.lg,
    },
    cardOutlined: {
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    cardElevated: {
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardFilled: {
        backgroundColor: colors.background.secondary,
    },
    cardDisabled: {
        opacity: 0.6,
    },
    header: {
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.heading.h6,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body.small,
        color: colors.text.secondary,
    },
    content: {
        flex: 1,
    },
});

export default Card;
