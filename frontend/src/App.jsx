import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const App = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SKKU 순수미술동아리 갤러리</Text>
                <Text style={styles.subtitle}>성균관대학교 순수미술동아리 작품 전시관</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>환영합니다</Text>
                    <Text style={styles.description}>
                        성균관대학교 순수미술동아리의 창작 활동과 작품들을 만나보세요.
                        다양한 장르의 예술 작품들이 여러분을 기다리고 있습니다.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>주요 기능</Text>
                    <View style={styles.featureList}>
                        <Text style={styles.feature}>🎨 작품 갤러리 관람</Text>
                        <Text style={styles.feature}>🖼️ 전시회 정보 확인</Text>
                        <Text style={styles.feature}>👥 작가 프로필 보기</Text>
                        <Text style={styles.feature}>📱 모바일 최적화</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    © 2024 SKKU 순수미술동아리. All rights reserved.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#2c3e50',
        padding: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#ecf0f1',
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#34495e',
        lineHeight: 24,
    },
    featureList: {
        marginTop: 8,
    },
    feature: {
        fontSize: 16,
        color: '#34495e',
        marginBottom: 8,
        paddingLeft: 8,
    },
    footer: {
        backgroundColor: '#34495e',
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        color: '#ecf0f1',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default App;
