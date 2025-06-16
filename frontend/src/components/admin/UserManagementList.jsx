import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Link } from 'react-router-dom';
import UserApi from '../../api/UserApi.js';
import { showErrorMessage, showSuccessMessage } from '../../utils/notification.js';
import AdminLayout from './AdminLayout.jsx';

const UserManagementList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        status: '',
        role: '',
        keyword: '',
        page: 1
    });
    const [page, setPage] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 10
    });

    // 사용자 목록 불러오기
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const pagination = {
                page: filters.page,
                limit: 10
            };

            const filterParams = {
                ...(filters.status && { status: filters.status }),
                ...(filters.role && { role: filters.role }),
                ...(filters.keyword && { keyword: filters.keyword })
            };

            const response = await UserApi.getUserList(pagination, filterParams);

            if (response.success) {
                setUsers(response.data.users || []);
                setTotal(response.data.total || 0);
                setPage({
                    currentPage: response.data.page?.currentPage || 1,
                    totalPages: response.data.page?.totalPages || 1,
                    limit: response.data.page?.limit || 10
                });
            } else {
                setError(response.error || '사용자 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('사용자 목록 로딩 오류:', err);
            setError('사용자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [filters]);

    // 필터 변경 핸들러
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 1 // 필터 변경 시 첫 페이지로
        }));
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    // 필터 초기화
    const handleFilterReset = () => {
        setFilters({
            status: '',
            role: '',
            keyword: '',
            page: 1
        });
    };

    // Select 컴포넌트
    const Select = ({ value, onChange, children, style }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...styles.select, ...style }}
        >
            {children}
        </select>
    );

    // 배지 스타일 헬퍼
    // Helper function to combine table cell styles
    const getCellStyle = (baseStyle, width) => {
        return { ...baseStyle, width };
    };

    const getBadgeStyle = (type, value) => {
        const baseStyle = styles.badge;
        if (type === 'role') {
            switch (value?.toLowerCase()) {
                case 'admin': return { ...baseStyle, ...styles.badgeAdmin };
                case 'skku_member': return { ...baseStyle, ...styles.badgeSkku };
                case 'external_member': return { ...baseStyle, ...styles.badgeExternal };
                default: return baseStyle;
            }
        } else if (type === 'status') {
            switch (value?.toLowerCase()) {
                case 'active': return { ...baseStyle, ...styles.badgeActive };
                case 'inactive': return { ...baseStyle, ...styles.badgeInactive };
                case 'blocked': return { ...baseStyle, ...styles.badgeBlocked };
                case 'unverified': return { ...baseStyle, ...styles.badgeUnverified };
                default: return baseStyle;
            }
        }
        return baseStyle;
    };

    if (loading && users.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>회원목록</Text>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
                </View>
            </View>
        );
    }

    return (
        <AdminLayout currentPage="users">
            <View style={styles.container}>
                <Text style={styles.title}>회원목록</Text>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* 컨트롤 섹션 */}
                <View style={styles.controlSection}>
                    <Text style={styles.infoText}>총 {total}명의 회원</Text>
                </View>

                {/* 필터 섹션 */}
                <View style={styles.filterSection}>
                    <View style={styles.filterGroup}>
                        <View style={styles.filterItem}>
                            <Select
                                value={filters.status}
                                onChange={(value) => handleFilterChange('status', value)}
                            >
                                <option value="">회원 상태</option>
                                <option value="ACTIVE">활성</option>
                                <option value="INACTIVE">비활성</option>
                                <option value="BLOCKED">차단</option>
                                <option value="UNVERIFIED">미인증</option>
                            </Select>
                        </View>

                        <View style={styles.filterItem}>
                            <Select
                                value={filters.role}
                                onChange={(value) => handleFilterChange('role', value)}
                            >
                                <option value="">회원 역할</option>
                                <option value="ADMIN">관리자</option>
                                <option value="SKKU_MEMBER">성균관대 구성원</option>
                                <option value="EXTERNAL_MEMBER">외부인</option>
                            </Select>
                        </View>

                        <View style={styles.filterItem}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="이름, 아이디, 이메일 검색"
                                value={filters.keyword}
                                onChangeText={(value) => handleFilterChange('keyword', value)}
                            />
                        </View>

                        <View style={styles.filterItem}>
                            <TouchableOpacity style={styles.primaryButton} onPress={loadUsers}>
                                <Text style={styles.buttonText}>🔍 필터 적용</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterItem}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={handleFilterReset}>
                                <Text style={styles.buttonText}>초기화</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 테이블 섹션 */}
                <View style={styles.tableContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={getCellStyle(styles.tableHeaderCell, 120)}>아이디</Text>
                                <Text style={getCellStyle(styles.tableHeaderCell, 100)}>역할</Text>
                                <Text style={getCellStyle(styles.tableHeaderCell, 100)}>이름</Text>
                                <Text style={getCellStyle(styles.tableHeaderCell, 200)}>이메일</Text>
                                <Text style={getCellStyle(styles.tableHeaderCell, 150)}>소속정보</Text>
                                <Text style={getCellStyle(styles.tableHeaderCell, 120)}>가입일</Text>
                                <Text style={getCellStyle(styles.tableHeaderCell, 100)}>상태</Text>
                                <Text style={getCellStyle(styles.tableHeaderCell, 80)}>작업</Text>
                            </View>

                            <ScrollView style={styles.tableBody}>
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <View key={user.id} style={styles.tableRow}>
                                            <Text style={getCellStyle(styles.tableCell, 120)}>{user.username}</Text>
                                            <View style={getCellStyle(styles.tableCell, 100)}>
                                                <View style={getBadgeStyle('role', user.role)}>
                                                    <Text style={styles.badgeText}>{user.roleDisplayName}</Text>
                                                </View>
                                            </View>
                                            <Text style={getCellStyle(styles.tableCell, 100)}>{user.name}</Text>
                                            <Text style={getCellStyle(styles.tableCell, 200)}>{user.email}</Text>
                                            <Text style={getCellStyle(styles.tableCell, 150)}>{user.profileSummary}</Text>
                                            <Text style={getCellStyle(styles.tableCell, 120)}>{user.createdAtFormatted}</Text>
                                            <View style={getCellStyle(styles.tableCell, 100)}>
                                                <View style={getBadgeStyle('status', user.status)}>
                                                    <Text style={styles.badgeText}>{user.statusDisplayName}</Text>
                                                </View>
                                            </View>
                                            <View style={getCellStyle(styles.tableCell, 80)}>
                                                <Link to={`/admin/users/${user.id}`} style={styles.linkStyle}>
                                                    <View style={styles.detailButton}>
                                                        <Text style={styles.buttonText}>✏️</Text>
                                                    </View>
                                                </Link>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyRow}>
                                        <Text style={styles.emptyText}>
                                            {loading ? '데이터를 불러오는 중...' : '등록된 회원이 없습니다.'}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>

                    {/* 페이지네이션 */}
                    {page.totalPages > 1 && (
                        <View style={styles.pagination}>
                            {/* 첫 페이지 */}
                            <View style={styles.paginationItem}>
                                <TouchableOpacity
                                    style={{
                                        ...styles.paginationButton,
                                        ...(page.currentPage === 1 && styles.disabledButton)
                                    }}
                                    onPress={() => page.currentPage !== 1 && handlePageChange(1)}
                                    disabled={page.currentPage === 1}
                                >
                                    <Text style={styles.paginationText}>《</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 이전 페이지 */}
                            <View style={styles.paginationItem}>
                                <TouchableOpacity
                                    style={{
                                        ...styles.paginationButton,
                                        ...(page.currentPage === 1 && styles.disabledButton)
                                    }}
                                    onPress={() => page.currentPage > 1 && handlePageChange(page.currentPage - 1)}
                                    disabled={page.currentPage === 1}
                                >
                                    <Text style={styles.paginationText}>‹</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 페이지 번호들 */}
                            {Array.from({ length: Math.min(5, page.totalPages) }, (_, i) => {
                                const startPage = Math.max(1, page.currentPage - 2);
                                const pageNum = startPage + i;
                                if (pageNum > page.totalPages) return null;

                                return (
                                    <View key={pageNum} style={styles.paginationItem}>
                                        <TouchableOpacity
                                            style={{
                                                ...styles.paginationButton,
                                                ...(pageNum === page.currentPage && styles.activePaginationButton)
                                            }}
                                            onPress={() => handlePageChange(pageNum)}
                                        >
                                            <Text style={{
                                                ...styles.paginationText,
                                                ...(pageNum === page.currentPage && styles.activePaginationText)
                                            }}>
                                                {pageNum}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}

                            {/* 다음 페이지 */}
                            <View style={styles.paginationItem}>
                                <TouchableOpacity
                                    style={{
                                        ...styles.paginationButton,
                                        ...(page.currentPage === page.totalPages && styles.disabledButton)
                                    }}
                                    onPress={() => page.currentPage < page.totalPages && handlePageChange(page.currentPage + 1)}
                                    disabled={page.currentPage === page.totalPages}
                                >
                                    <Text style={styles.paginationText}>›</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 마지막 페이지 */}
                            <View style={styles.paginationItem}>
                                <TouchableOpacity
                                    style={{
                                        ...styles.paginationButton,
                                        ...(page.currentPage === page.totalPages && styles.disabledButton)
                                    }}
                                    onPress={() => page.currentPage !== page.totalPages && handlePageChange(page.totalPages)}
                                    disabled={page.currentPage === page.totalPages}
                                >
                                    <Text style={styles.paginationText}>》</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    loadingText: {
        fontSize: 16,
        color: '#6c757d',
    },
    errorContainer: {
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        marginBottom: 20,
    },
    errorText: {
        color: '#721c24',
    },
    controlSection: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#6c757d',
    },
    filterSection: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    filterGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    filterItem: {
        marginRight: 10,
        marginBottom: 10,
    },
    select: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        fontSize: 14,
        minWidth: 150,
        backgroundColor: 'white',
    },
    searchInput: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        fontSize: 14,
        minWidth: 200,
        flex: 1,
        backgroundColor: 'white',
    },
    primaryButton: {
        backgroundColor: '#4a90e2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        backgroundColor: '#6c757d',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    table: {
        minWidth: 1000,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e4e8',
        paddingVertical: 12,
    },
    tableHeaderCell: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    tableBody: {
        maxHeight: 400,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e4e8',
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    tableCell: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
    },
    badgeAdmin: { backgroundColor: '#3b82f6' },
    badgeSkku: { backgroundColor: '#8b5cf6' },
    badgeExternal: { backgroundColor: '#6366f1' },
    badgeActive: { backgroundColor: '#10b981' },
    badgeInactive: { backgroundColor: '#6b7280' },
    badgeBlocked: { backgroundColor: '#ef4444' },
    badgeUnverified: { backgroundColor: '#f59e0b' },
    linkStyle: {
        textDecoration: 'none',
    },
    detailButton: {
        backgroundColor: '#64748b',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyRow: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    paginationItem: {
        marginHorizontal: 4,
    },
    paginationButton: {
        backgroundColor: '#4a90e2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        minWidth: 32,
        alignItems: 'center',
    },
    activePaginationButton: {
        backgroundColor: '#2563eb',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    paginationText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    activePaginationText: {
        fontWeight: 'bold',
    },
    // 테이블 셀 너비 스타일들
    cellWidth120: { width: 120 },
    cellWidth100: { width: 100 },
    cellWidth200: { width: 200 },
    cellWidth150: { width: 150 },
    cellWidth80: { width: 80 },
});

export default UserManagementList;
