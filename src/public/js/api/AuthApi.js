import api from './api.js';
import { showErrorMessage } from 'js/common/utils/notification.js';

export default class AuthApi {
    // 비밀번호 재설정 링크 요청
    static async requestPasswordReset(email) {
        try {
            const response = await api.post('/auth/request-password-reset', { email });
            return response.data;
        } catch (error) {
            console.error('비밀번호 재설정 링크 요청 중 오류:', error);
            showErrorMessage('비밀번호 재설정 링크 요청에 실패했습니다.');
            throw error;
        }
    }

    // 비밀번호 재설정
    static async resetPassword(token, newPassword) {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            return response.data;
        } catch (error) {
            console.error('비밀번호 재설정 중 오류:', error);
            showErrorMessage('비밀번호 재설정에 실패했습니다.');
            throw error;
        }
    }
}
