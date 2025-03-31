/**
 * 사용자 관련 API
 */
import api from '/js/api/index.js';
import { showErrorMessage } from '/js/common/util/notification.js';

class UserAPI {
    // 회원가입
    static async register(userData) {
        try {
            return await api.post('/user', userData);
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);
            showErrorMessage('회원가입에 실패했습니다.');
            throw error;
        }
    }

    // 프로필 조회
    static async getProfile() {
        try {
            return await api.get('/user/me');
        } catch (error) {
            console.error('프로필 조회 중 오류 발생:', error);
            showErrorMessage('프로필 정보를 불러오는데 실패했습니다.');
            throw error;
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
            return await api.post('/user/logout');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            showErrorMessage('로그아웃에 실패했습니다.');
            throw error;
        }
    }
}

export default UserAPI;
