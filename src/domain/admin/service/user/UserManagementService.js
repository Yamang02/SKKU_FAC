import UserService from '../../../user/service/UserService.js';

export default class UserManagementService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['UserService'];

    constructor(userService = null) {
        // 의존성 주입 방식 (새로운 방식)
        if (userService) {
            this.userService = userService;
        } else {
            // 기존 방식 호환성 유지 (임시)
            // TODO: 모든 도메인 리팩토링 완료 후 제거 예정
            this.userService = new UserService();
        }
    }

    /**
     * 사용자 목록을 조회합니다.
     * @param {Object} options - 조회 옵션
     * @param {number} options.page - 페이지 번호
     * @param {number} options.limit - 페이지당 항목 수
     * @param {Object} options.filters - 필터링 옵션
     * @returns {Promise<Object>} 사용자 목록 데이터
     */
    async getUserList(options) {
        try {
            const { page, limit, filters } = options;
            return await this.userService.getUserList({ page, limit, filters });
        } catch (error) {
            console.error('사용자 목록 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 사용자 상세 정보를 조회합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Object>} 사용자 상세 데이터
     */
    async getUserDetail(userId) {
        try {
            return await this.userService.getUserDetail(userId);
        } catch (error) {
            console.error('사용자 상세 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 사용자 정보를 수정합니다.
     * @param {string} userId - 사용자 ID
     * @param {Object} userData - 수정할 사용자 데이터
     * @returns {Promise<boolean>} 성공 여부
     */
    async updateUser(userId, userData) {
        try {
            (userData);
            return await this.userService.updateUserByAdmin(userId, userData);
        } catch (error) {
            console.error('사용자 정보 수정 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 사용자를 삭제합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteUser(userId) {
        try {
            return await this.userService.deleteUser(userId);
        } catch (error) {
            console.error('사용자 삭제 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 사용자 비밀번호를 초기화합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Object>} 초기화 결과와 임시 비밀번호
     */
    async resetUserPassword(userId) {
        try {
            return await this.userService.resetUserPassword(userId);
        } catch (error) {
            console.error('사용자 비밀번호 초기화 서비스 오류:', error);
            throw error;
        }
    }
}
