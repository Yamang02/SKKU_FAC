import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigate, Link } from 'react-router-dom';

import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Icon } from '../../components/common';
import { useAdminUser } from '../../hooks';
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
        reload,
    } = useAdminUser();

    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // 사용자 정보 수정
    const handleUpdate = async () => {
        try {
            setIsUpdating(true);
            const result = await updateUser(formData);

            if (result.success) {
                setIsEditing(false);
                Alert.alert('성공', '사용자 정보가 성공적으로 수정되었습니다.');
            } else {
                Alert.alert('오류', result.error || '사용자 정보 수정에 실패했습니다.');
            }
        } catch (error) {
            Alert.alert('오류', '사용자 정보 수정 중 오류가 발생했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    // 사용자 삭제
    const handleDelete = () => {
        Alert.alert(
            '사용자 삭제',
            '이 사용자를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await deleteUser();
                            if (result.success) {
                                Alert.alert('성공', '사용자가 삭제되었습니다.', [
                                    {
                                        text: '확인',
                                        onPress: () => navigate('/admin/users'),
                                    },
                                ]);
                            } else {
                                Alert.alert('오류', result.error || '사용자 삭제에 실패했습니다.');
                            }
                        } catch (error) {
                            Alert.alert('오류', '사용자 삭제 중 오류가 발생했습니다.');
                        }
                    },
                },
            ]
        );
    };

    // 편집 취소
    const handleCancelEdit = () => {
        resetForm();
        setIsEditing(false);
    };

    if (loading && !user) {
        return (
            <AdminLayout>
                <View style={styles.container}>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
                    </View>
                </View>
            </AdminLayout>
        );
    }

    if (error && !user) {
        return (
            <AdminLayout>
                <View style={styles.container}>
                    <Card style={styles.errorCard}>
                        <Text style={styles.errorText}>{error}</Text>
                        <View style={styles.errorActions}>
                            <Button title="다시 시도" onPress={reload} />
                            <Link to="/admin/users" style={styles.backLink}>
                                <Button title="목록으로" variant="outline" />
                            </Link>
                        </View>
                    </Card>
                </View>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <View style={styles.container}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Link to="/admin/users" style={styles.backLink}>
                            <Button
                                title="← 목록으로"
                                variant="outline"
                                style={styles.backButton}
                            />
                        </Link>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>사용자 상세 정보</Text>
                            <Text style={styles.subtitle}>
                                {user?.name || '사용자'}의 정보를 확인하고 관리할 수 있습니다.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        {!isEditing ? (
                            <>
                                <Button
                                    title="정보 수정"
                                    onPress={() => setIsEditing(true)}
                                />
                                <Button
                                    title="사용자 삭제"
                                    variant="danger"
                                    onPress={handleDelete}
                                />
                            </>
                        ) : (
                            <>
                                <Button
                                    title="취소"
                                    variant="outline"
                                    onPress={handleCancelEdit}
                                />
                                <Button
                                    title={isUpdating ? "저장 중..." : "저장"}
                                    onPress={handleUpdate}
                                    disabled={isUpdating}
                                />
                            </>
                        )}
                    </View>
                </View>

                <ScrollView style={styles.content}>
                    {/* 기본 정보 */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.cardTitle}>기본 정보</Text>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>이름</Text>
                                <Text style={styles.infoValue}>{user?.name || '-'}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>이메일</Text>
                                <Text style={styles.infoValue}>{user?.email || '-'}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>사용자명</Text>
                                <Text style={styles.infoValue}>{user?.username || '-'}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>전화번호</Text>
                                <Text style={styles.infoValue}>{user?.phone || '-'}</Text>
                            </View>
                        </View>
                    </Card>

                    {/* 권한 및 상태 관리 */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.cardTitle}>권한 및 상태 관리</Text>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>현재 역할</Text>
                                {!isEditing ? (
                                    <View style={[
                                        styles.badge,
                                        user?.role === 'ADMIN' ? styles.adminBadge : styles.userBadge
                                    ]}>
                                        <Text style={styles.badgeText}>
                                            {user?.role === 'ADMIN' ? '관리자' : '사용자'}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.editGroup}>
                                        <Button
                                            title="사용자"
                                            variant={formData.role === 'USER' ? 'primary' : 'outline'}
                                            onPress={() => handleFormChange('role', 'USER')}
                                            style={styles.roleButton}
                                        />
                                        <Button
                                            title="관리자"
                                            variant={formData.role === 'ADMIN' ? 'primary' : 'outline'}
                                            onPress={() => handleFormChange('role', 'ADMIN')}
                                            style={styles.roleButton}
                                        />
                                    </View>
                                )}
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>계정 상태</Text>
                                {!isEditing ? (
                                    <View style={[
                                        styles.badge,
                                        user?.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge
                                    ]}>
                                        <Text style={styles.badgeText}>
                                            {user?.status === 'ACTIVE' ? '활성' : '비활성'}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.editGroup}>
                                        <Button
                                            title="활성"
                                            variant={formData.status === 'ACTIVE' ? 'primary' : 'outline'}
                                            onPress={() => handleFormChange('status', 'ACTIVE')}
                                            style={styles.statusButton}
                                        />
                                        <Button
                                            title="비활성"
                                            variant={formData.status === 'INACTIVE' ? 'primary' : 'outline'}
                                            onPress={() => handleFormChange('status', 'INACTIVE')}
                                            style={styles.statusButton}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    </Card>

                    {/* 계정 정보 */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.cardTitle}>계정 정보</Text>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>가입일</Text>
                                <Text style={styles.infoValue}>
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>최종 수정일</Text>
                                <Text style={styles.infoValue}>
                                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>이메일 인증</Text>
                                <View style={[
                                    styles.badge,
                                    user?.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge
                                ]}>
                                    <Text style={styles.badgeText}>
                                        {user?.emailVerified ? '인증됨' : '미인증'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>사용자 ID</Text>
                                <Text style={styles.infoValue}>{user?.id || '-'}</Text>
                            </View>
                        </View>
                    </Card>

                    {/* 추가 정보 */}
                    {user?.profile && (
                        <Card style={styles.infoCard}>
                            <Text style={styles.cardTitle}>추가 정보</Text>

                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>소속</Text>
                                    <Text style={styles.infoValue}>{user.profile.department || '-'}</Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>직책</Text>
                                    <Text style={styles.infoValue}>{user.profile.position || '-'}</Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>자기소개</Text>
                                    <Text style={styles.infoValue}>
                                        {user.profile.bio || '자기소개가 없습니다.'}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    )}
                </ScrollView>

                {/* 로딩 오버레이 */}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>처리 중...</Text>
                    </View>
                )}
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: adminColors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: sizes.padding,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
        backgroundColor: '#fff',
    },
    headerLeft: {
        flex: 1,
    },
    backLink: {
        textDecoration: 'none',
        marginBottom: sizes.margin,
    },
    backButton: {
        alignSelf: 'flex-start',
    },
    titleContainer: {
        gap: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: adminColors.text,
    },
    subtitle: {
        fontSize: 14,
        color: adminColors.textSecondary,
    },
    headerActions: {
        flexDirection: 'row',
        gap: sizes.margin,
    },
    content: {
        flex: 1,
        padding: sizes.padding,
    },
    infoCard: {
        marginBottom: sizes.padding,
        padding: sizes.padding,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: adminColors.text,
        marginBottom: sizes.padding,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
        paddingBottom: sizes.margin,
    },
    infoGrid: {
        gap: sizes.padding,
    },
    infoItem: {
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: adminColors.textSecondary,
    },
    infoValue: {
        fontSize: 16,
        color: adminColors.text,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    adminBadge: {
        backgroundColor: '#e8f2ff',
    },
    userBadge: {
        backgroundColor: '#f8f9fa',
    },
    activeBadge: {
        backgroundColor: '#e8f5e8',
    },
    inactiveBadge: {
        backgroundColor: '#fee',
    },
    verifiedBadge: {
        backgroundColor: '#e8f5e8',
    },
    unverifiedBadge: {
        backgroundColor: '#fff3cd',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '500',
        color: adminColors.text,
    },
    editGroup: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    roleButton: {
        minWidth: 80,
    },
    statusButton: {
        minWidth: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: sizes.padding * 2,
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
    errorCard: {
        backgroundColor: '#fee',
        borderColor: '#fcc',
        margin: sizes.padding,
        padding: sizes.padding,
    },
    errorText: {
        color: '#c33',
        fontSize: 16,
        marginBottom: sizes.padding,
    },
    errorActions: {
        flexDirection: 'row',
        gap: sizes.margin,
    },
});

export default UserDetailScreen;
