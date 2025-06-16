import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import UserApi from '../api/UserApi';
import { showErrorMessage, showSuccessMessage, showConfirm } from '../utils/notification';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        role: 'all',
        status: 'all'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0
    });

    // 사용자 목록 로드
    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await UserApi.getUserList(
                { page: pagination.page, limit: pagination.limit },
                filters
            );

            if (response.success) {
                setUsers(response.data.users || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination?.totalPages || 1,
                    totalItems: response.data.pagination?.totalItems || 0
                }));
            }
        } catch (error) {
            console.error('사용자 목록 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 사용자 목록 로드
    useEffect(() => {
        loadUsers();
    }, [pagination.page, filters]);

    // 필터 변경 핸들러
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // 필터 변경 시 첫 페이지로
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // 사용자 상태 변경
    const handleUserStatusChange = async (userId, newStatus) => {
        const confirmed = await showConfirm(
            '상태 변경 확인',
            `사용자 상태를 ${newStatus}로 변경하시겠습니까?`
        );

        if (confirmed) {
            try {
                // 여기에 상태 변경 API 호출 로직 추가
                showSuccessMessage(`사용자 상태가 ${newStatus}로 변경되었습니다.`);
                loadUsers(); // 목록 새로고침
            } catch (error) {
                showErrorMessage('상태 변경에 실패했습니다.');
            }
        }
    };

    // 로딩 중 표시
    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>사용자 목록을 불러오는 중...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>사용자 관리</Text>

            {/* 필터 섹션 */}
            <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="사용자명, 이메일 검색..."
                        value={filters.keyword}
                        onChangeText={(text) => handleFilterChange('keyword', text)}
                    />

                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>역할:</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => {
                                // 여기에 역할 선택 드롭다운 로직 추가
                                console.log('역할 선택');
                            }}
                        >
                            <Text style={styles.selectText}>
                                {filters.role === 'all' ? '전체' : filters.role}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>상태:</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => {
                                // 여기에 상태 선택 드롭다운 로직 추가
                                console.log('상태 선택');
                            }}
                        >
                            <Text style={styles.selectText}>
                                {filters.status === 'all' ? '전체' : filters.status}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* 사용자 목록 */}
            <ScrollView style={styles.userList}>
                {users.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>등록된 사용자가 없습니다.</Text>
                    </View>
                ) : (
                    users.map((user) => (
                        <View key={user.id} style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name || user.username}</Text>
                                <Text style={styles.userEmail}>{user.email}</Text>
                                <Text style={styles.userRole}>역할: {user.role}</Text>
                                <Text style={styles.userStatus}>상태: {user.status}</Text>
                            </View>

                            <View style={styles.userActions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => console.log('사용자 상세보기:', user.id)}
                                >
                                    <Text style={styles.actionButtonText}>상세보기</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.statusButton]}
                                    onPress={() => handleUserStatusChange(user.id, 'inactive')}
                                >
                                    <Text style={styles.actionButtonText}>상태변경</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* 페이지네이션 */}
            <View style={styles.pagination}>
                <TouchableOpacity
                    style={[styles.pageButton, pagination.page === 1 && styles.pageButtonDisabled]}
                    onPress={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                >
                    <Text style={styles.pageButtonText}>이전</Text>
                </TouchableOpacity>

                <Text style={styles.pageInfo}>
                    {pagination.page} / {pagination.totalPages} 페이지
                    (총 {pagination.totalItems}명)
                </Text>

                <TouchableOpacity
                    style={[styles.pageButton, pagination.page === pagination.totalPages && styles.pageButtonDisabled]}
                    onPress={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                >
                    <Text style={styles.pageButtonText}>다음</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333'
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 50
    },
    filterSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 14
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    selectLabel: {
        fontSize: 14,
        color: '#666'
    },
    selectButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 8,
        minWidth: 80,
        backgroundColor: '#fff'
    },
    selectText: {
        fontSize: 14,
        textAlign: 'center'
    },
    userList: {
        flex: 1
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 50
    },
    emptyText: {
        fontSize: 16,
        color: '#666'
    },
    userCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    userInfo: {
        flex: 1
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2
    },
    userRole: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2
    },
    userStatus: {
        fontSize: 12,
        color: '#888'
    },
    userActions: {
        flexDirection: 'row',
        gap: 10
    },
    actionButton: {
        backgroundColor: '#007bff',
        padding: 8,
        borderRadius: 6,
        minWidth: 70
    },
    statusButton: {
        backgroundColor: '#ffc107'
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8
    },
    pageButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 6,
        minWidth: 60
    },
    pageButtonDisabled: {
        backgroundColor: '#ccc'
    },
    pageButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    pageInfo: {
        fontSize: 14,
        color: '#666'
    }
});

export default AdminUsers;
