import React, { useState } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { showErrorMessage, showSuccessMessage } from '../../shared/utils/notification';
import { API_CONFIG, API_ENDPOINTS } from '../../shared/config/api.config';
import { USER_ROLES } from '../../shared/constants/userRoles';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginData {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

interface AdminLoginFormProps {
    onLoginSuccess?: (data: LoginData) => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (): Promise<void> => {
        if (!credentials.email || !credentials.password) {
            showErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.JWT_LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // 먼저 사용자 role이 ADMIN인지 확인
                if (data.data.user.role !== USER_ROLES.ADMIN) {
                    showErrorMessage('관리자 권한이 필요합니다.');
                    return;
                }

                // AuthContext를 통한 로그인 처리
                const loginSuccess = await login(data.data);
                if (loginSuccess) {
                    showSuccessMessage('관리자 로그인이 완료되었습니다.');
                    onLoginSuccess?.(data.data);
                } else {
                    showErrorMessage('로그인 처리 중 오류가 발생했습니다.');
                }
            } else {
                showErrorMessage(data.error || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            showErrorMessage('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof LoginCredentials, value: string): void => {
        setCredentials(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>관리자 로그인</h2>

                <div style={styles.inputContainer}>
                    <label style={styles.label}>이메일</label>
                    <input
                        type="email"
                        value={credentials.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        style={styles.input}
                        placeholder="이메일을 입력하세요"
                        disabled={loading}
                    />
                </div>

                <div style={styles.inputContainer}>
                    <label style={styles.label}>비밀번호</label>
                    <input
                        type="password"
                        value={credentials.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        style={styles.input}
                        placeholder="비밀번호를 입력하세요"
                        disabled={loading}
                        onKeyPress={handleKeyPress}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {})
                    }}
                >
                    {loading ? '로그인 중...' : '로그인'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    } as React.CSSProperties,
    formContainer: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
    } as React.CSSProperties,
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333'
    } as React.CSSProperties,
    inputContainer: {
        marginBottom: '20px'
    } as React.CSSProperties,
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '5px',
        color: '#555'
    } as React.CSSProperties,
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        boxSizing: 'border-box'
    } as React.CSSProperties,
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    } as React.CSSProperties,
    buttonDisabled: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed'
    } as React.CSSProperties
};

export default AdminLoginForm;
