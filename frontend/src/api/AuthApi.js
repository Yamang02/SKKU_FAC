/**
 * 인증 관련 API - React Native Web 버전
 */
import api from '../utils/api.js';
import { showErrorMessage, showSuccessMessage } from '../utils/notification.js';

export default class AuthApi {
    // 로그인
    static async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.success) {
                showSuccessMessage('로그인에 성공했습니다.');
            }
            return response;
        } catch (error) {
            console.error('로그인 중 오류 발생:', error);

            // API 에러 응답이 있는 경우 상세 메시지 표시
            if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '로그인에 실패했습니다.');
            } else {
                showErrorMessage('로그인 요청 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }

    // 로그아웃
    static async logout() {
        try {
            const response = await api.post('/auth/logout');
            if (response.success) {
                showSuccessMessage('로그아웃되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            showErrorMessage('로그아웃 처리 중 오류가 발생했습니다.');
            throw error;
        }
    }

    // 회원가입
    static async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.success) {
                showSuccessMessage('회원가입이 완료되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);

            // 유효성 검사 오류인 경우 상세 메시지 표시
            if (error.isApiError && error.apiResponse && error.apiResponse.validationErrors) {
                const validationErrors = error.apiResponse.validationErrors;
                const errorMessages = Object.values(validationErrors).flat();
                showErrorMessage(`회원가입 오류:\n${errorMessages.join('\n')}`);
            } else if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '회원가입에 실패했습니다.');
            } else {
                showErrorMessage('회원가입 요청 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }

    // 비밀번호 재설정 요청
    static async requestPasswordReset(email) {
        try {
            const response = await api.post('/auth/password-reset/request', { email });
            if (response.success) {
                showSuccessMessage('비밀번호 재설정 이메일이 발송되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('비밀번호 재설정 요청 중 오류 발생:', error);

            if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '비밀번호 재설정 요청에 실패했습니다.');
            } else {
                showErrorMessage('비밀번호 재설정 요청 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }

    // 비밀번호 재설정 실행
    static async resetPassword(token, newPassword) {
        try {
            const response = await api.post('/auth/password-reset/confirm', {
                token,
                newPassword
            });
            if (response.success) {
                showSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('비밀번호 재설정 중 오류 발생:', error);

            if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '비밀번호 재설정에 실패했습니다.');
            } else {
                showErrorMessage('비밀번호 재설정 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }

    // 이메일 인증 요청
    static async requestEmailVerification() {
        try {
            const response = await api.post('/auth/email-verification/request');
            if (response.success) {
                showSuccessMessage('인증 이메일이 발송되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('이메일 인증 요청 중 오류 발생:', error);

            if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '이메일 인증 요청에 실패했습니다.');
            } else {
                showErrorMessage('이메일 인증 요청 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }

    // 이메일 인증 확인
    static async verifyEmail(token) {
        try {
            const response = await api.post('/auth/email-verification/confirm', { token });
            if (response.success) {
                showSuccessMessage('이메일 인증이 완료되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('이메일 인증 확인 중 오류 발생:', error);

            if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '이메일 인증에 실패했습니다.');
            } else {
                showErrorMessage('이메일 인증 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }

    // 현재 사용자 정보 조회
    static async getCurrentUser() {
        try {
            return await api.get('/auth/me');
        } catch (error) {
            console.error('현재 사용자 정보 조회 중 오류 발생:', error);

            // 401 오류인 경우 인증되지 않은 상태로 처리
            if (error.statusCode === 401) {
                return {
                    success: false,
                    authenticated: false,
                    error: '인증이 필요합니다.'
                };
            }

            throw error;
        }
    }

    // 사용자 세션 확인
    static async checkSession() {
        try {
            return await api.get('/auth/session');
        } catch (error) {
            console.error('세션 확인 중 오류 발생:', error);

            // 세션 확인은 조용히 실패 처리
            return {
                success: false,
                authenticated: false,
                error: '세션을 확인할 수 없습니다.'
            };
        }
    }

    // 토큰 갱신
    static async refreshToken() {
        try {
            return await api.post('/auth/refresh');
        } catch (error) {
            console.error('토큰 갱신 중 오류 발생:', error);

            // 토큰 갱신 실패는 조용히 처리
            return {
                success: false,
                error: '토큰 갱신에 실패했습니다.'
            };
        }
    }

    // 계정 삭제
    static async deleteAccount(password) {
        try {
            const response = await api.delete('/auth/account', {
                body: JSON.stringify({ password })
            });
            if (response.success) {
                showSuccessMessage('계정이 성공적으로 삭제되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('계정 삭제 중 오류 발생:', error);

            if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '계정 삭제에 실패했습니다.');
            } else {
                showErrorMessage('계정 삭제 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }

    // 비밀번호 변경
    static async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.put('/auth/password', {
                currentPassword,
                newPassword
            });
            if (response.success) {
                showSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
            }
            return response;
        } catch (error) {
            console.error('비밀번호 변경 중 오류 발생:', error);

            if (error.isApiError && error.apiResponse) {
                showErrorMessage(error.apiResponse.error || '비밀번호 변경에 실패했습니다.');
            } else {
                showErrorMessage('비밀번호 변경 처리 중 오류가 발생했습니다.');
            }
            throw error;
        }
    }
}
