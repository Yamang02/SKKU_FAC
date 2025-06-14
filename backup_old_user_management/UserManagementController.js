import ViewResolver from '../../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../../common/constants/ViewPath.js';
import BaseAdminController from '../BaseAdminController.js';

export default class UserManagementController extends BaseAdminController {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['UserManagementService'];

    constructor(userManagementService = null) {
        super('UserManagementController');

        // 의존성 주입 방식 (새로운 방식)
        if (userManagementService) {
            this.userManagementService = userManagementService;
        } else {
            // 기존 방식 호환성 유지 (임시)

            throw new Error('UserManagementService가 주입되지 않았습니다.');
        }
    }

    /**
     * 관리자 사용자 목록 페이지를 렌더링합니다.
     */
    async getManagementUserList(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const { page = 1, limit = 10, search, role, status } = req.query;

                const filters = {};
                if (search) filters.search = search;
                if (role) filters.role = role;
                if (status) filters.status = status;

                const result = await this.userManagementService.getUserList({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    filters
                });

                const pagination = this.createPaginationInfo(page, limit, result.total);

                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.LIST, {
                    title: '사용자 관리',
                    users: result.users,
                    pagination,
                    filters,
                    currentPage: parseInt(page)
                });
            },
            req,
            res,
            {
                operationName: '사용자 목록 조회',
                errorRedirectPath: '/admin',
                errorMessage: '사용자 목록을 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 사용자 상세 페이지를 렌더링합니다.
     */
    async getManagementUserDetail(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const userId = req.params.id;
                const user = await this.userManagementService.getUserDetail(userId);

                if (!user) {
                    throw new Error('사용자를 찾을 수 없습니다.');
                }

                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.DETAIL, {
                    title: `사용자 상세 - ${user.name}`,
                    user
                });
            },
            req,
            res,
            {
                operationName: '사용자 상세 조회',
                errorRedirectPath: '/admin/management/user',
                errorMessage: '사용자 정보를 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 사용자 정보를 수정합니다.
     */
    async updateManagementUser(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const userId = req.params.id;
                const userData = req.body;

                await this.userManagementService.updateUser(userId, userData);

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '사용자 정보 수정',
                successRedirectPath: `/admin/management/user/${req.params.id}`,
                successMessage: '사용자 정보가 성공적으로 수정되었습니다.',
                errorRedirectPath: `/admin/management/user/${req.params.id}`,
                errorMessage: '사용자 정보 수정 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 사용자를 삭제합니다.
     */
    async deleteManagementUser(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const userId = req.params.id;
                await this.userManagementService.deleteUser(userId);

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '사용자 삭제',
                successRedirectPath: '/admin/management/user',
                successMessage: '사용자가 성공적으로 삭제되었습니다.',
                errorRedirectPath: '/admin/management/user',
                errorMessage: '사용자 삭제 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 사용자 비밀번호를 초기화합니다.
     */
    async resetManagementUserPassword(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const userId = req.params.id;
                const result = await this.userManagementService.resetUserPassword(userId);

                // 임시 비밀번호를 플래시 메시지로 전달
                req.flash('info', `임시 비밀번호: ${result.temporaryPassword}`);

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '사용자 비밀번호 초기화',
                successRedirectPath: `/admin/management/user/${req.params.id}`,
                successMessage: '사용자 비밀번호가 성공적으로 초기화되었습니다.',
                errorRedirectPath: `/admin/management/user/${req.params.id}`,
                errorMessage: '사용자 비밀번호 초기화 중 오류가 발생했습니다.'
            }
        );
    }
}
