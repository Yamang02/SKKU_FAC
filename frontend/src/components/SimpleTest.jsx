import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SimpleTest = () => {
    const [count, setCount] = useState(0);
    const [bgColor, setBgColor] = useState('#ffffff');

    const colors = ['#ffffff', '#f8f9fa', '#e3f2fd', '#fff3e0'];

    const changeColor = () => {
        const currentIndex = colors.indexOf(bgColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        setBgColor(colors[nextIndex]);
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={styles.title}>🎨 실시간 테스트</Text>

            <View style={styles.counterSection}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setCount(count - 1)}
                >
                    <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.countText}>카운트: {count}</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setCount(count + 1)}
                >
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.colorButton}
                onPress={changeColor}
            >
                <Text style={styles.buttonText}>배경색 변경</Text>
            </TouchableOpacity>

            <Text style={styles.tip}>
                💡 이 컴포넌트를 수정해보세요! 저장하면 즉시 반영됩니다.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dee2e6',
        alignItems: 'center',
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    counterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    colorButton: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    countText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        minWidth: 100,
        textAlign: 'center',
    },
    tip: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default SimpleTest;
