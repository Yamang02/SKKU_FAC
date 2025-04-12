import { ViewPath } from '../../../../common/constants/ViewPath.js';
import ViewResolver from '../../../../common/utils/ViewResolver.js';
import UserManagementService from '../../service/user/UserManagementService.js';
import UserManagementDto from '../../model/dto/user/UserManagementDto.js';
import UserListManagementDto from '../../model/dto/user/UserListManagementDto.js';

export default class UserManagementController {
    constructor() {
        this.userManagementService = new UserManagementService();
    }

    /**
     * 관리자 사용자 목록 페이지를 렌더링합니다.
     */
    async getManagementUserList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                status: req.query.status,
                role: req.query.role,
                keyword: req.query.keyword
            };

            const userListData = await this.userManagementService.getUserList({ page, limit, filters });
            const userListDto = new UserListManagementDto(userListData);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.LIST, {
                title: '사용자 관리',
                breadcrumb: '사용자 관리',
                currentPage: 'user',
                filters,
                users: userListDto.items,
                page: userListDto.page,
                total: userListDto.total
            });
        } catch (error) {
            console.error('사용자 목록 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 사용자 상세 페이지를 렌더링합니다.
     */
    async getManagementUserDetail(req, res) {
        try {
            const userId = req.params.id;

            const userData = await this.userManagementService.getUserDetail(userId);
            const userDto = new UserManagementDto(userData);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.DETAIL, {
                title: '사용자 상세',
                breadcrumb: '사용자 상세',
                currentPage: 'user',
                user: userDto
            });
        } catch (error) {
            console.error('사용자 상세 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 사용자 정보를 수정합니다.
     */
    async updateManagementUser(req, res) {
        try {
            const userId = req.params.id;
            const userData = req.body;

            await this.userManagementService.updateUser(userId, userData);

            req.flash('success', '사용자 정보가 성공적으로 수정되었습니다.');
            res.redirect(`/admin/management/user/${userId}`);
        } catch (error) {
            console.error('사용자 정보 수정 중 오류:', error);
            req.flash('error', '사용자 정보 수정 중 오류가 발생했습니다.');
            const userId = req.params.id;
            res.redirect(`/admin/management/user/${userId}`);
        }
    }

    /**
     * 관리자 사용자를 삭제합니다.
     */
    async deleteManagementUser(req, res) {
        try {
            const userId = req.params.id;

            await this.userManagementService.deleteUser(userId);

            req.flash('success', '사용자가 성공적으로 삭제되었습니다.');
            res.redirect('/admin/management/user');
        } catch (error) {
            console.error('사용자 삭제 중 오류:', error);
            req.flash('error', '사용자 삭제 중 오류가 발생했습니다.');
            res.redirect('/admin/management/user');
        }
    }

    /**
     * 관리자 사용자 비밀번호를 초기화합니다.
     */
    async resetManagementUserPassword(req, res) {
        try {
            const userId = req.params.id;

            const result = await this.userManagementService.resetUserPassword(userId);

            req.flash('success', `비밀번호가 성공적으로 초기화되었습니다. 임시 비밀번호: ${result.tempPassword}`);
            res.redirect(`/admin/management/user/${userId}`);
        } catch (error) {
            console.error('사용자 비밀번호 초기화 중 오류:', error);
            req.flash('error', '사용자 비밀번호 초기화 중 오류가 발생했습니다.');
            const userId = req.params.id;
            res.redirect(`/admin/management/user/${userId}`);
        }
    }
}
