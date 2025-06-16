import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

function App() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SKKU 순수미술동아리 갤러리</Text>
                <Text style={styles.subtitle}>성균관대학교 순수미술동아리 작품 전시 공간입니다.</Text>
            </View>
            <View style={styles.main}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>환영합니다</Text>
                    <Text style={styles.sectionText}>React Native Web 개발 환경이 성공적으로 설정되었습니다!</Text>
                    <Text style={styles.sectionText}>이제 웹과 모바일에서 모두 사용할 수 있는 갤러리를 만들 수 있습니다.</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        backgroundColor: '#667eea',
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        opacity: 0.9,
    },
    main: {
        flex: 1,
        padding: 20,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    section: {
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 15,
    },
    sectionText: {
        fontSize: 16,
        color: '#6c757d',
        lineHeight: 24,
        marginBottom: 10,
    },
});

export default App;
