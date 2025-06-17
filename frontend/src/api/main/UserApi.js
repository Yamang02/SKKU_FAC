/**
 * 일반 사용자 API
 * Main 도메인의 사용자 관련 기능을 제공합니다.
 */
import api from '../../utils/api.js';
import BaseApi from '../common/BaseApi.js';

export class UserApi extends BaseApi {
    static baseEndpoint = '/api/users';

    /**
     * 회원가입
     * @param {Object} userData - 사용자 데이터
     * @returns {Promise} API 응답
     */
    static async register(userData) {
        return this.handleApiCall(
            () => api.post('/user', userData),
            '회원가입'
        );
    }

    /**
     * 프로필 조회
     * @returns {Promise} API 응답
     */
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

    /**
     * 프로필 수정
     * @param {Object} profileData - 프로필 데이터
     * @returns {Promise} API 응답
     */
    static async updateProfile(profileData) {
        return this.handleApiCall(
            () => api.put('/user/me', profileData),
            '프로필 수정'
        );
    }

    /**
     * 계정 삭제
     * @returns {Promise} API 응답
     */
    static async deleteAccount() {
        return this.handleApiCall(
            () => api.delete('/user/me'),
            '계정 삭제'
        );
    }

    /**
     * 로그인
     * @param {Object} credentials - 로그인 정보
     * @returns {Promise} API 응답
     */
    static async login(credentials) {
        return this.handleApiCall(
            () => api.post('/user/login', credentials),
            '로그인'
        );
    }

    /**
     * 로그아웃
     * @returns {Promise} API 응답
     */
    static async logout() {
        return this.handleApiCall(
            () => api.get('/user/logout', {
                headers: {
                    'Accept': 'application/json'
                }
            }),
            '로그아웃'
        );
    }

    /**
     * 세션 사용자 조회
     * @returns {Promise} API 응답
     */
    static async getSessionUser() {
        return this.handleApiCall(
            () => api.get('/user/api/session'),
            '세션 사용자 조회',
            false // 에러 메시지 표시하지 않음
        );
    }

    /**
     * 플래시 메시지 조회
     * @returns {Promise} API 응답
     */
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

    /**
     * 아이디 찾기
     * @param {string} email - 이메일
     * @returns {Promise} API 응답
     */
    static async findUsername(email) {
        return this.handleApiCall(
            () => api.get(`/user/api/find-username?email=${encodeURIComponent(email)}`),
            '아이디 찾기'
        );
    }

    // 사용자 목록 조회 (일반)
    static async getUserList(pagination = {}, filters = {}) {
        try {
            const params = {
                ...pagination,
                ...filters
            };

            const response = await this.get(this.baseEndpoint, params);

            return this.safeResponse(response, {
                data: {
                    users: response.data?.items || [],
                    total: response.data?.total || 0,
                    page: {
                        currentPage: response.data?.page || 1,
                        totalPages: response.data?.totalPages || 1,
                        hasNextPage: response.data?.hasNextPage || false,
                        hasPreviousPage: response.data?.hasPreviousPage || false
                    }
                }
            });
        } catch (error) {
            console.error('User list fetch error:', error);
            return this.errorResponse('사용자 목록을 불러오는데 실패했습니다.');
        }
    }

    // 사용자 상세 조회 (일반)
    static async getUserDetail(userId) {
        try {
            const response = await this.get(`${this.baseEndpoint}/${userId}`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('User detail fetch error:', error);
            return this.errorResponse('사용자 정보를 불러오는데 실패했습니다.');
        }
    }

    // 사용자 등록
    static async createUser(userData) {
        try {
            const response = await this.post(this.baseEndpoint, userData);
            return this.safeResponse(response, null, '사용자가 성공적으로 등록되었습니다.');
        } catch (error) {
            console.error('User creation error:', error);
            return this.errorResponse('사용자 등록에 실패했습니다.');
        }
    }

    // 사용자 정보 수정
    static async updateUser(userId, userData) {
        try {
            const response = await this.put(`${this.baseEndpoint}/${userId}`, userData);
            return this.safeResponse(response, null, '사용자 정보가 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('User update error:', error);
            return this.errorResponse('사용자 정보 수정에 실패했습니다.');
        }
    }

    // 사용자 삭제
    static async deleteUser(userId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/${userId}`);
            return this.safeResponse(response, null, '사용자가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('User deletion error:', error);
            return this.errorResponse('사용자 삭제에 실패했습니다.');
        }
    }

    // 프로필 조회
    static async getUserProfile(userId) {
        try {
            const response = await this.get(`${this.baseEndpoint}/${userId}/profile`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('User profile fetch error:', error);
            return this.errorResponse('사용자 프로필을 불러오는데 실패했습니다.');
        }
    }

    // 프로필 수정
    static async updateUserProfile(userId, profileData) {
        try {
            const response = await this.put(`${this.baseEndpoint}/${userId}/profile`, profileData);
            return this.safeResponse(response, null, '프로필이 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('User profile update error:', error);
            return this.errorResponse('프로필 수정에 실패했습니다.');
        }
    }

    // 비밀번호 변경
    static async changePassword(userId, passwordData) {
        try {
            const response = await this.put(`${this.baseEndpoint}/${userId}/password`, passwordData);
            return this.safeResponse(response, null, '비밀번호가 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('Password change error:', error);
            return this.errorResponse('비밀번호 변경에 실패했습니다.');
        }
    }

    // 프로필 이미지 업로드
    static async uploadProfileImage(userId, imageFile) {
        try {
            const formData = this.createFormData({ image: imageFile });
            const response = await this.postFormData(`${this.baseEndpoint}/${userId}/profile/image`, formData);
            return this.safeResponse(response, null, '프로필 이미지가 성공적으로 업로드되었습니다.');
        } catch (error) {
            console.error('Profile image upload error:', error);
            return this.errorResponse('프로필 이미지 업로드에 실패했습니다.');
        }
    }

    // 사용자 작품 목록 조회
    static async getUserArtworks(userId, pagination = {}, filters = {}) {
        try {
            const params = {
                ...pagination,
                ...filters
            };

            const response = await this.get(`${this.baseEndpoint}/${userId}/artworks`, params);

            return this.safeResponse(response, {
                data: {
                    artworks: response.data?.items || [],
                    total: response.data?.total || 0,
                    page: {
                        currentPage: response.data?.page || 1,
                        totalPages: response.data?.totalPages || 1,
                        hasNextPage: response.data?.hasNextPage || false,
                        hasPreviousPage: response.data?.hasPreviousPage || false
                    }
                }
            });
        } catch (error) {
            console.error('User artworks fetch error:', error);
            return this.errorResponse('사용자 작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 하위 호환성을 위한 별칭들
    static async getUsers(pagination, filters) {
        return this.getUserList(pagination, filters);
    }

    static async getUser(userId) {
        return this.getUserDetail(userId);
    }
}

export default UserApi;
