import React from 'react';
import { Text, StyleSheet } from 'react-native';

const iconMap = {
    // 기본 아이콘들
    home: '⌂',
    user: '👤',
    users: '👥',
    settings: '⚙',
    dashboard: '▣',
    gallery: '▦',
    artwork: '🎨',
    exhibition: '🖼',

    // 액션 아이콘들
    edit: '✎',
    delete: '🗑',
    save: '💾',
    search: '🔍',
    reset: '↻',
    plus: '➕',
    minus: '➖',

    // 상태 아이콘들
    check: '✓',
    close: '✕',
    warning: '⚠',
    info: 'ℹ',
    error: '✕',

    // 네비게이션
    back: '←',
    forward: '→',
    up: '↑',
    down: '↓',
};

const Icon = ({ name, size = 16, color = '#374151', style }) => {
    const iconText = iconMap[name] || name;

    return (
        <Text style={Object.assign({}, styles.icon, { fontSize: size, color }, style)}>
            {iconText}
        </Text>
    );
};

const styles = StyleSheet.create({
    icon: {
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        lineHeight: 1,
    },
});

export default Icon;
