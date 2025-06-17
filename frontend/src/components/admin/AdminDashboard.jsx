import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers.js';

const AdminDashboard = () => {
    const { users, loading, error } = useAdminUsers();

    // React Native Web에서 HTML 요소 직접 사용
    const FontAwesomeIcon = ({ className, style }) => {
        return React.createElement('i', {
            className: className,
            style: style
        });
    };

    const stats = [
        {
            title: '총 회원 수',
            value: loading ? '...' : users?.length || 0,
            icon: 'fas fa-users',
            color: '#3498db',
        },
        {
            title: '전시 수',
            value: '12',
            icon: 'fas fa-image',
            color: '#2ecc71',
        },
        {
            title: '작품 수',
            value: '156',
            icon: 'fas fa-palette',
            color: '#e74c3c',
        },
        {
            title: '방문자 수',
            value: '2,345',
            icon: 'fas fa-eye',
            color: '#f39c12',
        },
    ];

    const recentUsers = users?.slice(0, 5) || [];

    return (
        <ScrollView style={styles.dashboard}>
            {/* 통계 카드 그리드 */}
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                                <FontAwesomeIcon
                                    className={stat.icon}
                                    style={{
                                        fontSize: '20px',
                                        color: '#fff'
                                    }}
                                />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statTitle}>{stat.title}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* 최근 활동 및 사용자 목록 */}
            <View style={styles.contentGrid}>
                {/* 최근 활동 */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesomeIcon
                            className="fas fa-clock"
                            style={{
                                fontSize: '16px',
                                color: '#2c3e50',
                                marginRight: '8px'
                            }}
                        />
                        <Text style={styles.cardTitle}>최근 활동</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <View style={styles.activityItem}>
                            <View style={styles.activityDot}></View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>새로운 작품이 등록되었습니다.</Text>
                                <Text style={styles.activityTime}>2시간 전</Text>
                            </View>
                        </View>
                        <View style={styles.activityItem}>
                            <View style={styles.activityDot}></View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>전시가 수정되었습니다.</Text>
                                <Text style={styles.activityTime}>4시간 전</Text>
                            </View>
                        </View>
                        <View style={styles.activityItem}>
                            <View style={styles.activityDot}></View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>새로운 회원이 가입했습니다.</Text>
                                <Text style={styles.activityTime}>1일 전</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 최근 가입한 사용자 */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesomeIcon
                            className="fas fa-user-plus"
                            style={{
                                fontSize: '16px',
                                color: '#2c3e50',
                                marginRight: '8px'
                            }}
                        />
                        <Text style={styles.cardTitle}>최근 가입한 사용자</Text>
                    </View>
                    <View style={styles.cardBody}>
                        {loading ? (
                            <Text style={styles.loadingText}>로딩 중...</Text>
                        ) : error ? (
                            <Text style={styles.errorText}>오류가 발생했습니다: {error}</Text>
                        ) : recentUsers.length > 0 ? (
                            recentUsers.map((user) => (
                                <View key={user.id} style={styles.userItem}>
                                    <View style={styles.userAvatar}>
                                        <FontAwesomeIcon
                                            className="fas fa-user"
                                            style={{
                                                fontSize: '16px',
                                                color: '#fff'
                                            }}
                                        />
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{user.name || '이름 없음'}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>등록된 사용자가 없습니다.</Text>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    dashboard: {
        padding: 0,
    },
    statsGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        gap: 16,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        flex: 1,
        minWidth: 200,
        borderLeftWidth: 4,
    },
    statHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        lineHeight: 28,
    },
    statTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    contentGrid: {
        display: 'flex',
        flexDirection: 'row',
        gap: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        flex: 1,
    },
    cardHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    cardBody: {
        padding: 16,
    },
    activityItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3498db',
        marginRight: 12,
        marginTop: 6,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: 14,
        color: '#2c3e50',
        lineHeight: 20,
    },
    activityTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    userItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3498db',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2c3e50',
        lineHeight: 18,
    },
    userEmail: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 14,
        color: '#e74c3c',
        textAlign: 'center',
        padding: 20,
    },
    noDataText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
});

export default AdminDashboard;
