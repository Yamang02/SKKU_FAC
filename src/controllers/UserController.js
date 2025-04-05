import SessionUtil from '../utils/SessionUtil.js';
import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import UserService from '../services/user/UserService.js';
import { ApiResponse } from '../models/common/response/ApiResponse.js';
import { Message } from '../constants/Message.js';

export default class UserController {
    constructor() {
        this.userService = new UserService();
    }

    /**
     * 로그인 페이지를 렌더링합니다.
     */
    getUserLoginPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN);
    }

    /**
     * 로그인을 처리합니다.
     */
    async loginUser(req, res) {
        try {
            const { username, password } = req.body;

            // 서비스를 통한 인증 처리
            const user = await this.userService.authenticate(username, password);

            // 세션에 저장할 사용자 정보 구성
            const sessionUser = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                isAdmin: user.role === 'ADMIN',
                isClubMember: user.isClubMember,
                department: user.department,
                studentYear: user.studentYear,
                affiliation: user.affiliation
            };

            // 세션에 사용자 정보 저장
            await SessionUtil.saveUserToSession(req, sessionUser);

            const redirectUrl = req.body.redirectUrl || '/';
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('로그인 처리 중 오류:', error);
            ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN, {
                title: '로그인',
                error: error.message,
                username: req.body.username,
                redirectUrl: req.body.redirectUrl
            });
        }
    }

    /**
     * 로그아웃을 처리합니다.
     */
    async logoutUser(req, res) {
        try {
            await SessionUtil.destroySession(req);
            res.redirect('/');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            res.redirect('/');
        }
    }

    /**
     * 회원가입 페이지를 렌더링합니다.
     */
    getUserRegistrationPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER);
    }

    /**
     * 회원가입을 처리합니다.
     */
    async registerUser(req, res) {
        try {
            // 서비스를 통한 사용자 생성
            const user = await this.userService.createUser(req.body);

            // 세션에 저장할 사용자 정보 구성
            const sessionUser = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                isAdmin: user.role === 'ADMIN',
                isClubMember: user.isClubMember,
                department: user.department,
                studentYear: user.studentYear,
                affiliation: user.affiliation
            };

            // 세션에 사용자 정보 저장
            await SessionUtil.saveUserToSession(req, sessionUser);

            ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER, {
                success: '회원가입이 완료되었습니다. 로그인해주세요.'
            });
        } catch (error) {
            ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER, {
                error: error.message,
                formData: req.body
            });
        }
    }

    /**
     * 프로필 페이지를 렌더링합니다.
     */
    async getUserProfilePage(req, res) {
        try {
            const userId = req.session.user.id;
            const user = await this.userService.getUserDetail(userId);

            ViewResolver.render(res, ViewPath.MAIN.USER.PROFILE, {
                user
            });
        } catch (error) {
            console.error('프로필 페이지 조회 중 오류 발생:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 프로필을 수정합니다.
     */
    async updateUserProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const updateData = req.body;

            // 서비스를 통한 사용자 정보 수정
            const updatedUser = await this.userService.updateUser(userId, updateData);

            // 세션 업데이트 (비밀번호 제외)
            req.session.user = {
                ...req.session.user,
                name: updatedUser.name,
                department: updatedUser.department,
                studentYear: updatedUser.studentYear,
                isClubMember: updatedUser.isClubMember,
                affiliation: updatedUser.affiliation
            };

            res.json({
                success: true,
                message: '프로필이 성공적으로 수정되었습니다.'
            });
        } catch (error) {
            console.error('프로필 수정 중 오류 발생:', error);
            res.status(500).json({
                success: false,
                message: error.message || '프로필 수정 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 비밀번호 재설정 페이지를 렌더링합니다.
     */
    getUserPasswordResetPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD);
    }

    /**
     * 비밀번호 찾기를 처리합니다.
     */
    async handleUserPasswordReset(req, res) {
        try {
            const { email } = req.body;
            await this.userService.resetPassword(email);

            // TODO: 비밀번호 재설정 이메일 발송 로직 구현
            const message = '비밀번호 재설정 링크가 이메일로 발송되었습니다.';

            ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD, {
                title: '비밀번호 찾기',
                success: message
            });
        } catch (error) {
            ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD, {
                title: '비밀번호 찾기',
                error: error.message
            });
        }
    }

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
     * 사용자 계정을 삭제합니다.
     */
    async deleteUserAccount(req, res) {
        try {
            const userId = req.session.user.id;
            await this.userService.deleteUser(userId);

            // 세션 삭제
            await SessionUtil.destroySession(req);

            res.json({
                success: true,
                message: '계정이 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            console.error('계정 삭제 중 오류 발생:', error);
            res.status(500).json({
                success: false,
                message: error.message || '계정 삭제 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 현재 로그인한 사용자의 프로필 정보를 반환합니다.
     * @param {Request} req Express Request 객체
     * @param {Response} res Express Response 객체
     */
    async getUserProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const user = await this.userService.getUserDetail(userId);

            // 민감한 정보 제외하고 필요한 정보만 반환
            const userInfo = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                department: user.department,
                studentYear: user.studentYear,
                affiliation: user.affiliation,
                isClubMember: user.isClubMember
            };

            return res.json(userInfo);
        } catch (error) {
            return res.status(500).json(ApiResponse.error(Message.USER.PROFILE_ERROR));
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const profile = await this.userService.getUserProfile(userId);
            return res.json(ApiResponse.success(profile));
        } catch (error) {
            return res.status(500).json(ApiResponse.error(Message.USER.PROFILE_ERROR));
        }
    }
}
