import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { View, Text, StyleSheet } from 'react-native';
import './styles/global.css';
import SimpleTest from './components/SimpleTest';
import LiveDemo from './components/LiveDemo';

// 페이지 컴포넌트들 - React Native Web 패턴 유지
const HomePage = () => (
    <View style={styles.pageContainer}>
        <Text style={styles.pageTitle}>SKKU 순수미술동아리 갤러리</Text>
        <Text style={styles.pageSubtitle}>React Router 라우팅 테스트</Text>
        <Text style={styles.description}>
            React Native Web + React Router를 사용한 SPA 라우팅이 구현되었습니다!
        </Text>
        <View style={styles.testContainer}>
            <SimpleTest />
        </View>
    </View>
);

const AdminUsers = () => (
    <View style={styles.pageContainer}>
        <Text style={styles.pageTitle}>사용자 관리</Text>
        <Text style={styles.description}>
            사용자 관리 페이지입니다. API 연동을 통해 사용자 목록을 표시할 예정입니다.
        </Text>
        <View style={styles.featureList}>
            <Text style={styles.featureTitle}>구현 예정 기능:</Text>
            <Text style={styles.featureItem}>• 사용자 목록 조회</Text>
            <Text style={styles.featureItem}>• 필터링 (상태별, 역할별)</Text>
            <Text style={styles.featureItem}>• 검색 기능</Text>
            <Text style={styles.featureItem}>• 페이지네이션</Text>
        </View>
    </View>
);

const AdminArtworks = () => (
    <View style={styles.pageContainer}>
        <Text style={styles.pageTitle}>작품 관리</Text>
        <Text style={styles.description}>
            작품 관리 페이지입니다. API 연동을 통해 작품 목록을 표시할 예정입니다.
        </Text>
        <View style={styles.featureList}>
            <Text style={styles.featureTitle}>구현 예정 기능:</Text>
            <Text style={styles.featureItem}>• 작품 목록 조회</Text>
            <Text style={styles.featureItem}>• 작품 등록/수정/삭제</Text>
            <Text style={styles.featureItem}>• 이미지 업로드</Text>
            <Text style={styles.featureItem}>• 승인/거부 처리</Text>
        </View>
    </View>
);

const AdminExhibitions = () => (
    <View style={styles.pageContainer}>
        <Text style={styles.pageTitle}>전시 관리</Text>
        <Text style={styles.description}>
            전시 관리 페이지입니다. API 연동을 통해 전시 목록을 표시할 예정입니다.
        </Text>
        <View style={styles.featureList}>
            <Text style={styles.featureTitle}>구현 예정 기능:</Text>
            <Text style={styles.featureItem}>• 전시 목록 조회</Text>
            <Text style={styles.featureItem}>• 전시 등록/수정/삭제</Text>
            <Text style={styles.featureItem}>• 작품 연결</Text>
            <Text style={styles.featureItem}>• 일정 관리</Text>
        </View>
    </View>
);

const NotFound = () => (
    <View style={styles.pageContainer}>
        <Text style={styles.errorTitle}>404 - 페이지를 찾을 수 없습니다</Text>
        <Text style={styles.description}>
            요청하신 페이지가 존재하지 않습니다.
        </Text>
        <Link to="/" style={styles.linkStyle}>
            <Text style={styles.linkText}>홈으로 돌아가기</Text>
        </Link>
    </View>
);

// 네비게이션 컴포넌트
const Navigation = () => (
    <View style={styles.navigation}>
        <Text style={styles.navTitle}>관리자 메뉴</Text>
        <View style={styles.navLinks}>
            <Link to="/" style={styles.navLink}>
                <Text style={styles.navLinkText}>홈</Text>
            </Link>
            <Link to="/admin/users" style={styles.navLink}>
                <Text style={styles.navLinkText}>사용자 관리</Text>
            </Link>
            <Link to="/admin/artworks" style={styles.navLink}>
                <Text style={styles.navLinkText}>작품 관리</Text>
            </Link>
            <Link to="/admin/exhibitions" style={styles.navLink}>
                <Text style={styles.navLinkText}>전시 관리</Text>
            </Link>
        </View>
    </View>
);

const App = () => {
    return (
        <Router>
            <View style={styles.container}>
                <Navigation />
                <View style={styles.content}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/artworks" element={<AdminArtworks />} />
                        <Route path="/admin/exhibitions" element={<AdminExhibitions />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </View>
            </View>
        </Router>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
    },
    navigation: {
        backgroundColor: '#2c3e50',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
        textAlign: 'center',
    },
    navLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 20,
    },
    navLink: {
        textDecoration: 'none',
    },
    navLinkText: {
        color: '#ecf0f1',
        fontSize: 16,
        fontWeight: '500',
        padding: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        minWidth: 100,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    pageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
        textAlign: 'center',
    },
    pageSubtitle: {
        fontSize: 20,
        color: '#6c757d',
        marginBottom: 24,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#495057',
        textAlign: 'center',
        maxWidth: 600,
        lineHeight: 24,
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e74c3c',
        marginBottom: 16,
        textAlign: 'center',
    },
    linkStyle: {
        textDecoration: 'none',
        marginTop: 20,
    },
    linkText: {
        color: '#0066cc',
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    testContainer: {
        marginTop: 30,
        width: '100%',
        alignItems: 'center',
    },
    featureList: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
        marginTop: 20,
        maxWidth: 400,
        width: '100%',
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
    },
    featureItem: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 8,
        lineHeight: 20,
    },
});

export default App;
