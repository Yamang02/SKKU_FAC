/**
 * 사용자 관련 API
 */
import api from './index.js';
import { showErrorMessage } from '/js/common/util/notification.js';

export default class UserApi {
    // 회원가입
    static async register(userData) {
        try {
            const response = await api.post('/user', userData);
            return response.data;
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);
            ('회원가입 오류 : ', error);
            throw error;
        }
    }


    // 프로필 조회
    static async getProfile() {
        try {
            const response = await api.get('/user/api/me');
            return response;
        } catch (error) {
            console.error('프로필 조회 중 오류 발생:', error);

            // 401 오류인 경우 로그인 필요 메시지 반환
            if (error.response && error.response.status === 401) {
                return {
                    success: false,
                    error: '로그인이 필요합니다.',
                    status: 401
                };
            }

            // 기타 오류
            return {
                success: false,
                error: '사용자 정보를 불러오는 중 오류가 발생했습니다.',
                originalError: error.message
            };
        }
    }

    // 프로필 수정
    static async updateProfile(profileData) {
        try {
            return await api.put('/user/me', profileData);
        } catch (error) {
            console.error('프로필 수정 중 오류 발생:', error);
            showErrorMessage('프로필 수정에 실패했습니다.');
            throw error;
        }
    }

    // 계정 삭제
    static async deleteAccount() {
        try {
            return await api.delete('/user/me');
        } catch (error) {
            console.error('계정 삭제 중 오류 발생:', error);
            showErrorMessage('계정 삭제에 실패했습니다.');
            throw error;
        }
    }

    // 로그인
    static async login(credentials) {
        try {
            return await api.post('/user/login', credentials);
        } catch (error) {
            console.error('로그인 중 오류 발생:', error);
            showErrorMessage('로그인에 실패했습니다.');
            throw error;
        }
    }

    // 로그아웃
    static async logout() {
        try {
            return await api.get('/user/logout', {
                headers: {
                    'Accept': 'application/json'
                }
            });
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            showErrorMessage('로그아웃에 실패했습니다.');
            throw error;
        }
    }

    static async getSessionUser() {
        try {
            return await api.get('/user/api/session');
        } catch (error) {
            console.error('세션 사용자 조회 중 오류 발생:', error);
            throw error;
        }
    }

    // 플래시 메시지 조회
    static async getFlashMessage() {
        try {
            return await api.get('/user/api/flash-message');
        } catch (error) {
            console.error('플래시 메시지 조회 중 오류 발생:', error);
            // 에러가 발생해도 UI에 표시하지 않고 조용히 실패 처리
            return {
                success: false,
                error: '플래시 메시지를 조회하는 중 오류가 발생했습니다.',
                data: null
            };
        }
    }
}

