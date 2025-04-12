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
