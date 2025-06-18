import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccessMessage } from '../../utils/notification';

const AdminHeader = ({ title = "관리자 대시보드" }) => {
    const { logout } = useAuth();

    const handleHomeClick = () => {
        window.location.href = '/';
    };

    const handleLogoutClick = async () => {
        try {
            await logout();
            showSuccessMessage('로그아웃되었습니다.');
            // 로그인 페이지로 리다이렉트
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
    };

    // React Native Web에서 HTML 요소 직접 사용
    const FontAwesomeIcon = ({ className, style }) => {
        return React.createElement('i', {
            className: className,
            style: style
        });
    };

    return (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.breadcrumb}>
                        <Text style={styles.breadcrumbText}>관리자</Text>
                        <Text style={styles.breadcrumbSeparator}>/</Text>
                    </View>
                </View>
                <View style={styles.actionSection}>
                    <Pressable
                        style={styles.actionButton}
                        onPress={handleHomeClick}
                        title="홈으로"
                    >
                        <FontAwesomeIcon
                            className="fas fa-home"
                            style={{
                                fontSize: '16px',
                                color: '#666'
                            }}
                        />
                        <Text style={styles.buttonText}>홈</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogoutClick}
                        title="로그아웃"
                    >
                        <FontAwesomeIcon
                            className="fas fa-sign-out-alt"
                            style={{
                                fontSize: '16px',
                                color: '#dc3545'
                            }}
                        />
                        <Text style={[styles.buttonText, styles.logoutText]}>로그아웃</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 24,
    },
    headerTop: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    titleSection: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    breadcrumb: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    breadcrumbText: {
        fontSize: 14,
        color: '#666',
    },
    breadcrumbSeparator: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 8,
    },
    actionSection: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#f8f9fa',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        minWidth: 80,
        transition: 'all 0.2s ease',
    },
    logoutButton: {
        backgroundColor: '#fff2f2',
        borderWidth: 1,
        borderColor: '#dc3545',
        borderStyle: 'solid',
    },
    buttonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    logoutText: {
        color: '#dc3545',
    },
});

export default AdminHeader;
