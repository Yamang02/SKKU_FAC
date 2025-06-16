import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserApi from '../../api/UserApi.js';
import { showErrorMessage, showSuccessMessage } from '../../utils/notification.js';
import AdminLayout from './AdminLayout.jsx';

const UserManagementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        role: '',
        status: ''
    });

    // 사용자 상세 정보 불러오기
    const loadUserDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await UserApi.getUserDetail(id);

            if (response.success) {
                const userData = response.data;
                setUser(userData);
                setFormData({
                    role: userData.role,
                    status: userData.status
                });
            } else {
                setError(response.error || '사용자 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('사용자 상세 정보 로딩 오류:', err);
            setError('사용자 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadUserDetail();
        }
    }, [id]);

    // 폼 데이터 변경 핸들러
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 사용자 정보 수정
    const handleSubmit = async () => {
        try {
            setSaving(true);

            // API 호출 (UserApi에 updateUser 메서드가 필요함)
            // 임시로 콘솔에 출력
            console.log('사용자 정보 수정:', {
                id,
                ...formData
            });

            showSuccessMessage('사용자 정보가 성공적으로 수정되었습니다.');
            // 실제 API 연동 시:
            // const response = await UserApi.updateUser(id, formData);
            // if (response.success) {
            //   showSuccessMessage('사용자 정보가 성공적으로 수정되었습니다.');
            //   await loadUserDetail(); // 데이터 새로고침
            // }
        } catch (err) {
            console.error('사용자 정보 수정 오류:', err);
            showErrorMessage('사용자 정보 수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    // 비밀번호 초기화
    const handlePasswordReset = async () => {
        if (!confirm('해당 사용자의 비밀번호를 초기화하시겠습니까?')) {
            return;
        }

        try {
            console.log('비밀번호 초기화:', id);
            showSuccessMessage('비밀번호가 초기화되었습니다.');
            // 실제 API 연동 시:
            // const response = await UserApi.resetPassword(id);
        } catch (err) {
            console.error('비밀번호 초기화 오류:', err);
            showErrorMessage('비밀번호 초기화에 실패했습니다.');
        }
    };

    // 사용자 삭제
    const handleUserDelete = async () => {
        const message = `정말로 이 회원을 삭제하시겠습니까?\n\n⚠️ 경고: 이 작업은 되돌릴 수 없습니다.\n• 해당 회원의 모든 정보가 영구적으로 삭제됩니다.\n• 회원과 관련된 모든 데이터가 함께 삭제됩니다.\n• 이 작업은 되돌릴 수 없으므로 신중하게 결정해주세요.`;

        if (!confirm(message)) {
            return;
        }

        try {
            console.log('사용자 삭제:', id);
            showSuccessMessage('회원이 삭제되었습니다.');
            navigate('/admin/users');
            // 실제 API 연동 시:
            // const response = await UserApi.deleteUser(id);
            // if (response.success) {
            //   showSuccessMessage('회원이 삭제되었습니다.');
            //   navigate('/admin/users');
            // }
        } catch (err) {
            console.error('사용자 삭제 오류:', err);
            showErrorMessage('회원 삭제에 실패했습니다.');
        }
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

    if (loading) {
        return (
            <AdminLayout>
                <View style={styles.container}>
                    <Text style={styles.title}>회원상세</Text>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
                    </View>
                </View>
            </AdminLayout>
        );
    }

    if (error || !user) {
        return (
            <AdminLayout>
                <View style={styles.container}>
                    <Text style={styles.title}>회원상세</Text>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error || '사용자 정보를 찾을 수 없습니다.'}</Text>
                    </View>
                    <Link to="/admin/users" style={styles.linkStyle}>
                        <View style={styles.backButton}>
                            <Text style={styles.buttonText}>📋 목록으로</Text>
                        </View>
                    </Link>
                </View>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>회원상세</Text>

                {/* 기본 정보 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>기본 정보</Text>
                    <View style={styles.formGrid}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>ID</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.username}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>이름</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.name}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>이메일</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.email}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>역할</Text>
                            <Select
                                value={formData.role}
                                onChange={(value) => handleFormChange('role', value)}
                            >
                                <option value="ADMIN">관리자</option>
                                <option value="SKKU_MEMBER">성균관대 구성원</option>
                                <option value="EXTERNAL_MEMBER">외부인</option>
                            </Select>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>상태</Text>
                            <Select
                                value={formData.status}
                                onChange={(value) => handleFormChange('status', value)}
                            >
                                <option value="ACTIVE">활성</option>
                                <option value="INACTIVE">비활성</option>
                                <option value="BLOCKED">차단</option>
                                <option value="UNVERIFIED">미인증</option>
                            </Select>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>이메일 인증 여부</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.emailVerifiedText || '미인증'}
                                editable={false}
                            />
                        </View>
                    </View>
                </View>

                {/* 상세 정보 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>상세 정보</Text>
                    <View style={styles.formGrid}>
                        {user.role === 'SKKU_MEMBER' && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>학과</Text>
                                    <TextInput
                                        style={{ ...styles.input, ...styles.readOnlyInput }}
                                        value={user.profileInfo?.department || '-'}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>학번</Text>
                                    <TextInput
                                        style={{ ...styles.input, ...styles.readOnlyInput }}
                                        value={user.profileInfo?.studentYear || '-'}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>동아리 회원</Text>
                                    <TextInput
                                        style={{ ...styles.input, ...styles.readOnlyInput }}
                                        value={user.profileInfo?.isClubMember ? '예' : '아니오'}
                                        editable={false}
                                    />
                                </View>
                            </>
                        )}

                        {user.role === 'EXTERNAL_MEMBER' && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>소속</Text>
                                <TextInput
                                    style={{ ...styles.input, ...styles.readOnlyInput }}
                                    value={user.profileInfo?.affiliation || '-'}
                                    editable={false}
                                />
                            </View>
                        )}

                        {user.role === 'ADMIN' && (
                            <View style={styles.formGroupFull}>
                                <Text style={styles.infoText}>역할에 따른 추가 정보가 없습니다.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 시스템 정보 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>시스템 정보</Text>
                    <View style={styles.formGrid}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>가입일</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.createdAtFormatted}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>수정일</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.updatedAtFormatted}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>마지막 로그인</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.lastLoginFormatted || '-'}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>계정 ID</Text>
                            <TextInput
                                style={{ ...styles.input, ...styles.readOnlyInput }}
                                value={user.id.toString()}
                                editable={false}
                            />
                        </View>
                    </View>
                </View>

                {/* 버튼 섹션 */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={{
                            ...styles.primaryButton,
                            ...(saving && styles.disabledButton)
                        }}
                        onPress={handleSubmit}
                        disabled={saving}
                    >
                        <Text style={styles.buttonText}>
                            {saving ? '저장 중...' : '💾 저장'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.warningButton}
                        onPress={handlePasswordReset}
                    >
                        <Text style={styles.buttonText}>🔑 비밀번호 초기화</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dangerButton}
                        onPress={handleUserDelete}
                    >
                        <Text style={styles.buttonText}>🗑️ 삭제</Text>
                    </TouchableOpacity>
                </View>

                {/* 목록으로 버튼 */}
                <View style={styles.backButtonContainer}>
                    <Link to="/admin/users" style={styles.linkStyle}>
                        <View style={styles.backButton}>
                            <Text style={styles.buttonText}>📋 목록으로</Text>
                        </View>
                    </Link>
                </View>
            </ScrollView>
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
    section: {
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e4e8',
        paddingBottom: 8,
    },
    formGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    formGroup: {
        flexBasis: '48%',
        minWidth: 250,
    },
    formGroupFull: {
        flexBasis: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        fontSize: 14,
        backgroundColor: 'white',
    },
    readOnlyInput: {
        backgroundColor: '#f9fafb',
        color: '#6b7280',
    },
    select: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        fontSize: 14,
        backgroundColor: 'white',
    },
    infoText: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    buttonSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
        minWidth: 120,
    },
    warningButton: {
        backgroundColor: '#f59e0b',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
        minWidth: 120,
    },
    dangerButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
        minWidth: 120,
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    backButtonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    backButton: {
        backgroundColor: '#6b7280',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    linkStyle: {
        textDecoration: 'none',
    },
});

export default UserManagementDetail;
