import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';
import UserService from '../service/UserService.js';


export default class UserController {
    constructor() {
        this.userService = new UserService();
    }


    // === 사용자 페이지 렌더링 ===
    /**
     * 로그인 페이지를 렌더링합니다.
     */
    getUserLoginPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN);
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 회원가입 페이지를 렌더링합니다.
     */
    getUserRegistrationPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER);
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 프로필 페이지를 렌더링합니다.
     */
    async getUserProfilePage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.MAIN.USER.PROFILE);
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 비밀번호 재설정 페이지를 렌더링합니다.
     */
    getUserPasswordResetPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD);
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }


    // === 관리자용 사용자 관리 ===
    /**
     * 관리자용 사용자 목록을 조회합니다.
     */
    async getManagementUserList(req, res) {
        try {
            const { page = 1, limit = 10, keyword } = req.query;
            const userList = await this.userService.getUserList({
                page: parseInt(page),
                limit: parseInt(limit),
                keyword
            });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.LIST, {
                title: '회원 관리',
                users: userList.items || [],
                page: userList.page,
                filters: { keyword }
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 사용자 상세를 조회합니다.
     */
    async getManagementUserDetail(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserDetail(id);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.DETAIL, {
                title: '회원 상세',
                user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 사용자 정보를 수정합니다.
     */
    async updateManagementUser(req, res) {
        try {
            const userId = req.params.id;
            const updateData = req.body;

            await this.userService.updateUser(userId, updateData);
            res.json({
                success: true,
                message: '회원 정보가 저장되었습니다.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || '회원 정보 저장 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 사용자를 삭제합니다.
     */
    async deleteManagementUser(req, res) {
        try {
            const userId = req.params.id;
            await this.userService.deleteUser(userId);

            res.json({
                success: true,
                message: '회원이 삭제되었습니다.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || '회원 삭제 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 이메일 인증을 처리합니다.
     */
    async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            if (!token) {
                throw new Error('잘못된 요청입니다.');
            }

            await this.userService.verifyEmail(token);

            req.session.flash = {
                type: 'success',
                message: '이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.'
            };

            ViewResolver.render(res, ViewPath.SUCCESS, {
                message: '이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.'
            });
        } catch (error) {
            // 실패 메시지와 함께 에러 페이지 렌더링
            req.session.flash = {
                type: 'error',
                message: error.message || '이메일 인증에 실패했습니다.'
            };

            ViewResolver.renderError(res, error);
        }
    }

}
