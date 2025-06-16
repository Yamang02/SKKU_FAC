import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import './styles/global.css';  // 전역 CSS 임포트

const App = () => {
    return (
        <View className="flex flex-col items-center justify-center p-6 bg-gray-50" style={styles.container}>
            <Text className="text-2xl font-bold text-primary text-center" style={styles.title}>
                SKKU 순수미술동아리 갤러리
            </Text>
            <Text className="text-lg text-gray-600 mb-5">
                하이브리드 개발 환경 테스트
            </Text>
            <View className="bg-white p-4 rounded-lg shadow-md">
                <Text className="text-base text-gray-700 text-center">
                    🎉 CSS 클래스와 React Native Web StyleSheet가 함께 작동하고 있습니다!
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-3">
                    Phase 1: CSS 클래스 사용 → Phase 2: 하이브리드 → Phase 3: 완전한 StyleSheet
                </Text>
            </View>

            {/* 하이브리드 예제: CSS 클래스 + StyleSheet */}
            <View className="mt-6 p-4 border rounded-md" style={styles.exampleBox}>
                <Text style={styles.exampleTitle}>하이브리드 스타일링 예제</Text>
                <Text className="text-gray-600">
                    이 텍스트는 CSS 클래스를 사용합니다.
                </Text>
                <Text style={styles.exampleText}>
                    이 텍스트는 StyleSheet를 사용합니다.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: '100vh',  // 웹에서 전체 높이 보장
    },
    title: {
        marginBottom: 10,
    },
    exampleBox: {
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6',
    },
    exampleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
    },
    exampleText: {
        fontSize: 14,
        color: '#6c757d',
        fontStyle: 'italic',
    },
});

export default App;
