/**
 * 인증 관련 API
 */
import { apiClient, ApiResponse } from './client';

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetData {
    token: string;
    newPassword: string;
}

export interface TokenResendRequest {
    email: string;
    type: 'email-verification' | 'password-reset';
}

export interface TokenValidationParams {
    token: string;
    type: 'email-verification' | 'password-reset';
}

export class AuthApi {
    /**
     * 비밀번호 재설정 링크 요청
     */
    static async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.post<void>('/auth/request-password-reset', { email });
            return response;
        } catch (error) {
            console.error('비밀번호 재설정 링크 요청 중 오류:', error);
            return {
                success: false,
                error: '비밀번호 재설정 링크 요청에 실패했습니다.',
            };
        }
    }

    /**
     * 비밀번호 재설정
     */
    static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.post<void>('/auth/reset-password', {
                token,
                newPassword
            });
            return response;
        } catch (error) {
            console.error('비밀번호 재설정 중 오류:', error);
            return {
                success: false,
                error: '비밀번호 재설정에 실패했습니다.',
            };
        }
    }

    /**
     * 토큰 재발행 요청
     */
    static async resendToken(email: string, type: 'email-verification' | 'password-reset'): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.post<void>('/auth/resend-token', {
                email,
                type
            });
            return response;
        } catch (error) {
            console.error('토큰 재발행 요청 중 오류:', error);
            return {
                success: false,
                error: '토큰 재발행 요청에 실패했습니다.',
            };
        }
    }

    /**
     * 토큰 유효성 검사
     */
    static async validateToken(token: string, type: 'email-verification' | 'password-reset'): Promise<ApiResponse<{ valid: boolean }>> {
        try {
            const response = await apiClient.get<{ valid: boolean }>(`/auth/validate-token?token=${token}&type=${type}`);
            return response;
        } catch (error) {
            console.error('토큰 유효성 검사 중 오류:', error);
            return {
                success: false,
                error: '토큰 유효성 검사에 실패했습니다.',
            };
        }
    }

    /**
     * 이메일 인증
     */
    static async verifyEmail(token: string): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.post<void>('/auth/verify-email', { token });
            return response;
        } catch (error) {
            console.error('이메일 인증 중 오류:', error);
            return {
                success: false,
                error: '이메일 인증에 실패했습니다.',
            };
        }
    }

    /**
     * 이메일 인증 재요청
     */
    static async resendEmailVerification(email: string): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.post<void>('/auth/resend-email-verification', { email });
            return response;
        } catch (error) {
            console.error('이메일 인증 재요청 중 오류:', error);
            return {
                success: false,
                error: '이메일 인증 재요청에 실패했습니다.',
            };
        }
    }
}

export default AuthApi;
