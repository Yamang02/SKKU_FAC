import React, { useState } from 'react';
import { showErrorMessage, showSuccessMessage } from '../../utils/notification';
import storage from '../../utils/storage';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../../constants/api';

const AdminLoginForm = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!credentials.email || !credentials.password) {
            showErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.JWT_LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // JWT 토큰 저장
                await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
                await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
                await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));

                showSuccessMessage('로그인되었습니다.');
                onLoginSuccess?.(data.data);
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

    const handleInputChange = (field, value) => {
        setCredentials(prev => ({
            ...prev,
            [field]: value
        }));
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
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleLogin();
                            }
                        }}
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
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333'
    },
    inputContainer: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '5px',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        boxSizing: 'border-box'
    },
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
    },
    buttonDisabled: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed'
    }
};

export default AdminLoginForm;
