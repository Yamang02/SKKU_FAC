import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Link } from 'react-router-dom';

import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Icon } from '../../components/common';
import { useUsers } from '../../hooks';
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
    } = useUsers();

    // Select 컴포넌트
    const Select = ({ value, onChange, children, style }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={Object.assign({}, styles.select, style)}
        >
            {children}
        </select>
    );

    // 배지 컴포넌트
    const Badge = ({ type, value, displayValue }) => {
        let badgeStyle = styles.badge;

        // 안전한 value 처리
        const safeValue = value || '';
        const safeDisplayValue = displayValue || value || '-';

        if (type === 'role') {
            switch (safeValue.toLowerCase()) {
                case 'admin': badgeStyle = Object.assign({}, styles.badge, styles.badgeAdmin); break;
                case 'skku_member': badgeStyle = Object.assign({}, styles.badge, styles.badgeSkku); break;
                case 'external_member': badgeStyle = Object.assign({}, styles.badge, styles.badgeExternal); break;
                default: badgeStyle = styles.badge;
            }
        } else if (type === 'status') {
            switch (safeValue.toLowerCase()) {
                case 'active': badgeStyle = Object.assign({}, styles.badge, styles.badgeActive); break;
                case 'inactive': badgeStyle = Object.assign({}, styles.badge, styles.badgeInactive); break;
                case 'blocked': badgeStyle = Object.assign({}, styles.badge, styles.badgeBlocked); break;
                case 'unverified': badgeStyle = Object.assign({}, styles.badge, styles.badgeUnverified); break;
                default: badgeStyle = styles.badge;
            }
        }

        return (
            <View style={badgeStyle}>
                <Text style={styles.badgeText}>{safeDisplayValue}</Text>
            </View>
        );
    };

    if (loading && users.length === 0) {
        return (
            <AdminLayout currentPage="users">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>회원 관리</Text>
                        <Text style={styles.subtitle}>등록된 회원들을 관리할 수 있습니다</Text>
                    </View>
                    <Card>
                        <View style={styles.loadingContainer}>
                            <Icon name="users" size={48} color="#9ca3af" />
                            <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
                        </View>
                    </Card>
                </View>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout currentPage="users">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>회원 관리</Text>
                    <Text style={styles.subtitle}>등록된 회원들을 관리할 수 있습니다</Text>
                </View>

                {error && (
                    <Card style={styles.errorCard}>
                        <View style={styles.errorContent}>
                            <Icon name="warning" size={24} color="#ef4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    </Card>
                )}

                {/* 통계 섹션 */}
                <Card>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{total}</Text>
                            <Text style={styles.statLabel}>총 회원수</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{(users || []).filter(u => u && u.id && u.status === 'ACTIVE').length}</Text>
                            <Text style={styles.statLabel}>활성 회원</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{(users || []).filter(u => u && u.id && u.role === 'ADMIN').length}</Text>
                            <Text style={styles.statLabel}>관리자</Text>
                        </View>
                    </View>
                </Card>

                {/* 필터 섹션 */}
                <Card>
                    <Text style={styles.sectionTitle}>검색 및 필터</Text>
                    <View style={styles.filterContainer}>
                        <View style={styles.filterRow}>
                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>회원 상태</Text>
                                <Select
                                    value={filters.status}
                                    onChange={(value) => handleFilterChange('status', value)}
                                >
                                    <option value="">전체</option>
                                    <option value="ACTIVE">활성</option>
                                    <option value="INACTIVE">비활성</option>
                                    <option value="BLOCKED">차단</option>
                                    <option value="UNVERIFIED">미인증</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>회원 역할</Text>
                                <Select
                                    value={filters.role}
                                    onChange={(value) => handleFilterChange('role', value)}
                                >
                                    <option value="">전체</option>
                                    <option value="ADMIN">관리자</option>
                                    <option value="SKKU_MEMBER">성균관대 구성원</option>
                                    <option value="EXTERNAL_MEMBER">외부인</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>검색어</Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="이름, 아이디, 이메일 검색"
                                    value={filters.keyword}
                                    onChangeText={(value) => handleFilterChange('keyword', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.filterActions}>
                            <Button
                                title="초기화"
                                icon="reset"
                                onPress={resetFilters}
                                variant="secondary"
                            />
                        </View>
                    </View>
                </Card>

                {/* 테이블 섹션 */}
                <Card padding={0}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableTitle}>회원 목록</Text>
                        <Text style={styles.tableCount}>총 {(users || []).length}개 항목</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.table}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 120 })}>아이디</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 100 })}>역할</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 100 })}>이름</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 200 })}>이메일</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 150 })}>소속정보</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 120 })}>가입일</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 100 })}>상태</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 80 })}>작업</Text>
                            </View>

                            <ScrollView style={styles.tableBody}>
                                {(users || []).length > 0 ? (
                                    (users || []).filter(user => user && user.id).map(user => {
                                        // 추가 방어 코드: user 객체와 필수 속성들 체크
                                        if (!user || !user.id) {
                                            console.warn('Invalid user data:', user);
                                            return null;
                                        }

                                        return (
                                            <View key={user.id} style={styles.tableRow}>
                                                <Text style={Object.assign({}, styles.tableCell, { width: 120 })}>{user.username || '-'}</Text>
                                                <View style={Object.assign({}, styles.tableCell, { width: 100 })}>
                                                    <Badge type="role" value={user.role || ''} displayValue={user.roleDisplayName || user.role || '-'} />
                                                </View>
                                                <Text style={Object.assign({}, styles.tableCell, { width: 100 })}>{user.name || '-'}</Text>
                                                <Text style={Object.assign({}, styles.tableCell, { width: 200 })}>{user.email || '-'}</Text>
                                                <Text style={Object.assign({}, styles.tableCell, { width: 150 })}>{user.profileSummary || '-'}</Text>
                                                <Text style={Object.assign({}, styles.tableCell, { width: 120 })}>{user.createdAtFormatted || '-'}</Text>
                                                <View style={Object.assign({}, styles.tableCell, { width: 100 })}>
                                                    <Badge type="status" value={user.status || ''} displayValue={user.statusDisplayName || user.status || '-'} />
                                                </View>
                                                <View style={Object.assign({}, styles.tableCell, { width: 80 })}>
                                                    <Link to={`/admin/users/${user.id}`} style={styles.linkStyle}>
                                                        <Button
                                                            title=""
                                                            icon="edit"
                                                            variant="primary"
                                                            size="small"
                                                        />
                                                    </Link>
                                                </View>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Icon name="users" size={48} color="#9ca3af" />
                                        <Text style={styles.emptyText}>등록된 회원이 없습니다</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </Card>
            </View>
        </AdminLayout>
    );
};

// 상수 적용한 스타일
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: sizes.spacing.lg,
        backgroundColor: adminColors.background,
    },
    header: {
        marginBottom: sizes.spacing.lg,
    },
    title: {
        fontSize: sizes.fontSize.title,
        fontWeight: 'bold',
        color: adminColors.textPrimary,
        marginBottom: sizes.spacing.sm,
    },
    subtitle: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textSecondary,
    },
    // ... 나머지 스타일들은 기존과 동일하되 colors/sizes 상수 적용
    loadingContainer: {
        alignItems: 'center',
        padding: sizes.spacing.xxl,
    },
    loadingText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textSecondary,
        marginTop: sizes.spacing.md,
    },
    errorCard: {
        backgroundColor: adminColors.badge.blockedBackground,
        borderColor: adminColors.badge.blocked,
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.badge.blocked,
        marginLeft: sizes.spacing.sm,
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: sizes.spacing.md,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: sizes.fontSize.xxl,
        fontWeight: 'bold',
        color: adminColors.primary,
        marginBottom: sizes.spacing.xs,
    },
    statLabel: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textSecondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: adminColors.border,
    },
    sectionTitle: {
        fontSize: sizes.fontSize.lg,
        fontWeight: '600',
        color: adminColors.textPrimary,
        marginBottom: sizes.spacing.md,
    },
    filterContainer: {
        gap: sizes.spacing.md,
    },
    filterRow: {
        flexDirection: 'row',
        gap: sizes.spacing.md,
        flexWrap: 'wrap',
    },
    filterItem: {
        flex: 1,
        minWidth: 200,
    },
    filterLabel: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textSecondary,
        marginBottom: sizes.spacing.xs,
        fontWeight: '500',
    },
    filterActions: {
        flexDirection: 'row',
        gap: sizes.spacing.sm,
        justifyContent: 'flex-end',
    },
    select: {
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.md,
        paddingHorizontal: sizes.spacing.sm,
        paddingVertical: sizes.spacing.sm,
        fontSize: sizes.fontSize.sm,
        backgroundColor: adminColors.white,
        minHeight: 40,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.md,
        paddingHorizontal: sizes.spacing.sm,
        paddingVertical: sizes.spacing.sm,
        fontSize: sizes.fontSize.sm,
        backgroundColor: adminColors.white,
        minHeight: 40,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: sizes.spacing.lg,
        paddingVertical: sizes.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
    },
    tableTitle: {
        fontSize: sizes.fontSize.lg,
        fontWeight: '600',
        color: adminColors.textPrimary,
    },
    tableCount: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textSecondary,
    },
    table: {
        minWidth: 1000,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: adminColors.gray50,
        paddingVertical: sizes.spacing.sm,
    },
    tableHeaderCell: {
        fontSize: sizes.fontSize.sm,
        fontWeight: '600',
        color: adminColors.textPrimary,
        paddingHorizontal: sizes.spacing.sm,
        textAlign: 'center',
    },
    tableBody: {
        maxHeight: 400,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: adminColors.borderLight,
        paddingVertical: sizes.spacing.sm,
    },
    tableCell: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textPrimary,
        paddingHorizontal: sizes.spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    badge: {
        paddingHorizontal: sizes.spacing.sm,
        paddingVertical: sizes.spacing.xs,
        borderRadius: sizes.borderRadius.sm,
        backgroundColor: adminColors.gray100,
        borderWidth: 1,
        borderColor: adminColors.border,
    },
    badgeText: {
        fontSize: sizes.fontSize.xs,
        fontWeight: '500',
        textAlign: 'center',
    },
    badgeAdmin: {
        backgroundColor: adminColors.badge.adminBackground,
        borderColor: adminColors.badge.admin,
    },
    badgeSkku: {
        backgroundColor: adminColors.badge.skkuBackground,
        borderColor: adminColors.badge.skku,
    },
    badgeExternal: {
        backgroundColor: adminColors.badge.externalBackground,
        borderColor: adminColors.badge.external,
    },
    badgeActive: {
        backgroundColor: adminColors.badge.activeBackground,
        borderColor: adminColors.badge.active,
    },
    badgeInactive: {
        backgroundColor: adminColors.badge.inactiveBackground,
        borderColor: adminColors.badge.inactive,
    },
    badgeBlocked: {
        backgroundColor: adminColors.badge.blockedBackground,
        borderColor: adminColors.badge.blocked,
    },
    badgeUnverified: {
        backgroundColor: adminColors.badge.unverifiedBackground,
        borderColor: adminColors.badge.unverified,
    },
    linkStyle: {
        // textDecoration은 React Native Web에서 지원하지 않음
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: sizes.spacing.xxl,
    },
    emptyText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textSecondary,
        marginTop: sizes.spacing.md,
    },
});

export default UserListScreen;
