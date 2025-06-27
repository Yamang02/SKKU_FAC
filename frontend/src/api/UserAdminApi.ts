import BaseApi from '../shared/api/BaseApi';
import type { ApiResponse } from '../shared/api/types';
import type {
    AdminUserDetail,
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    AdminUserSearchParams,
    AdminUserListResponse,
    BackendUserListResponse,
    AdminPasswordResetResponse,
    AdminUserStats
} from '../types/user.types';

/**
 * 관리자용 User API 클래스
 * 백엔드 /api/admin/users 엔드포인트에 맞게 구현
 */
export class UserAdminApi {
    private static readonly basePath = '/api/admin/users';

    /**
     * 사용자 목록 조회 - GET /api/admin/users
     */
    static async getUsers(params: AdminUserSearchParams = {}): Promise<ApiResponse<BackendUserListResponse>> {
        return BaseApi.get<BackendUserListResponse>(this.basePath, params as Record<string, unknown>);
    }

    /**
     * 특정 사용자 조회 - GET /api/admin/users/:id
     */
    static async getUser(id: string): Promise<ApiResponse<AdminUserDetail>> {
        return BaseApi.get<AdminUserDetail>(`${this.basePath}/${id}`);
    }

    /**
     * 사용자 생성 - POST /api/admin/users
     */
    static async createUser(userData: AdminCreateUserRequest): Promise<ApiResponse<AdminUserDetail>> {
        return BaseApi.post<AdminUserDetail>(this.basePath, userData);
    }

    /**
     * 사용자 정보 수정 - PUT /api/admin/users/:id
     */
    static async updateUser(id: string, userData: AdminUpdateUserRequest): Promise<ApiResponse<AdminUserDetail>> {
        return BaseApi.put<AdminUserDetail>(`${this.basePath}/${id}`, userData);
    }

    /**
     * 사용자 삭제 - DELETE /api/admin/users/:id
     */
    static async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
        return BaseApi.delete<{ message: string }>(`${this.basePath}/${id}`);
    }

    /**
     * 사용자 역할 변경 - PUT /api/admin/users/:id/role
     */
    static async updateUserRole(id: string, role: 'ADMIN' | 'SKKU_MEMBER' | 'EXTERNAL_MEMBER'): Promise<ApiResponse<AdminUserDetail>> {
        return BaseApi.put<AdminUserDetail>(`${this.basePath}/${id}/role`, { role });
    }

    /**
     * 비밀번호 초기화 - POST /api/admin/users/:id/reset-password
     */
    static async resetPassword(id: string): Promise<ApiResponse<AdminPasswordResetResponse>> {
        return BaseApi.post<AdminPasswordResetResponse>(`${this.basePath}/${id}/reset-password`, {});
    }

    /**
     * 사용자 통계 조회 - GET /api/admin/users/stats
     */
    static async getUserStats(): Promise<ApiResponse<AdminUserStats>> {
        return BaseApi.get<AdminUserStats>(`${this.basePath}/stats`);
    }
}
