/**
 * 인증 관련 API - TypeScript 버전
 * Main과 Admin 도메인에서 공통으로 사용되는 인증 API
 */

import BaseApi from './BaseApi';
import type { ApiResponse } from '../utils/api';
import { api } from '../utils/api';
import { showErrorMessage, showSuccessMessage } from '../utils/notification';

// 인증 관련 타입 정의
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    studentId?: string;
    department?: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    studentId?: string;
    department?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token?: string;
    authenticated: boolean;
}

export interface SessionResponse {
    authenticated: boolean;
    user?: User;
}

export default class AuthApi extends BaseApi {
    /**
     * 로그인
     */
    static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        return this.handleApiCall(
            async () => {
                const response = await api.post<AuthResponse>('/auth/login', credentials);
                if (response.success) {
                    showSuccessMessage('로그인에 성공했습니다.');
                }
                return response;
            },
            '로그인'
        );
    }

    /**
     * 로그아웃
     */
    static async logout(): Promise<ApiResponse<{ message: string }>> {
        return this.handleApiCall(
            async () => {
                const response = await api.post<{ message: string }>('/auth/logout');
                if (response.success) {
                    showSuccessMessage('로그아웃되었습니다.');
                }
                return response;
            },
            '로그아웃'
        );
    }

    /**
     * 회원가입
     */
    static async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await api.post<AuthResponse>('/auth/register', userData);
            if (response.success) {
                showSuccessMessage('회원가입이 완료되었습니다.');
            }
            return response;
        } catch (error: any) {
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

    /**
     * 비밀번호 재설정 요청
     */
    static async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
        return this.handleApiCallWithSuccess(
            () => api.post<{ message: string }>('/auth/password-reset/request', { email }),
            '비밀번호 재설정 이메일이 발송되었습니다.',
            '비밀번호 재설정 요청'
        );
    }

    /**
     * 비밀번호 재설정 실행
     */
    static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
        return this.handleApiCallWithSuccess(
            () => api.post<{ message: string }>('/auth/password-reset/confirm', { token, newPassword }),
            '비밀번호가 성공적으로 변경되었습니다.',
            '비밀번호 재설정'
        );
    }

    /**
     * 이메일 인증 요청
     */
    static async requestEmailVerification(): Promise<ApiResponse<{ message: string }>> {
        return this.handleApiCallWithSuccess(
            () => api.post<{ message: string }>('/auth/email-verification/request'),
            '인증 이메일이 발송되었습니다.',
            '이메일 인증 요청'
        );
    }

    /**
     * 이메일 인증 확인
     */
    static async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
        return this.handleApiCallWithSuccess(
            () => api.post<{ message: string }>('/auth/email-verification/confirm', { token }),
            '이메일 인증이 완료되었습니다.',
            '이메일 인증'
        );
    }

    /**
     * 현재 사용자 정보 조회
     */
    static async getCurrentUser(): Promise<ApiResponse<User>> {
        try {
            return await api.get<User>('/auth/me');
        } catch (error: any) {
            console.error('현재 사용자 정보 조회 중 오류 발생:', error);

            // 401 오류인 경우 인증되지 않은 상태로 처리
            if (error.statusCode === 401) {
                return {
                    success: false,
                    error: '인증이 필요합니다.'
                };
            }

            throw error;
        }
    }

    /**
     * 사용자 세션 확인
     */
    static async checkSession(): Promise<ApiResponse<SessionResponse>> {
        try {
            return await api.get<SessionResponse>('/auth/session');
        } catch (error) {
            console.error('세션 확인 중 오류 발생:', error);

            // 세션 확인은 조용히 실패 처리
            return {
                success: false,
                error: '세션을 확인할 수 없습니다.'
            };
        }
    }

    /**
     * 토큰 갱신
     */
    static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
        try {
            return await api.post<{ token: string }>('/auth/refresh');
        } catch (error) {
            console.error('토큰 갱신 중 오류 발생:', error);

            // 토큰 갱신 실패는 조용히 처리
            return {
                success: false,
                error: '토큰 갱신에 실패했습니다.'
            };
        }
    }

    /**
     * 계정 삭제
     */
    static async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
        return this.handleApiCallWithSuccess(
            () => api.delete<{ message: string }>('/auth/account'),
            '계정이 성공적으로 삭제되었습니다.',
            '계정 삭제'
        );
    }

    /**
     * 비밀번호 변경
     */
    static async changePassword(
        currentPassword: string,
        newPassword: string
    ): Promise<ApiResponse<{ message: string }>> {
        return this.handleApiCallWithSuccess(
            () => api.put<{ message: string }>('/auth/password', { currentPassword, newPassword }),
            '비밀번호가 성공적으로 변경되었습니다.',
            '비밀번호 변경'
        );
    }

    /**
     * 프로필 업데이트
     */
    static async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
        return this.handleApiCallWithSuccess(
            () => api.put<User>('/auth/profile', profileData),
            '프로필이 성공적으로 업데이트되었습니다.',
            '프로필 업데이트'
        );
    }
}
