import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigate, Link } from 'react-router-dom';

import AdminLayout from '../../../components/admin/AdminLayout';
import { Card, Button, Icon } from '../../../components/common';
import { useAdminExhibition } from '../../../hooks';
import { adminColors, sizes } from '../../../constants';

const ExhibitionDetailScreen = () => {
    const navigate = useNavigate();
    const {
        exhibition,
        loading,
        error,
        formData,
        updateExhibition,
        deleteExhibition,
        handleFormChange,
        resetForm,
    } = useAdminExhibition();

    const [isEditing, setIsEditing] = useState(false);

    // Select 컴포넌트
    const Select = ({ value, onChange, disabled, children, style }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={Object.assign({}, styles.select, disabled && styles.selectDisabled, style)}
        >
            {children}
        </select>
    );

    // Checkbox 컴포넌트
    const Checkbox = ({ value, onChange, disabled, label }) => (
        <View style={styles.checkboxContainer}>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                style={styles.checkbox}
            />
            <Text style={styles.checkboxLabel}>{label}</Text>
        </View>
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

    const handleSave = async () => {
        const result = await updateExhibition();
        if (result.success) {
            Alert.alert('성공', result.message);
            setIsEditing(false);
        } else {
            Alert.alert('오류', result.message);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            '전시 삭제',
            '정말로 이 전시를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteExhibition();
                        if (result.success) {
                            Alert.alert('성공', result.message);
                            navigate('/admin/exhibitions');
                        } else {
                            Alert.alert('오류', result.message);
                        }
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    if (loading && !exhibition) {
        return (
            <AdminLayout currentPage="exhibitions">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>전시 상세 정보</Text>
                        <Text style={styles.subtitle}>전시의 상세 정보를 확인하고 관리할 수 있습니다</Text>
                    </View>
                    <Card>
                        <View style={styles.loadingContainer}>
                            <Icon name="image" size={48} color="#9ca3af" />
                            <Text style={styles.loadingText}>전시 정보를 불러오는 중...</Text>
                        </View>
                    </Card>
                </View>
            </AdminLayout>
        );
    }

    if (error || !exhibition) {
        return (
            <AdminLayout currentPage="exhibitions">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>전시 상세 정보</Text>
                        <Text style={styles.subtitle}>전시의 상세 정보를 확인하고 관리할 수 있습니다</Text>
                    </View>
                    <Card style={styles.errorCard}>
                        <View style={styles.errorContent}>
                            <Icon name="warning" size={24} color="#ef4444" />
                            <Text style={styles.errorText}>
                                {error || '전시를 찾을 수 없습니다.'}
                            </Text>
                        </View>
                        <View style={styles.errorActions}>
                            <Link to="/admin/exhibitions" style={styles.linkStyle}>
                                <Button
                                    title="목록으로 돌아가기"
                                    icon="back"
                                    variant="primary"
                                />
                            </Link>
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
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>전시 상세 정보</Text>
                        <Text style={styles.subtitle}>전시의 상세 정보를 확인하고 관리할 수 있습니다</Text>
                    </View>

                    <View style={styles.headerActions}>
                        <Link to="/admin/exhibitions" style={styles.linkStyle}>
                            <Button
                                title="목록으로"
                                icon="back"
                                variant="secondary"
                            />
                        </Link>

                        {!isEditing ? (
                            <Button
                                title="수정"
                                icon="edit"
                                onPress={() => setIsEditing(true)}
                                variant="primary"
                            />
                        ) : (
                            <>
                                <Button
                                    title="취소"
                                    icon="close"
                                    onPress={handleCancel}
                                    variant="secondary"
                                />
                                <Button
                                    title="저장"
                                    icon="save"
                                    onPress={handleSave}
                                    variant="primary"
                                    loading={loading}
                                />
                            </>
                        )}
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* 기본 정보 */}
                    <Card>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>기본 정보</Text>
                            {!isEditing && (
                                <View style={styles.badgeContainer}>
                                    <Badge
                                        type="exhibitionType"
                                        value={exhibition.exhibitionType}
                                        displayValue={exhibition.exhibitionTypeDisplayName ||
                                            (exhibition.exhibitionType === 'regular' ? '정기전시' : '특별전시')}
                                    />
                                    <Badge
                                        type="submission"
                                        value={exhibition.isSubmissionOpen}
                                        displayValue={exhibition.submissionStatusDisplayName ||
                                            (exhibition.isSubmissionOpen ? '출품가능' : '출품마감')}
                                    />
                                    <Badge
                                        type="featured"
                                        value={exhibition.isFeatured}
                                        displayValue={exhibition.isFeatured ? '주요전시' : '일반전시'}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.formGrid}>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>전시 제목</Text>
                                {isEditing ? (
                                    <TextInput
                                        style={styles.textInput}
                                        value={formData.title}
                                        onChangeText={(value) => handleFormChange('title', value)}
                                        placeholder="전시 제목을 입력하세요"
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{exhibition.title}</Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>전시 장소</Text>
                                {isEditing ? (
                                    <TextInput
                                        style={styles.textInput}
                                        value={formData.location}
                                        onChangeText={(value) => handleFormChange('location', value)}
                                        placeholder="전시 장소를 입력하세요"
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{exhibition.location}</Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>전시 유형</Text>
                                {isEditing ? (
                                    <Select
                                        value={formData.exhibitionType}
                                        onChange={(value) => handleFormChange('exhibitionType', value)}
                                    >
                                        <option value="regular">정기 전시</option>
                                        <option value="special">특별 전시</option>
                                    </Select>
                                ) : (
                                    <Text style={styles.fieldValue}>
                                        {exhibition.exhibitionTypeDisplayName ||
                                            (exhibition.exhibitionType === 'regular' ? '정기 전시' : '특별 전시')}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>최대 작품 수</Text>
                                {isEditing ? (
                                    <TextInput
                                        style={styles.textInput}
                                        value={formData.maxArtworks.toString()}
                                        onChangeText={(value) => handleFormChange('maxArtworks', parseInt(value) || 50)}
                                        placeholder="최대 작품 수"
                                        keyboardType="numeric"
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{exhibition.maxArtworks}개</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>전시 설명</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    value={formData.description}
                                    onChangeText={(value) => handleFormChange('description', value)}
                                    placeholder="전시 설명을 입력하세요"
                                    multiline
                                    numberOfLines={4}
                                />
                            ) : (
                                <Text style={styles.fieldValue}>{exhibition.description || '설명 없음'}</Text>
                            )}
                        </View>
                    </Card>

                    {/* 전시 기간 */}
                    <Card>
                        <Text style={styles.sectionTitle}>전시 기간</Text>
                        <View style={styles.formGrid}>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>시작일</Text>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleFormChange('startDate', e.target.value)}
                                        style={styles.dateInput}
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{exhibition.startDate}</Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>종료일</Text>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => handleFormChange('endDate', e.target.value)}
                                        style={styles.dateInput}
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{exhibition.endDate}</Text>
                                )}
                            </View>
                        </View>
                    </Card>

                    {/* 출품 기간 */}
                    <Card>
                        <Text style={styles.sectionTitle}>출품 관리</Text>
                        <View style={styles.formGrid}>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>출품 시작일</Text>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.submissionStartDate}
                                        onChange={(e) => handleFormChange('submissionStartDate', e.target.value)}
                                        style={styles.dateInput}
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{exhibition.submissionStartDate || '미설정'}</Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>출품 마감일</Text>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.submissionEndDate}
                                        onChange={(e) => handleFormChange('submissionEndDate', e.target.value)}
                                        style={styles.dateInput}
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{exhibition.submissionEndDate || '미설정'}</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.checkboxRow}>
                            {isEditing ? (
                                <>
                                    <Checkbox
                                        value={formData.isSubmissionOpen}
                                        onChange={(value) => handleFormChange('isSubmissionOpen', value)}
                                        label="출품 접수 중"
                                    />
                                    <Checkbox
                                        value={formData.isFeatured}
                                        onChange={(value) => handleFormChange('isFeatured', value)}
                                        label="주요 전시로 설정"
                                    />
                                </>
                            ) : (
                                <View style={styles.statusDisplay}>
                                    <Text style={styles.statusLabel}>출품 상태:</Text>
                                    <Text style={styles.statusValue}>
                                        {exhibition.isSubmissionOpen ? '출품 가능' : '출품 마감'}
                                    </Text>
                                    <Text style={styles.statusLabel}>주요 전시:</Text>
                                    <Text style={styles.statusValue}>
                                        {exhibition.isFeatured ? '예' : '아니오'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Card>

                    {/* 관리 작업 */}
                    {!isEditing && (
                        <Card>
                            <Text style={styles.sectionTitle}>관리 작업</Text>
                            <View style={styles.actionGrid}>
                                <Button
                                    title="전시 수정"
                                    icon="edit"
                                    onPress={() => setIsEditing(true)}
                                    variant="primary"
                                />
                                <Button
                                    title="전시 삭제"
                                    icon="delete"
                                    onPress={handleDelete}
                                    variant="danger"
                                />
                            </View>
                        </Card>
                    )}
                </ScrollView>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: sizes.spacing.md,
    },
    headerLeft: {
        flex: 1,
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
    headerActions: {
        flexDirection: 'row',
        gap: sizes.spacing.sm,
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
        marginBottom: sizes.spacing.md,
    },
    errorText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.error,
        flex: 1,
    },
    errorActions: {
        alignItems: 'flex-end',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sizes.spacing.md,
    },
    sectionTitle: {
        fontSize: sizes.fontSize.lg,
        fontWeight: '600',
        color: adminColors.textPrimary,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: sizes.spacing.sm,
    },
    formGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: sizes.spacing.md,
        marginBottom: sizes.spacing.md,
    },
    formField: {
        flex: 1,
        minWidth: 250,
    },
    fieldLabel: {
        fontSize: sizes.fontSize.sm,
        fontWeight: '600',
        color: adminColors.textSecondary,
        marginBottom: sizes.spacing.xs,
    },
    fieldValue: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textPrimary,
        paddingVertical: 8,
    },
    textInput: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.sm,
        fontSize: sizes.fontSize.md,
        backgroundColor: adminColors.white,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    select: {
        padding: 8,
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.sm,
        fontSize: sizes.fontSize.md,
        backgroundColor: adminColors.white,
    },
    selectDisabled: {
        backgroundColor: adminColors.gray100,
        color: adminColors.textDisabled,
    },
    dateInput: {
        padding: 8,
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.sm,
        fontSize: sizes.fontSize.md,
        backgroundColor: adminColors.white,
    },
    checkboxRow: {
        flexDirection: 'row',
        gap: sizes.spacing.lg,
        marginTop: sizes.spacing.md,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.spacing.sm,
    },
    checkbox: {
        width: 16,
        height: 16,
    },
    checkboxLabel: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textPrimary,
    },
    statusDisplay: {
        flexDirection: 'row',
        gap: sizes.spacing.md,
    },
    statusLabel: {
        fontSize: sizes.fontSize.md,
        fontWeight: '600',
        color: adminColors.textSecondary,
    },
    statusValue: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textPrimary,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: sizes.spacing.md,
    },
    badge: {
        paddingHorizontal: 8,
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
    badgeFeatured: {
        backgroundColor: adminColors.warning,
    },
    badgeNormal: {
        backgroundColor: adminColors.textDisabled,
    },
    linkStyle: {
        // textDecoration은 React Native Web에서 지원하지 않음
    },
});

export default ExhibitionDetailScreen;
