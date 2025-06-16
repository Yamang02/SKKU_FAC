import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const AdminHeader = ({ title = "관리자 대시보드" }) => {
    const handleHomeClick = () => {
        window.location.href = '/';
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
                <View style={styles.homeSection}>
                    <Pressable
                        style={styles.homeButton}
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
    homeSection: {
        display: 'flex',
        alignItems: 'center',
    },
    homeButton: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: '#f8f9fa',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AdminHeader;
