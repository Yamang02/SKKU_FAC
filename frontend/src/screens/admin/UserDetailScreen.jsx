import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigate, Link } from 'react-router-dom';

import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Icon } from '../../components/common';
import { useUser } from '../../hooks';
import { adminColors, sizes } from '../../constants';

const UserDetailScreen = () => {
    const navigate = useNavigate();
    const {
        user,
        loading,
        error,
        formData,
        updateUser,
        deleteUser,
        handleFormChange,
        resetForm,
    } = useUser();

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

    // 배지 컴포넌트
    const Badge = ({ type, value, displayValue }) => {
        let badgeStyle = styles.badge;

        if (type === 'role') {
            switch (value?.toLowerCase()) {
                case 'admin': badgeStyle = Object.assign({}, styles.badge, styles.badgeAdmin); break;
                case 'skku_member': badgeStyle = Object.assign({}, styles.badge, styles.badgeSkku); break;
                case 'external_member': badgeStyle = Object.assign({}, styles.badge, styles.badgeExternal); break;
                default: badgeStyle = styles.badge;
            }
        } else if (type === 'status') {
            switch (value?.toLowerCase()) {
                case 'active': badgeStyle = Object.assign({}, styles.badge, styles.badgeActive); break;
                case 'inactive': badgeStyle = Object.assign({}, styles.badge, styles.badgeInactive); break;
                case 'blocked': badgeStyle = Object.assign({}, styles.badge, styles.badgeBlocked); break;
                case 'unverified': badgeStyle = Object.assign({}, styles.badge, styles.badgeUnverified); break;
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
        const result = await updateUser();
        if (result.success) {
            Alert.alert('성공', result.message);
            setIsEditing(false);
        } else {
            Alert.alert('오류', result.message);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            '사용자 삭제',
            '정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteUser();
                        if (result.success) {
                            Alert.alert('성공', result.message);
                            navigate('/admin/users');
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

    if (loading && !user) {
        return (
            <AdminLayout currentPage="users">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>회원 상세 정보</Text>
                        <Text style={styles.subtitle}>회원의 상세 정보를 확인하고 관리할 수 있습니다</Text>
                    </View>
                    <Card>
                        <View style={styles.loadingContainer}>
                            <Icon name="user" size={48} color="#9ca3af" />
                            <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
                        </View>
                    </Card>
                </View>
            </AdminLayout>
        );
    }

    if (error || !user) {
        return (
            <AdminLayout currentPage="users">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>회원 상세 정보</Text>
                        <Text style={styles.subtitle}>회원의 상세 정보를 확인하고 관리할 수 있습니다</Text>
                    </View>
                    <Card style={styles.errorCard}>
                        <View style={styles.errorContent}>
                            <Icon name="warning" size={24} color="#ef4444" />
                            <Text style={styles.errorText}>
                                {error || '사용자를 찾을 수 없습니다.'}
                            </Text>
                        </View>
                        <View style={styles.errorActions}>
                            <Link to="/admin/users" style={styles.linkStyle}>
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
        <AdminLayout currentPage="users">
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>회원 상세 정보</Text>
                        <Text style={styles.subtitle}>회원의 상세 정보를 확인하고 관리할 수 있습니다</Text>
                    </View>

                    <View style={styles.headerActions}>
                        <Link to="/admin/users" style={styles.linkStyle}>
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
                            <Icon name="user" size={20} color="#3b82f6" />
                            <Text style={styles.sectionTitle}>기본 정보</Text>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>아이디</Text>
                                <Text style={styles.infoValue}>{user.username}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>이름</Text>
                                <Text style={styles.infoValue}>{user.name}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>이메일</Text>
                                <Text style={styles.infoValue}>{user.email}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>가입일</Text>
                                <Text style={styles.infoValue}>{user.createdAtFormatted}</Text>
                            </View>
                        </View>
                    </Card>

                    {/* 역할 및 권한 */}
                    <Card>
                        <View style={styles.sectionHeader}>
                            <Icon name="settings" size={20} color="#3b82f6" />
                            <Text style={styles.sectionTitle}>역할 및 권한</Text>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>현재 역할</Text>
                                {!isEditing ? (
                                    <Badge type="role" value={user.role} displayValue={user.roleDisplayName} />
                                ) : (
                                    <Select
                                        value={formData.role}
                                        onChange={(value) => handleFormChange('role', value)}
                                    >
                                        <option value="ADMIN">관리자</option>
                                        <option value="SKKU_MEMBER">성균관대 구성원</option>
                                        <option value="EXTERNAL_MEMBER">외부인</option>
                                    </Select>
                                )}
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>계정 상태</Text>
                                {!isEditing ? (
                                    <Badge type="status" value={user.status} displayValue={user.statusDisplayName} />
                                ) : (
                                    <Select
                                        value={formData.status}
                                        onChange={(value) => handleFormChange('status', value)}
                                    >
                                        <option value="ACTIVE">활성</option>
                                        <option value="INACTIVE">비활성</option>
                                        <option value="BLOCKED">차단</option>
                                        <option value="UNVERIFIED">미인증</option>
                                    </Select>
                                )}
                            </View>
                        </View>
                    </Card>

                    {/* 프로필 정보 */}
                    {user.profile && (
                        <Card>
                            <View style={styles.sectionHeader}>
                                <Icon name="info" size={20} color="#3b82f6" />
                                <Text style={styles.sectionTitle}>프로필 정보</Text>
                            </View>

                            <View style={styles.infoGrid}>
                                {user.profile.affiliation && (
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>소속</Text>
                                        <Text style={styles.infoValue}>{user.profile.affiliation}</Text>
                                    </View>
                                )}

                                {user.profile.position && (
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>직책</Text>
                                        <Text style={styles.infoValue}>{user.profile.position}</Text>
                                    </View>
                                )}

                                {user.profile.department && (
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>부서</Text>
                                        <Text style={styles.infoValue}>{user.profile.department}</Text>
                                    </View>
                                )}

                                {user.profile.phoneNumber && (
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>연락처</Text>
                                        <Text style={styles.infoValue}>{user.profile.phoneNumber}</Text>
                                    </View>
                                )}
                            </View>
                        </Card>
                    )}

                    {/* 위험 구역 */}
                    <Card style={styles.dangerZone}>
                        <View style={styles.sectionHeader}>
                            <Icon name="warning" size={20} color="#ef4444" />
                            <Text style={Object.assign({}, styles.sectionTitle, { color: '#ef4444' })}>위험 구역</Text>
                        </View>

                        <Text style={styles.dangerText}>
                            이 작업들은 되돌릴 수 없습니다. 신중하게 결정해주세요.
                        </Text>

                        <View style={styles.dangerActions}>
                            <Button
                                title="사용자 삭제"
                                icon="trash"
                                onPress={handleDelete}
                                variant="danger"
                                loading={loading}
                            />
                        </View>
                    </Card>
                </ScrollView>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: sizes.spacing.lg,
    },
    headerLeft: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: sizes.spacing.sm,
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
        marginBottom: sizes.spacing.md,
    },
    errorText: {
        fontSize: sizes.fontSize.md,
        color: adminColors.badge.blocked,
        marginLeft: sizes.spacing.sm,
        flex: 1,
    },
    errorActions: {
        alignItems: 'flex-start',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: sizes.spacing.md,
    },
    sectionTitle: {
        fontSize: sizes.fontSize.lg,
        fontWeight: '600',
        color: adminColors.textPrimary,
        marginLeft: sizes.spacing.sm,
    },
    infoGrid: {
        gap: sizes.spacing.md,
    },
    infoItem: {
        gap: sizes.spacing.xs,
    },
    infoLabel: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: sizes.fontSize.md,
        color: adminColors.textPrimary,
        fontWeight: '400',
    },
    select: {
        borderWidth: 1,
        borderColor: adminColors.border,
        borderRadius: sizes.borderRadius.md,
        paddingHorizontal: sizes.spacing.sm,
        paddingVertical: sizes.spacing.sm,
        fontSize: sizes.fontSize.md,
        backgroundColor: adminColors.white,
        minHeight: 40,
    },
    selectDisabled: {
        backgroundColor: adminColors.gray100,
        color: adminColors.textDisabled,
    },
    badge: {
        paddingHorizontal: sizes.spacing.sm,
        paddingVertical: sizes.spacing.xs,
        borderRadius: sizes.borderRadius.sm,
        backgroundColor: adminColors.gray100,
        borderWidth: 1,
        borderColor: adminColors.border,
        alignSelf: 'flex-start',
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
    dangerZone: {
        borderColor: adminColors.error,
        backgroundColor: '#fef2f2',
    },
    dangerText: {
        fontSize: sizes.fontSize.sm,
        color: adminColors.textSecondary,
        marginBottom: sizes.spacing.md,
    },
    dangerActions: {
        alignItems: 'flex-start',
    },
    linkStyle: {
        // textDecoration은 React Native Web에서 지원하지 않음
    },
});

export default UserDetailScreen;
