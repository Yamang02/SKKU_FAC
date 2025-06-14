import UserService from '../../../user/service/UserService.js';
import BaseAdminService from '../BaseAdminService.js';

export default class UserManagementService extends BaseAdminService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['UserService'];

    constructor(userService = null) {
        super('UserManagementService');

        // 의존성 주입 방식 (새로운 방식)
        if (userService) {
            this.userService = userService;
        } else {
            // 기존 방식 호환성 유지 (임시)

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
        return this.safeExecute(
            async () => {
                const { page, limit, filters } = options;
                return await this.userService.getUserList({ page, limit, filters });
            },
            '사용자 목록 조회',
            { options }
        );
    }

    /**
     * 사용자 상세 정보를 조회합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Object>} 사용자 상세 데이터
     */
    async getUserDetail(userId) {
        return this.safeExecute(
            async () => {
                return await this.userService.getUserDetail(userId);
            },
            '사용자 상세 조회',
            { userId }
        );
    }

    /**
     * 사용자 정보를 수정합니다.
     * @param {string} userId - 사용자 ID
     * @param {Object} userData - 수정할 사용자 데이터
     * @returns {Promise<boolean>} 성공 여부
     */
    async updateUser(userId, userData) {
        return this.safeExecute(
            async () => {
                return await this.userService.updateUserByAdmin(userId, userData);
            },
            '사용자 정보 수정',
            { userId, userData }
        );
    }

    /**
     * 사용자를 삭제합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteUser(userId) {
        return this.safeExecute(
            async () => {
                return await this.userService.deleteUser(userId);
            },
            '사용자 삭제',
            { userId }
        );
    }

    /**
     * 사용자 비밀번호를 초기화합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Object>} 초기화 결과와 임시 비밀번호
     */
    async resetUserPassword(userId) {
        return this.safeExecute(
            async () => {
                return await this.userService.resetUserPassword(userId);
            },
            '사용자 비밀번호 초기화',
            { userId }
        );
    }

    /**
     * 대량 사용자 삭제 (배치 처리용)
     * @param {Array<string>} userIds - 삭제할 사용자 ID 목록
     * @returns {Promise<Object>} 삭제 결과
     */
    async bulkDeleteUsers(userIds) {
        return this.safeExecute(
            async () => {
                const results = {
                    deleted: [],
                    failed: [],
                    skipped: []
                };

                for (const userId of userIds) {
                    try {
                        // 관리자 계정은 삭제 방지
                        const user = await this.userService.getUserDetail(userId);
                        if (user && user.role === 'ADMIN') {
                            results.skipped.push({
                                userId,
                                reason: '관리자 계정은 삭제할 수 없습니다.'
                            });
                            continue;
                        }

                        const success = await this.userService.deleteUser(userId);
                        if (success) {
                            results.deleted.push(userId);
                            this.logSuccess('대량 사용자 삭제 - 개별 성공', { userId });
                        } else {
                            results.failed.push({
                                userId,
                                reason: '삭제 처리 실패'
                            });
                        }
                    } catch (error) {
                        results.failed.push({
                            userId,
                            reason: error.message
                        });
                        this.handleError(error, '대량 사용자 삭제 - 개별 실패', { userId });
                    }
                }

                this.logSuccess('대량 사용자 삭제 완료', {
                    total: userIds.length,
                    deleted: results.deleted.length,
                    failed: results.failed.length,
                    skipped: results.skipped.length
                });

                return results;
            },
            '대량 사용자 삭제',
            { userCount: userIds.length }
        );
    }

    /**
     * 대량 사용자 업데이트 (배치 처리용)
     * @param {Array<Object>} updates - 업데이트할 사용자 정보 목록
     * @returns {Promise<Object>} 업데이트 결과
     */
    async bulkUpdateUsers(updates) {
        return this.safeExecute(
            async () => {
                const results = {
                    updated: [],
                    failed: []
                };

                for (const update of updates) {
                    try {
                        const { userId, userData } = update;
                        const success = await this.userService.updateUserByAdmin(userId, userData);

                        if (success) {
                            results.updated.push(userId);
                            this.logSuccess('대량 사용자 업데이트 - 개별 성공', { userId, userData });
                        } else {
                            results.failed.push({
                                userId,
                                reason: '업데이트 처리 실패'
                            });
                        }
                    } catch (error) {
                        results.failed.push({
                            userId: update.userId,
                            reason: error.message
                        });
                        this.handleError(error, '대량 사용자 업데이트 - 개별 실패', { update });
                    }
                }

                this.logSuccess('대량 사용자 업데이트 완료', {
                    total: updates.length,
                    updated: results.updated.length,
                    failed: results.failed.length
                });

                return results;
            },
            '대량 사용자 업데이트',
            { updateCount: updates.length }
        );
    }
}
