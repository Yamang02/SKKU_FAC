import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Link } from 'react-router-dom';

import AdminLayout from '../../../components/admin/AdminLayout';
import { Card, Button, Icon } from '../../../components/common';
import { useAdminArtworks } from '../../../hooks';
import { adminColors, sizes } from '../../../constants';

const ArtworkListScreen = () => {
    const {
        artworks,
        loading,
        error,
        total,
        page,
        filters,
        handleFilterChange,
        handlePageChange,
        resetFilters,
        toggleFeatured,
        updateArtworkStatus,
    } = useAdminArtworks();

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

        if (type === 'status') {
            switch (value?.toLowerCase()) {
                case 'pending': badgeStyle = Object.assign({}, styles.badge, styles.badgePending); break;
                case 'approved': badgeStyle = Object.assign({}, styles.badge, styles.badgeApproved); break;
                case 'blocked': badgeStyle = Object.assign({}, styles.badge, styles.badgeBlocked); break;
                case 'deleted': badgeStyle = Object.assign({}, styles.badge, styles.badgeDeleted); break;
                default: badgeStyle = styles.badge;
            }
        } else if (type === 'featured') {
            switch (value) {
                case true: badgeStyle = Object.assign({}, styles.badge, styles.badgeFeatured); break;
                case false: badgeStyle = Object.assign({}, styles.badge, styles.badgeNormal); break;
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

    if (loading && artworks.length === 0) {
        return (
            <AdminLayout currentPage="artworks">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>작품 관리</Text>
                        <Text style={styles.subtitle}>등록된 작품들을 관리할 수 있습니다</Text>
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
        <AdminLayout currentPage="artworks">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>작품 관리</Text>
                    <Text style={styles.subtitle}>등록된 작품들을 관리할 수 있습니다</Text>
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
                            <Text style={styles.statLabel}>총 작품수</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {artworks.filter(a => a.status === 'approved').length}
                            </Text>
                            <Text style={styles.statLabel}>승인됨</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {artworks.filter(a => a.status === 'pending').length}
                            </Text>
                            <Text style={styles.statLabel}>대기중</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {artworks.filter(a => a.isFeatured).length}
                            </Text>
                            <Text style={styles.statLabel}>주요 작품</Text>
                        </View>
                    </View>
                </Card>

                {/* 필터 섹션 */}
                <Card>
                    <Text style={styles.sectionTitle}>검색 및 필터</Text>
                    <View style={styles.filterContainer}>
                        <View style={styles.filterRow}>
                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>작품 상태</Text>
                                <Select
                                    value={filters.status}
                                    onChange={(value) => handleFilterChange('status', value)}
                                >
                                    <option value="">전체</option>
                                    <option value="pending">대기</option>
                                    <option value="approved">승인</option>
                                    <option value="blocked">차단</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>주요 작품 여부</Text>
                                <Select
                                    value={filters.featured}
                                    onChange={(value) => handleFilterChange('featured', value)}
                                >
                                    <option value="">전체</option>
                                    <option value="true">주요 작품</option>
                                    <option value="false">일반 작품</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>정렬</Text>
                                <Select
                                    value={filters.sort}
                                    onChange={(value) => handleFilterChange('sort', value)}
                                >
                                    <option value="createdAt">생성일</option>
                                    <option value="updatedAt">수정일</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>순서</Text>
                                <Select
                                    value={filters.order}
                                    onChange={(value) => handleFilterChange('order', value)}
                                >
                                    <option value="desc">내림차순</option>
                                    <option value="asc">오름차순</option>
                                </Select>
                            </View>

                            <View style={styles.filterItem}>
                                <Text style={styles.filterLabel}>검색어</Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="작품명, 작가명 검색"
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
                        <Text style={styles.tableTitle}>작품 목록</Text>
                        <Text style={styles.tableCount}>총 {artworks.length}개 항목</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.table}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 80 })}>썸네일</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 200 })}>제목</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 150 })}>작가</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 120 })}>상태</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 100 })}>주요작품</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 120 })}>생성일</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 120 })}>수정일</Text>
                                <Text style={Object.assign({}, styles.tableHeaderCell, { width: 120 })}>작업</Text>
                            </View>

                            <ScrollView style={styles.tableBody}>
                                {artworks.length > 0 ? (
                                    artworks.map(artwork => (
                                        <View key={artwork.id} style={styles.tableRow}>
                                            <View style={Object.assign({}, styles.tableCell, { width: 80 })}>
                                                <Thumbnail
                                                    imageUrl={artwork.imageUrl}
                                                    title={artwork.title}
                                                />
                                            </View>
                                            <Text style={Object.assign({}, styles.tableCell, { width: 200 })}>
                                                {artwork.title}
                                            </Text>
                                            <Text style={Object.assign({}, styles.tableCell, { width: 150 })}>
                                                {artwork.artistName || '작가 미상'}
                                            </Text>
                                            <View style={Object.assign({}, styles.tableCell, { width: 120 })}>
                                                <Badge
                                                    type="status"
                                                    value={artwork.status}
                                                    displayValue={
                                                        artwork.status === 'pending' ? '대기' :
                                                            artwork.status === 'approved' ? '승인' :
                                                                artwork.status === 'blocked' ? '차단' : '삭제'
                                                    }
                                                />
                                            </View>
                                            <View style={Object.assign({}, styles.tableCell, { width: 100 })}>
                                                <Badge
                                                    type="featured"
                                                    value={artwork.isFeatured}
                                                    displayValue={artwork.isFeatured ? '주요' : '일반'}
                                                />
                                            </View>
                                            <Text style={Object.assign({}, styles.tableCell, { width: 120 })}>
                                                {artwork.createdAtFormatted || artwork.createdAt}
                                            </Text>
                                            <Text style={Object.assign({}, styles.tableCell, { width: 120 })}>
                                                {artwork.updatedAtFormatted || artwork.updatedAt}
                                            </Text>
                                            <View style={Object.assign({}, styles.tableCell, { width: 120 })}>
                                                <View style={styles.actionButtons}>
                                                    <Link to={`/admin/artworks/${artwork.id}`} style={styles.linkStyle}>
                                                        <Button
                                                            title=""
                                                            icon="edit"
                                                            variant="info"
                                                            size="small"
                                                        />
                                                    </Link>
                                                    <Button
                                                        title=""
                                                        icon="star"
                                                        variant={artwork.isFeatured ? "warning" : "secondary"}
                                                        size="small"
                                                        onPress={() => toggleFeatured(artwork.id, artwork.isFeatured)}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyRow}>
                                        <Text style={styles.emptyText}>등록된 작품이 없습니다.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>

                    {/* 페이지네이션 */}
                    {page.totalPages > 1 && (
                        <View style={styles.pagination}>
                            <Button
                                title=""
                                icon="chevron-left-double"
                                variant="secondary"
                                size="small"
                                onPress={() => handlePageChange(1)}
                                disabled={page.currentPage === 1}
                            />
                            <Button
                                title=""
                                icon="chevron-left"
                                variant="secondary"
                                size="small"
                                onPress={() => handlePageChange(page.currentPage - 1)}
                                disabled={!page.hasPreviousPage}
                            />

                            {Array.from({ length: Math.min(5, page.totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, page.currentPage - 2) + i;
                                if (pageNum <= page.totalPages) {
                                    return (
                                        <Button
                                            key={pageNum}
                                            title={pageNum.toString()}
                                            variant={pageNum === page.currentPage ? "primary" : "secondary"}
                                            size="small"
                                            onPress={() => handlePageChange(pageNum)}
                                        />
                                    );
                                }
                                return null;
                            })}

                            <Button
                                title=""
                                icon="chevron-right"
                                variant="secondary"
                                size="small"
                                onPress={() => handlePageChange(page.currentPage + 1)}
                                disabled={!page.hasNextPage}
                            />
                            <Button
                                title=""
                                icon="chevron-right-double"
                                variant="secondary"
                                size="small"
                                onPress={() => handlePageChange(page.totalPages)}
                                disabled={page.currentPage === page.totalPages}
                            />
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
        minWidth: 150,
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
        minWidth: 1100,
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
    badgePending: {
        backgroundColor: '#f59e0b',
    },
    badgeApproved: {
        backgroundColor: adminColors.success,
    },
    badgeBlocked: {
        backgroundColor: adminColors.error,
    },
    badgeDeleted: {
        backgroundColor: '#6b7280',
    },
    badgeFeatured: {
        backgroundColor: adminColors.warning,
    },
    badgeNormal: {
        backgroundColor: adminColors.textDisabled,
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

export default ArtworkListScreen;
