import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { colors, spacing, typography } from '../../../styles';
import { UsePaginationReturn } from '../../../hooks/usePagination';

export interface PaginationProps {
    pagination: UsePaginationReturn;
    showInfo?: boolean;
    showLimitSelector?: boolean;
    limitOptions?: number[];
    maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    pagination,
    showInfo = true,
    showLimitSelector = true,
    limitOptions = [10, 20, 50, 100],
    maxVisiblePages = 5,
}) => {
    const { pageInfo, pagination: paginationState } = pagination;

    if (!pageInfo || pageInfo.totalPages <= 1) {
        return null;
    }

    const pageNumbers = pagination.getPageNumbers(Math.floor(maxVisiblePages / 2));

    const renderPageButton = (page: number, isActive: boolean = false) => (
        <TouchableOpacity
            key={page}
            style={[
                styles.pageButton,
                isActive && styles.activePageButton,
            ]}
            onPress={() => pagination.setPage(page)}
            disabled={isActive}
        >
            <Text
                style={[
                    styles.pageButtonText,
                    isActive && styles.activePageButtonText,
                ]}
            >
                {page}
            </Text>
        </TouchableOpacity>
    );

    const renderLimitSelector = () => (
        <View style={styles.limitSelector}>
            <Text style={styles.limitLabel}>페이지당 항목:</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.limitOptions}
            >
                {limitOptions.map((limit) => (
                    <TouchableOpacity
                        key={limit}
                        style={[
                            styles.limitOption,
                            paginationState.limit === limit && styles.activeLimitOption,
                        ]}
                        onPress={() => pagination.setLimit(limit)}
                    >
                        <Text
                            style={[
                                styles.limitOptionText,
                                paginationState.limit === limit && styles.activeLimitOptionText,
                            ]}
                        >
                            {limit}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderInfo = () => (
        <View style={styles.info}>
            <Text style={styles.infoText}>
                {`${((pageInfo.currentPage - 1) * paginationState.limit) + 1}-${Math.min(
                    pageInfo.currentPage * paginationState.limit,
                    pageInfo.total
                )} / 총 ${pageInfo.total}개`}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* 정보 표시 */}
            {showInfo && renderInfo()}

            {/* 페이지네이션 컨트롤 */}
            <View style={styles.controls}>
                {/* 이전 페이지 버튼 */}
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        !pageInfo.hasPrev && styles.disabledButton,
                    ]}
                    onPress={pagination.prevPage}
                    disabled={!pageInfo.hasPrev}
                >
                    <Text
                        style={[
                            styles.navButtonText,
                            !pageInfo.hasPrev && styles.disabledButtonText,
                        ]}
                    >
                        이전
                    </Text>
                </TouchableOpacity>

                {/* 첫 페이지 */}
                {pageNumbers[0] > 1 && (
                    <>
                        {renderPageButton(1)}
                        {pageNumbers[0] > 2 && (
                            <Text style={styles.ellipsis}>...</Text>
                        )}
                    </>
                )}

                {/* 페이지 번호들 */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.pageNumbers}
                >
                    {pageNumbers.map((page) =>
                        renderPageButton(page, page === pageInfo.currentPage)
                    )}
                </ScrollView>

                {/* 마지막 페이지 */}
                {pageNumbers[pageNumbers.length - 1] < pageInfo.totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < pageInfo.totalPages - 1 && (
                            <Text style={styles.ellipsis}>...</Text>
                        )}
                        {renderPageButton(pageInfo.totalPages)}
                    </>
                )}

                {/* 다음 페이지 버튼 */}
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        !pageInfo.hasNext && styles.disabledButton,
                    ]}
                    onPress={pagination.nextPage}
                    disabled={!pageInfo.hasNext}
                >
                    <Text
                        style={[
                            styles.navButtonText,
                            !pageInfo.hasNext && styles.disabledButtonText,
                        ]}
                    >
                        다음
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 페이지당 항목 수 선택 */}
            {showLimitSelector && renderLimitSelector()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    info: {
        marginBottom: spacing.sm,
    },
    infoText: {
        ...typography.body.small,
        color: colors.text.secondary,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    navButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background.secondary,
        borderRadius: spacing.component.borderRadius.sm,
        marginHorizontal: spacing.xs,
    },
    navButtonText: {
        ...typography.body.base,
        color: colors.text.primary,
        fontWeight: '500',
    },
    disabledButton: {
        backgroundColor: colors.neutral[100],
    },
    disabledButtonText: {
        color: colors.text.disabled,
    },
    pageNumbers: {
        flexDirection: 'row',
        maxWidth: 200,
    },
    pageButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: spacing.component.borderRadius.sm,
        marginHorizontal: 2,
    },
    activePageButton: {
        backgroundColor: colors.primary[500],
    },
    pageButtonText: {
        ...typography.body.base,
        color: colors.text.primary,
        fontWeight: '500',
    },
    activePageButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    ellipsis: {
        ...typography.body.base,
        color: colors.text.secondary,
        paddingHorizontal: spacing.xs,
    },
    limitSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    limitLabel: {
        ...typography.body.small,
        color: colors.text.secondary,
        marginRight: spacing.sm,
    },
    limitOptions: {
        flexDirection: 'row',
    },
    limitOption: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.background.secondary,
        borderRadius: spacing.component.borderRadius.sm,
        marginHorizontal: 2,
    },
    activeLimitOption: {
        backgroundColor: colors.primary[500],
    },
    limitOptionText: {
        ...typography.body.small,
        color: colors.text.primary,
    },
    activeLimitOptionText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
});

export default Pagination;
