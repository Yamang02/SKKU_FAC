import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../../styles';

export interface TableColumn<T = any> {
    key: string;
    title: string;
    dataIndex: keyof T;
    width?: number | string;
    sortable?: boolean;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
    data: T[];
    columns: TableColumn<T>[];
    onSort?: (field: string, order: 'asc' | 'desc') => void;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    onRowPress?: (record: T, index: number) => void;
    loading?: boolean;
    emptyText?: string;
    style?: ViewStyle;
    headerStyle?: ViewStyle;
    rowStyle?: ViewStyle;
    cellStyle?: ViewStyle;
    striped?: boolean;
    bordered?: boolean;
    testID?: string;
}

export const Table = <T extends Record<string, any>>({
    data,
    columns,
    onSort,
    sortField,
    sortOrder,
    onRowPress,
    loading = false,
    emptyText = '데이터가 없습니다',
    style,
    headerStyle,
    rowStyle,
    cellStyle,
    striped = false,
    bordered = false,
    testID,
}: TableProps<T>) => {
    const handleSort = (column: TableColumn<T>) => {
        if (!column.sortable || !onSort) return;

        const field = column.dataIndex as string;
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(field, newOrder);
    };

    const getSortIcon = (column: TableColumn<T>) => {
        if (!column.sortable) return null;

        const field = column.dataIndex as string;
        if (sortField !== field) return ' ↕';

        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    const getCellValue = (record: T, column: TableColumn<T>, index: number) => {
        const value = record[column.dataIndex];

        if (column.render) {
            return column.render(value, record, index);
        }

        return value?.toString() || '';
    };

    const getCellStyle = (column: TableColumn<T>) => {
        const baseStyle = [styles.cell, cellStyle];

        if (column.width) {
            if (typeof column.width === 'number') {
                baseStyle.push({ width: column.width });
            } else {
                baseStyle.push({ flex: parseFloat(column.width) || 1 });
            }
        } else {
            baseStyle.push({ flex: 1 });
        }

        if (column.align) {
            baseStyle.push({
                alignItems: column.align === 'center' ? 'center' :
                    column.align === 'right' ? 'flex-end' : 'flex-start'
            });
        }

        return baseStyle;
    };

    const renderHeader = () => (
        <View style={[
            styles.header,
            headerStyle,
            bordered && styles.bordered,
        ]}>
            {columns.map((column) => (
                <TouchableOpacity
                    key={column.key}
                    style={getCellStyle(column)}
                    onPress={() => handleSort(column)}
                    disabled={!column.sortable}
                    activeOpacity={column.sortable ? 0.7 : 1}
                >
                    <Text style={[
                        styles.headerText,
                        !column.sortable && styles.nonSortableHeader,
                    ]}>
                        {column.title}{getSortIcon(column)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderRow = ({ item, index }: { item: T; index: number }) => (
        <TouchableOpacity
            style={[
                styles.row,
                striped && index % 2 === 1 && styles.stripedRow,
                bordered && styles.bordered,
                rowStyle,
            ]}
            onPress={() => onRowPress?.(item, index)}
            disabled={!onRowPress}
            activeOpacity={onRowPress ? 0.7 : 1}
        >
            {columns.map((column) => (
                <View key={column.key} style={getCellStyle(column)}>
                    <Text style={styles.cellText} numberOfLines={2} ellipsizeMode="tail">
                        {getCellValue(item, column, index)}
                    </Text>
                </View>
            ))}
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
    );

    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, style]} testID={testID}>
                {renderHeader()}
                {renderLoading()}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]} testID={testID}>
            {renderHeader()}
            <FlatList
                data={data}
                renderItem={renderRow}
                keyExtractor={(item, index) =>
                    item.id?.toString() || item.key?.toString() || index.toString()
                }
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={true}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        backgroundColor: colors.background.secondary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    headerText: {
        ...typography.body.base,
        fontWeight: '600',
        color: colors.text.primary,
    },
    nonSortableHeader: {
        color: colors.text.secondary,
    },
    list: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.background.primary,
    },
    stripedRow: {
        backgroundColor: colors.neutral[50],
    },
    bordered: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    cell: {
        justifyContent: 'center',
        paddingHorizontal: spacing.xs,
    },
    cellText: {
        ...typography.body.base,
        color: colors.text.primary,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        ...typography.body.base,
        color: colors.text.secondary,
    },
    loadingContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        ...typography.body.base,
        color: colors.text.secondary,
    },
});

export default Table;
