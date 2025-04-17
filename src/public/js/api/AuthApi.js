import api from './index.js';

export default class AuthApi {
    // 비밀번호 재설정 링크 요청
    static async requestPasswordReset(email) {
        try {
            const response = await api.post('/auth/request-password-reset', { email });
            return response;
        } catch (error) {
            console.error('비밀번호 재설정 링크 요청 중 오류:', error);
            throw error;
        }
    }

    // 비밀번호 재설정
    static async resetPassword(token, newPassword) {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            return response;
        } catch (error) {
            console.error('비밀번호 재설정 중 오류:', error);
            throw error;
        }
    }

    // 토큰 재발행 요청
    static async resendToken(email, type) {
        try {
            const response = await api.post('/auth/resend-token', { email, type });
            return response;
        } catch (error) {
            console.error('토큰 재발행 요청 중 오류:', error);
            throw error;
        }
    }

    // 토큰 유효성 검사
    static async validateToken(token, type) {
        try {
            const response = await api.get(`/auth/validate-token?token=${token}&type=${type}`);
            return response;
        } catch (error) {
            console.error('토큰 유효성 검사 중 오류:', error);
            throw error;
        }
    }
}
