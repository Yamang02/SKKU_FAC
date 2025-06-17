/**
 * 관리자용 사용자 API
 * Admin 도메인의 사용자 관리 기능을 제공합니다.
 */
import BaseApi from '../common/BaseApi.js';

export class AdminUserApi extends BaseApi {
    static baseEndpoint = '/api/admin/users';

    // 사용자 목록 조회 (관리자)
    static async getUserList(pagination = {}, filters = {}) {
        try {
            const params = {
                ...pagination,
                ...filters
            };

            const response = await this.get(this.baseEndpoint, params);

            return this.safeResponse(response, {
                data: {
                    items: response.data?.items || [],
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
            console.error('Admin user list fetch error:', error);
            return this.errorResponse('사용자 목록을 불러오는데 실패했습니다.');
        }
    }

    // 사용자 상세 조회 (관리자)
    static async getUserDetail(userId) {
        try {
            const response = await this.get(`${this.baseEndpoint}/${userId}`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('Admin user detail fetch error:', error);
            return this.errorResponse('사용자 정보를 불러오는데 실패했습니다.');
        }
    }

    // 사용자 수정 (관리자)
    static async updateUser(userId, updateData) {
        try {
            const response = await this.put(`${this.baseEndpoint}/${userId}`, updateData);
            return this.safeResponse(response, null, '사용자 정보가 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('Admin user update error:', error);
            return this.errorResponse('사용자 정보 수정에 실패했습니다.');
        }
    }

    // 사용자 삭제 (관리자)
    static async deleteUser(userId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/${userId}`);
            return this.safeResponse(response, null, '사용자가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('Admin user deletion error:', error);
            return this.errorResponse('사용자 삭제에 실패했습니다.');
        }
    }

    // 사용자 상태 변경 (관리자)
    static async updateUserStatus(userId, status) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${userId}/status`, { status });
            return this.safeResponse(response, null, `사용자 상태가 ${status}로 변경되었습니다.`);
        } catch (error) {
            console.error('Admin user status update error:', error);
            return this.errorResponse('사용자 상태 변경에 실패했습니다.');
        }
    }

    // 사용자 역할 변경 (관리자)
    static async updateUserRole(userId, role) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${userId}/role`, { role });
            return this.safeResponse(response, null, `사용자 역할이 ${role}로 변경되었습니다.`);
        } catch (error) {
            console.error('Admin user role update error:', error);
            return this.errorResponse('사용자 역할 변경에 실패했습니다.');
        }
    }

    // 사용자 비밀번호 재설정 (관리자)
    static async resetUserPassword(userId) {
        try {
            const response = await this.post(`${this.baseEndpoint}/${userId}/reset-password`);
            return this.safeResponse(response, null, '사용자 비밀번호가 재설정되었습니다.');
        } catch (error) {
            console.error('Admin user password reset error:', error);
            return this.errorResponse('사용자 비밀번호 재설정에 실패했습니다.');
        }
    }

    // 하위 호환성을 위한 별칭들
    static async getUsers(pagination, filters) {
        return this.getUserList(pagination, filters);
    }

    static async getUserById(userId) {
        return this.getUserDetail(userId);
    }
}

export default AdminUserApi;
