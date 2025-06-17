import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Link } from 'react-router-dom';

import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Icon } from '../../components/common';
import { useExhibitions } from '../../hooks';
import { adminColors, sizes } from '../../constants';

const ExhibitionListScreen = () => {
    const {
        exhibitions,
        loading,
        error,
        total,
        page,
        filters,
        handleFilterChange,
        handlePageChange,
        resetFilters,
        toggleFeatured,
    } = useExhibitions();

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

        if (type === 'exhibitionType') {
            switch (value?.toLowerCase()) {
                case 'regular': badgeStyle = Object.assign({}, styles.badge, styles.badgeRegular); break;
                case 'special': badgeStyle = Object.assign({}, styles.badge, styles.badgeSpecial); break;
                default: badgeStyle = styles.badge;
            }
        } else if (type === 'submission') {
            switch (value) {
                case true: badgeStyle = Object.assign({}, styles.badge, styles.badgeOpen); break;
                case false: badgeStyle = Object.assign({}, styles.badge, styles.badgeClosed); break;
                default: badgeStyle = styles.badge;
            }
        }

        return (
            <View style={badgeStyle}>
                <Text style={styles.badgeText}>{displayValue}</Text>
            </View>
        );
    };

    // 썸네일 컴포넌트
    const Thumbnail = ({ imageUrl, title }) => {
        if (imageUrl) {
            return (
                <img
                    src={imageUrl}
                    alt={title}
                    style={styles.thumbnail}
                />
            );
        }
        return (
            <View style={styles.noThumbnail}>
                <Icon name="image" size={20} color="#9ca3af" />
                <Text style={styles.noThumbnailText}>미등록</Text>
            </View>
        );
    };

    // 연도 옵션 생성
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear + 1; year >= currentYear - 5; year--) {
            years.push(year);
        }
        return years;
    };

    if (loading && exhibitions.length === 0) {
        return (
            <AdminLayout currentPage="exhibitions">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>전시 관리</Text>
                        <Text style={styles.subtitle}>등록된 전시들을 관리할 수 있습니다</Text>
                    </View>
                    <Card>
                        <View style={styles.loadingContainer}>
                            <Icon name="image" size={48} color="#9ca3af" />
                            <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
                        </View>
                    </Card>
                </View>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout currentPage="exhibitions">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>전시 관리</Text>
                    <Text style={styles.subtitle}>등록된 전시들을 관리할 수 있습니다</Text>
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
                            <Text style={styles.statLabel}>총 전시수</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {exhibitions.filter(e => e.isSubmissionOpen).length}
                            </Text>
                            <Text style={styles.statLabel}>출품 가능</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {exhibitions.filter(e => e.isFeatured).length}
                            </Text>
                            <Text style={styles.statLabel}>주요 전시</Text>
                        </View>
                    </View>
                </Card>

                {/* 필터 섹션 */}
                <Card>
                    <Text style={styles.sectionTitle}>검색 및 필터</Text>
                    <View style={styles.filterContainer}>
                        <View style={styles.filterRow}>
                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>전시 유형</Text>
                                <Select
                                    value={filters.exhibitionType}
                                    onChange={(value) => handleFilterChange('exhibitionType', value)}
                                >
                                    <option value="">전체</option>
                                    <option value="regular">정기</option>
                                    <option value="special">특별</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>주요 전시 여부</Text>
                                <Select
                                    value={filters.featured}
                                    onChange={(value) => handleFilterChange('featured', value)}
                                >
                                    <option value="">전체</option>
                                    <option value="true">주요 전시</option>
                                    <option value="false">일반 전시</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>연도</Text>
                                <Select
                                    value={filters.year}
                                    onChange={(value) => handleFilterChange('year', value)}
                                >
                                    <option value="">전체</option>
                                    {generateYearOptions().map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>검색어</Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="전시명, 장소 검색"
                                    value={filters.keyword}
                                    onChangeText={(value) => handleFilterChange('keyword', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.filterActions}>
                            <Button
                                variant="outline"
                                size="small"
                                onPress={resetFilters}
                            >
                                필터 초기화
                            </Button>
                        </View>
                    </View>
                </Card>

                {/* 전시 목록 테이블 */}
                <Card>
                    <View style={styles.tableHeader}>
                        <View>
                            <Text style={styles.tableTitle}>전시 목록</Text>
                            <Text style={styles.tableCount}>총 {total}개</Text>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={styles.table}>
                            {/* 테이블 헤더 */}
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>썸네일</Text>
                                <Text style={[styles.tableHeaderCell, { width: 150 }]}>전시명</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>유형</Text>
                                <Text style={[styles.tableHeaderCell, { width: 120 }]}>시작일</Text>
                                <Text style={[styles.tableHeaderCell, { width: 120 }]}>종료일</Text>
                                <Text style={[styles.tableHeaderCell, { width: 120 }]}>장소</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>출품 가능</Text>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>주요전시</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>작업</Text>
                            </View>

                            {/* 테이블 바디 */}
                            <ScrollView style={styles.tableBody}>
                                {exhibitions.length > 0 ? (
                                    exhibitions.map((exhibition) => (
                                        <View key={exhibition.id} style={styles.tableRow}>
                                            <View style={{ width: 80, paddingHorizontal: 4 }}>
                                                <Thumbnail
                                                    imageUrl={exhibition.thumbnail}
                                                    title={exhibition.title}
                                                />
                                            </View>
                                            <Text style={[styles.tableCell, { width: 150 }]} numberOfLines={2}>
                                                {exhibition.title}
                                            </Text>
                                            <View style={{ width: 100, paddingHorizontal: 4 }}>
                                                <Badge
                                                    type="exhibitionType"
                                                    value={exhibition.exhibitionType}
                                                    displayValue={exhibition.exhibitionType === 'regular' ? '정기' : '특별'}
                                                />
                                            </View>
                                            <Text style={[styles.tableCell, { width: 120 }]}>
                                                {new Date(exhibition.startDate).toLocaleDateString()}
                                            </Text>
                                            <Text style={[styles.tableCell, { width: 120 }]}>
                                                {new Date(exhibition.endDate).toLocaleDateString()}
                                            </Text>
                                            <Text style={[styles.tableCell, { width: 120 }]} numberOfLines={1}>
                                                {exhibition.location}
                                            </Text>
                                            <View style={{ width: 100, paddingHorizontal: 4 }}>
                                                <Badge
                                                    type="submission"
                                                    value={exhibition.isSubmissionOpen}
                                                    displayValue={exhibition.isSubmissionOpen ? '가능' : '마감'}
                                                />
                                            </View>
                                            <View style={{ width: 80, paddingHorizontal: 4, alignItems: 'center' }}>
                                                <Button
                                                    variant={exhibition.isFeatured ? "primary" : "outline"}
                                                    size="small"
                                                    onPress={() => toggleFeatured(exhibition.id)}
                                                >
                                                    {exhibition.isFeatured ? '★' : '☆'}
                                                </Button>
                                            </View>
                                            <View style={[styles.actionButtons, { width: 100 }]}>
                                                <Link
                                                    to={`/admin/exhibitions/${exhibition.id}`}
                                                    style={styles.linkStyle}
                                                >
                                                    <Button variant="outline" size="small">
                                                        상세
                                                    </Button>
                                                </Link>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyRow}>
                                        <Text style={styles.emptyText}>등록된 전시가 없습니다.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>

                    {/* 페이지네이션 */}
                    {total > 0 && (
                        <View style={styles.pagination}>
                            <Button
                                variant="outline"
                                size="small"
                                onPress={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                            >
                                이전
                            </Button>
                            <Text>페이지 {page}</Text>
                            <Button
                                variant="outline"
                                size="small"
                                onPress={() => handlePageChange(page + 1)}
                                disabled={exhibitions.length < 10}
                            >
                                다음
                            </Button>
                        </View>
                    )}
                </Card>
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: sizes.spacing.lg,
        gap: sizes.spacing.lg,
    },
    header: {
        marginBottom: sizes.spacing.md,
    },
    title: {
        fontSize: sizes.fontSize.title,
        fontWeight: '700',
        color: adminColors.textPrimary,
        marginBottom: sizes.spacing.xs,
    },
    subtitle: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textSecondary,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: sizes.spacing.md,
    },
    loadingText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textSecondary,
    },
    errorCard: {
        backgroundColor: adminColors.gray100,
        borderColor: adminColors.error,
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.spacing.sm,
    },
    errorText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.error,
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: sizes.fontSize.xxl,
        fontWeight: '700',
        color: adminColors.primary,
        marginBottom: sizes.spacing.xs,
    },
    statLabel: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textSecondary,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: adminColors.borderLight,
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
    },
    select: {
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.sm,
        fontSize: sizes.fontSize.md,
        backgroundColor: adminColors.white,
    },
    searchInput: {
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.sm,
        fontSize: sizes.fontSize.md,
        backgroundColor: adminColors.white,
    },
    filterActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.borderLight,
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
        minWidth: 1050,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: adminColors.gray50,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
    },
    tableHeaderCell: {
        fontSize: sizes.fontSize.sm,
        fontWeight: '600',
        color: adminColors.textPrimary,
        paddingHorizontal: 4,
    },
    tableBody: {
        maxHeight: 600,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.borderLight,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textPrimary,
        paddingHorizontal: 4,
    },
    thumbnail: {
        width: 60,
        height: 40,
        objectFit: 'cover',
        borderRadius: sizes.borderRadius.sm,
    },
    noThumbnail: {
        width: 60,
        height: 40,
        backgroundColor: adminColors.gray50,
        borderRadius: sizes.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    noThumbnailText: {
        fontSize: 10,
        color: adminColors.textDisabled,
    },
    badge: {
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: sizes.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: sizes.fontSize.xs,
        fontWeight: '600',
        color: adminColors.white,
    },
    badgeRegular: {
        backgroundColor: '#4e7aad',
    },
    badgeSpecial: {
        backgroundColor: '#d97706',
    },
    badgeOpen: {
        backgroundColor: adminColors.success,
    },
    badgeClosed: {
        backgroundColor: adminColors.error,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: sizes.spacing.xs,
    },
    linkStyle: {
        // textDecoration은 React Native Web에서 지원하지 않음
    },
    emptyRow: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textSecondary,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: sizes.spacing.xs,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: adminColors.borderLight,
    },
});

export default ExhibitionListScreen;
