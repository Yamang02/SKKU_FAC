import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from './Icon';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    icon,
    style,
    textStyle
}) => {
    const getButtonStyle = () => {
        const baseStyle = {
            ...styles.button,
            ...styles[size],
        };

        if (disabled) {
            return { ...baseStyle, ...styles.disabled };
        }

        return { ...baseStyle, ...styles[variant] };
    };

    const getTextStyle = () => {
        const baseTextStyle = { ...styles.text, ...styles[`${size}Text`] };

        if (disabled) {
            return { ...baseTextStyle, ...styles.disabledText };
        }

        return { ...baseTextStyle, ...styles[`${variant}Text`] };
    };

    return (
        <TouchableOpacity
            style={Object.assign({}, getButtonStyle(), style)}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={disabled ? 1 : 0.8}
        >
            {icon && (
                <Icon
                    name={icon}
                    size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
                    color={disabled ? '#9ca3af' : variant === 'primary' ? '#ffffff' : '#374151'}
                    style={styles.icon}
                />
            )}
            <Text style={Object.assign({}, getTextStyle(), textStyle)}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
    },

    // 크기별 스타일
    small: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    medium: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    large: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },

    // 버튼 variant 스타일
    primary: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    secondary: {
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
    },
    success: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    warning: {
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
    },
    danger: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },

    // 비활성화 상태
    disabled: {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
    },

    // 텍스트 스타일
    text: {
        fontWeight: '500',
        textAlign: 'center',
    },

    // 텍스트 크기별 스타일
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },

    // 텍스트 variant 스타일
    primaryText: {
        color: '#ffffff',
    },
    secondaryText: {
        color: '#374151',
    },
    successText: {
        color: '#ffffff',
    },
    warningText: {
        color: '#ffffff',
    },
    dangerText: {
        color: '#ffffff',
    },
    ghostText: {
        color: '#374151',
    },
    disabledText: {
        color: '#9ca3af',
    },

    icon: {
        marginRight: 8,
    },
});

export default Button;
