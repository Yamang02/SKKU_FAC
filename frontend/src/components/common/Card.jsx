import React from 'react';
import { View, StyleSheet } from 'react-native';

const Card = ({ children, padding = 16, style }) => (
    <View style={Object.assign({}, styles.card, { padding }, style)}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 16,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
});

export default Card;
