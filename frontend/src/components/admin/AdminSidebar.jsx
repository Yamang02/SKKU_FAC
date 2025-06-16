import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            path: '/admin/dashboard',
            icon: 'fas fa-home',
            label: '대시보드',
            key: 'dashboard'
        },
        {
            path: '/admin/users',
            icon: 'fas fa-users',
            label: '회원 관리',
            key: 'users'
        },
        {
            path: '/admin/exhibitions',
            icon: 'fas fa-image',
            label: '전시 관리',
            key: 'exhibitions'
        },
        {
            path: '/admin/artworks',
            icon: 'fas fa-palette',
            label: '작품 관리',
            key: 'artworks'
        },
    ];

    const handleMenuClick = (path) => {
        navigate(path);
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // React Native Web에서 HTML 요소 직접 사용
    const FontAwesomeIcon = ({ className, style }) => {
        return React.createElement('i', {
            className: className,
            style: style
        });
    };

    return (
        <View style={styles.sidebar}>
            <View style={styles.logo}>
                <Text style={styles.logoText}>SKKU Gallery</Text>
            </View>
            <View style={styles.nav}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Pressable
                            key={item.key}
                            style={active ? styles.navItemActive : styles.navItem}
                            onPress={() => handleMenuClick(item.path)}
                        >
                            <View style={styles.iconContainer}>
                                <FontAwesomeIcon
                                    className={item.icon}
                                    style={{
                                        color: active ? '#fff' : '#ecf0f1',
                                        fontSize: '16px'
                                    }}
                                />
                            </View>
                            <Text style={active ? styles.navLabelActive : styles.navLabel}>
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: 200,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#2c3e50',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 0,
        paddingRight: 0,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
    },
    logo: {
        paddingHorizontal: 20,
        marginBottom: 30,
        backgroundColor: '#2c3e50',
        zIndex: 1,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    nav: {
        flex: 1,
        overflowY: 'auto',
    },
    navItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    navItemActive: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3498db',
    },
    iconContainer: {
        width: 20,
        marginRight: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLabel: {
        fontSize: 14,
        color: '#ecf0f1',
    },
    navLabelActive: {
        fontSize: 14,
        color: '#fff',
    },
});

export default AdminSidebar;
