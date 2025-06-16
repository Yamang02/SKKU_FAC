import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = ({ currentPage }) => {
    const location = useLocation();

    // Admin 라우트 정의
    const ADMIN_ROUTES = {
        dashboard: '/admin/dashboard',
        users: '/admin/users',
        exhibitions: '/admin/exhibitions',
        artworks: '/admin/artworks'
    };

    // 현재 경로에 따른 active 상태 결정 (URL 기반 자동 판단)
    const getActiveState = (page) => {
        const path = location.pathname;
        const routePath = ADMIN_ROUTES[page];

        if (!routePath) return false;

        // 정확한 매치 또는 하위 경로 매치
        return path === routePath || path.startsWith(routePath + '/');
    };

    const menuItems = [
        {
            id: 'dashboard',
            label: '대시보드',
            icon: '🏠',
            path: '/admin/dashboard'
        },
        {
            id: 'users',
            label: '회원 관리',
            icon: '👥',
            path: '/admin/users'
        },
        {
            id: 'exhibitions',
            label: '전시 관리',
            icon: '🖼️',
            path: '/admin/exhibitions'
        },
        {
            id: 'artworks',
            label: '작품 관리',
            icon: '🎨',
            path: '/admin/artworks'
        },
    ];

    return (
        <View style={styles.adminSidebar}>
            <View style={styles.logo}>
                <Text style={styles.logoText}>SKKU Gallery</Text>
            </View>
            <View style={styles.nav}>
                {menuItems.map(item => (
                    <Link
                        key={item.id}
                        to={item.path}
                        style={{
                            ...styles.navItem,
                            ...(getActiveState(item.id) && styles.navItemActive)
                        }}
                    >
                        <Text style={styles.navIcon}>{item.icon}</Text>
                        <Text style={{
                            ...styles.navText,
                            ...(getActiveState(item.id) && styles.navTextActive)
                        }}>
                            {item.label}
                        </Text>
                    </Link>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    adminSidebar: {
        width: 280,
        backgroundColor: '#2c3e50',
        minHeight: '100vh',
        paddingTop: 20,
    },
    logo: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#34495e',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    nav: {
        paddingHorizontal: 10,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 5,
        borderRadius: 8,
        textDecoration: 'none',
        backgroundColor: 'transparent',
    },
    navItemActive: {
        backgroundColor: '#3498db',
    },
    navIcon: {
        fontSize: 18,
        marginRight: 12,
        width: 20,
        textAlign: 'center',
    },
    navText: {
        fontSize: 16,
        color: '#bdc3c7',
        fontWeight: '500',
    },
    navTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
});

export default AdminSidebar;
