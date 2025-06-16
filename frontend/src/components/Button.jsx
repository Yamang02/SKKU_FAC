import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import '../styles/components/button.css';

/**
 * 하이브리드 버튼 컴포넌트
 * CSS 클래스와 React Native Web을 함께 사용하는 예제
 *
 * Phase 1: CSS 클래스 사용 (초보자 친화적)
 */
const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'base',
    disabled = false,
    block = false,
    style,
    className = '',
    ...props
}) => {
    // CSS 클래스 조합
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        size !== 'base' ? `btn-${size}` : '',
        block ? 'btn-block' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <TouchableOpacity
            className={buttonClasses}
            onPress={onPress}
            disabled={disabled}
            style={style}
            {...props}
        >
            <Text className="btn-text">
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default Button;
