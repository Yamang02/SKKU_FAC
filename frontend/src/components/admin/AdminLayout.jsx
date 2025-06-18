import React from 'react';
import { View, StyleSheet } from 'react-native';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

const AdminLayout = ({ children, title = "관리자 대시보드" }) => {
    return (
        <View style={styles.container}>
            <AdminSidebar />
            <View style={styles.content}>
                <AdminHeader title={title} />
                <View style={styles.main}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        backgroundColor: '#f5f6fa',
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        marginLeft: 200, // 사이드바 너비
        padding: 32,
    },
    main: {
        flex: 1,
        width: '100%',
        maxWidth: 1200,
        marginTop: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#f5f6fa',
        borderRadius: 16,
    },
});

export default AdminLayout;
