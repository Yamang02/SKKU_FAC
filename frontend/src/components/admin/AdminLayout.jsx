import React from 'react';
import { View, StyleSheet } from 'react-native';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

const AdminLayout = ({ title, subtitle, currentPage, children }) => {
    return (
        <View style={styles.adminContainer}>
            <AdminSidebar currentPage={currentPage} />
            <View style={styles.adminContent}>
                <AdminHeader title={title} subtitle={subtitle} />
                {/* 알림 컨테이너는 나중에 notification 시스템과 함께 구현 */}
                <View style={styles.adminMain}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    adminContainer: {
        flexDirection: 'row',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
    },
    adminContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    adminMain: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
});

export default AdminLayout;
