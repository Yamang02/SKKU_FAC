/**
 * 사용자 관련 API - React Native Web 버전
 */
import api from '../utils/api.js';
import { showErrorMessage } from '../utils/notification.js';

export default class UserApi {
    // 회원가입
    static async register(userData) {
        try {
            const response = await api.post('/user', userData);
            return response.data;
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);
            showErrorMessage(`회원가입 오류: ${error.message}`);
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
            if (error.statusCode === 401) {
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

    // 세션 사용자 조회
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

    // 아이디 찾기
    static async findUsername(email) {
        try {
            const response = await api.get(`/user/api/find-username?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('아이디 찾기 중 오류 발생:', error);
            throw error;
        }
    }

    // 관리자용 - 사용자 목록 조회
    static async getUserList(pagination, filters = {}) {
        try {
            const params = new URLSearchParams();

            // 페이지네이션 파라미터
            if (pagination) {
                params.set('page', pagination.page || 1);
                params.set('limit', pagination.limit || 10);
            }

            // 필터 파라미터
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, value);
                }
            });

            const queryString = params.toString();
            return await api.get(`/admin/management/user/list?${queryString}`);
        } catch (error) {
            console.error('관리자용 사용자 목록 조회 중 오류 발생:', error);
            showErrorMessage('사용자 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // getUsers 별칭 - useUsers 훅에서 사용
    static async getUsers(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // 파라미터 처리
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.set(key, value);
                }
            });

            const queryString = queryParams.toString();

            // API 엔드포인트 변경: RESTful API 사용
            return await api.get(`/api/admin/users?${queryString}`);
        } catch (error) {
            console.error('사용자 목록 조회 중 오류 발생:', error);

            // 오류 발생 시 안전한 응답 반환
            return {
                success: false,
                error: '사용자 목록을 불러오는 중 오류가 발생했습니다.',
                data: {
                    users: [],
                    total: 0
                }
            };
        }
    }

    // 관리자용 - 사용자 상세 조회
    static async getUserDetail(userId) {
        try {
            return await api.get(`/admin/management/user/${userId}`);
        } catch (error) {
            console.error(`사용자 상세 정보(ID: ${userId}) 조회 중 오류 발생:`, error);
            showErrorMessage('사용자 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 사용자 정보 수정
    static async updateUser(userId, updateData) {
        try {
            return await api.put(`/admin/management/user/${userId}`, updateData);
        } catch (error) {
            console.error(`사용자 정보 수정(ID: ${userId}) 중 오류 발생:`, error);
            showErrorMessage('사용자 정보 수정에 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 사용자 삭제
    static async deleteUser(userId) {
        try {
            return await api.delete(`/admin/management/user/${userId}`);
        } catch (error) {
            console.error(`사용자 삭제(ID: ${userId}) 중 오류 발생:`, error);
            showErrorMessage('사용자 삭제에 실패했습니다.');
            throw error;
        }
    }
}
