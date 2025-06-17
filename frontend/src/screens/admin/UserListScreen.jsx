import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Link } from 'react-router-dom';

import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Icon } from '../../components/common';
import { useAdminUsers } from '../../hooks';
import { adminColors, sizes } from '../../constants';

const UserListScreen = () => {
    const {
        users,
        loading,
        error,
        total,
        page,
        filters,
        handleFilterChange,
        handlePageChange,
        resetFilters,
        reload,
    } = useAdminUsers();

    // 필터 핸들러
    const handleStatusFilter = (status) => {
        handleFilterChange({ ...filters, status });
    };

    const handleRoleFilter = (role) => {
        handleFilterChange({ ...filters, role });
    };

    const handleKeywordFilter = (keyword) => {
        handleFilterChange({ ...filters, keyword });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        reload();
    };

    if (loading && users.length === 0) {
        return (
            <AdminLayout>
                <View style={styles.container}>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>사용자 목록을 불러오는 중...</Text>
                    </View>
                </View>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <View style={styles.container}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <Text style={styles.title}>사용자 관리</Text>
                    <Text style={styles.subtitle}>
                        총 {total}명의 사용자 • 페이지 {page}
                    </Text>
                </View>

                {/* 필터 섹션 */}
                <Card style={styles.filterCard}>
                    <View style={styles.filterSection}>
                        <Text style={styles.filterTitle}>필터 및 검색</Text>

                        {/* 검색 */}
                        <View style={styles.searchRow}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="이름, 이메일로 검색..."
                                value={filters.keyword}
                                onChangeText={handleKeywordFilter}
                                onSubmitEditing={handleSearchSubmit}
                            />
                            <Button
                                title="검색"
                                onPress={handleSearchSubmit}
                                style={styles.searchButton}
                            />
                        </View>

                        {/* 상태 필터 */}
                        <View style={styles.filterRow}>
                            <Text style={styles.filterLabel}>상태:</Text>
                            <View style={styles.filterButtons}>
                                <Button
                                    title="전체"
                                    variant={filters.status === '' ? 'primary' : 'outline'}
                                    onPress={() => handleStatusFilter('')}
                                    style={styles.filterButton}
                                />
                                <Button
                                    title="활성"
                                    variant={filters.status === 'ACTIVE' ? 'primary' : 'outline'}
                                    onPress={() => handleStatusFilter('ACTIVE')}
                                    style={styles.filterButton}
                                />
                                <Button
                                    title="비활성"
                                    variant={filters.status === 'INACTIVE' ? 'primary' : 'outline'}
                                    onPress={() => handleStatusFilter('INACTIVE')}
                                    style={styles.filterButton}
                                />
                            </View>
                        </View>

                        {/* 역할 필터 */}
                        <View style={styles.filterRow}>
                            <Text style={styles.filterLabel}>역할:</Text>
                            <View style={styles.filterButtons}>
                                <Button
                                    title="전체"
                                    variant={filters.role === '' ? 'primary' : 'outline'}
                                    onPress={() => handleRoleFilter('')}
                                    style={styles.filterButton}
                                />
                                <Button
                                    title="사용자"
                                    variant={filters.role === 'USER' ? 'primary' : 'outline'}
                                    onPress={() => handleRoleFilter('USER')}
                                    style={styles.filterButton}
                                />
                                <Button
                                    title="관리자"
                                    variant={filters.role === 'ADMIN' ? 'primary' : 'outline'}
                                    onPress={() => handleRoleFilter('ADMIN')}
                                    style={styles.filterButton}
                                />
                            </View>
                        </View>

                        {/* 필터 리셋 */}
                        <View style={styles.resetRow}>
                            <Button
                                title="필터 초기화"
                                variant="outline"
                                onPress={resetFilters}
                                style={styles.resetButton}
                            />
                        </View>
                    </View>
                </Card>

                {/* 에러 표시 */}
                {error && (
                    <Card style={styles.errorCard}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Button
                            title="다시 시도"
                            onPress={reload}
                            style={styles.retryButton}
                        />
                    </Card>
                )}

                {/* 사용자 목록 */}
                <ScrollView style={styles.listContainer}>
                    {users.map((user) => (
                        <Card key={user.id} style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <View style={styles.userMainInfo}>
                                    <Text style={styles.userName}>{user.name}</Text>
                                    <Text style={styles.userEmail}>{user.email}</Text>
                                </View>

                                <View style={styles.userMetaInfo}>
                                    <View style={styles.badgeContainer}>
                                        <View style={[
                                            styles.badge,
                                            user.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge
                                        ]}>
                                            <Text style={styles.badgeText}>
                                                {user.status === 'ACTIVE' ? '활성' : '비활성'}
                                            </Text>
                                        </View>
                                        <View style={[
                                            styles.badge,
                                            user.role === 'ADMIN' ? styles.adminBadge : styles.userBadge
                                        ]}>
                                            <Text style={styles.badgeText}>
                                                {user.role === 'ADMIN' ? '관리자' : '사용자'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.userDate}>
                                        가입일: {new Date(user.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.userActions}>
                                <Link to={`/admin/users/${user.id}`} style={styles.actionLink}>
                                    <Button
                                        title="상세보기"
                                        variant="primary"
                                        style={styles.actionButton}
                                    />
                                </Link>
                            </View>
                        </Card>
                    ))}
                </ScrollView>

                {/* 페이지네이션 */}
                {total > 10 && (
                    <View style={styles.pagination}>
                        <Button
                            title="이전"
                            variant="outline"
                            disabled={page <= 1}
                            onPress={() => handlePageChange(page - 1)}
                            style={styles.paginationButton}
                        />

                        <Text style={styles.pageInfo}>
                            {page} / {Math.ceil(total / 10)}
                        </Text>

                        <Button
                            title="다음"
                            variant="outline"
                            disabled={page >= Math.ceil(total / 10)}
                            onPress={() => handlePageChange(page + 1)}
                            style={styles.paginationButton}
                        />
                    </View>
                )}

                {/* 로딩 오버레이 */}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>불러오는 중...</Text>
                    </View>
                )}
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: sizes.padding,
        backgroundColor: adminColors.background,
    },
    header: {
        marginBottom: sizes.padding,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: adminColors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: adminColors.textSecondary,
    },
    filterCard: {
        marginBottom: sizes.padding,
        padding: sizes.padding,
    },
    filterSection: {
        gap: sizes.margin,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: adminColors.text,
        marginBottom: sizes.margin,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.margin,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    searchButton: {
        minWidth: 80,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.margin,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: adminColors.text,
        minWidth: 60,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    filterButton: {
        minWidth: 80,
    },
    resetRow: {
        alignItems: 'flex-end',
    },
    resetButton: {
        minWidth: 100,
    },
    errorCard: {
        backgroundColor: '#fee',
        borderColor: '#fcc',
        marginBottom: sizes.padding,
        padding: sizes.padding,
    },
    errorText: {
        color: '#c33',
        marginBottom: sizes.margin,
    },
    retryButton: {
        alignSelf: 'flex-start',
    },
    listContainer: {
        flex: 1,
    },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: sizes.padding,
        marginBottom: sizes.margin,
    },
    userInfo: {
        flex: 1,
        gap: sizes.margin,
    },
    userMainInfo: {
        gap: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: adminColors.text,
    },
    userEmail: {
        fontSize: 14,
        color: adminColors.textSecondary,
    },
    userMetaInfo: {
        gap: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadge: {
        backgroundColor: '#e8f5e8',
    },
    inactiveBadge: {
        backgroundColor: '#fee',
    },
    adminBadge: {
        backgroundColor: '#e8f2ff',
    },
    userBadge: {
        backgroundColor: '#f8f9fa',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: adminColors.text,
    },
    userDate: {
        fontSize: 12,
        color: adminColors.textSecondary,
    },
    userActions: {
        marginLeft: sizes.margin,
    },
    actionLink: {
        textDecoration: 'none',
    },
    actionButton: {
        minWidth: 80,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes.padding,
        paddingVertical: sizes.padding,
    },
    paginationButton: {
        minWidth: 60,
    },
    pageInfo: {
        fontSize: 14,
        color: adminColors.text,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: adminColors.textSecondary,
    },
});

export default UserListScreen;
