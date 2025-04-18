import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';
import UserService from '../service/UserService.js';
import AuthService from '../../auth/service/AuthService.js';


export default class UserController {
    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
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
     * 비밀번호 찾기 페이지를 렌더링합니다.
     */
    getUserPasswordForgotPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD);
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 비밀번호 재설정 페이지를 렌더링합니다.
     */
    getUserPasswordResetPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.USER.RESET_PASSWORD);
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }


    /**
     * 이메일 인증을 처리합니다.
     */
    async verifyEmailPage(req, res) {
        try {
            const { token } = req.query;
            if (!token) {
                throw new Error('잘못된 요청입니다.');
            }

            const decodedToken = decodeURIComponent(token);
            const tokenData = await this.authService.verifyToken(decodedToken, 'EMAIL_VERIFICATION');
            if (!tokenData) {
                throw new Error('잘못된 요청입니다.');
            }

            await this.userService.activateUser(tokenData.userId);

            // 토큰 삭제
            await this.authService.deleteToken(decodedToken, 'EMAIL_VERIFICATION');

            req.session.flash = {
                type: 'success',
                message: '이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.'
            };

            return ViewResolver.render(res, ViewPath.SUCCESS, {
                message: '이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.'
            });
        } catch (error) {
            console.error('이메일 인증 오류:', error);

            // 만료된 토큰 처리
            if (error.cause?.isExpired) {
                try {
                    // 새 토큰 발급 및 이메일 재전송
                    await this.authService.handleExpiredToken(req.query.token, 'EMAIL_VERIFICATION');

                    req.session.flash = {
                        type: 'warning',
                        message: '인증 토큰이 만료되어 새로운 인증 이메일을 발송했습니다. 이메일을 확인해주세요.'
                    };

                    return ViewResolver.renderError(res, {
                        message: '인증 토큰이 만료되어 새로운 인증 이메일을 발송했습니다. 이메일을 확인해주세요.'
                    });
                } catch (tokenError) {
                    console.error('토큰 재발행 오류:', tokenError);
                    req.session.flash = {
                        type: 'error',
                        message: '인증 토큰 재발행에 실패했습니다. 관리자에게 문의하세요.'
                    };
                }
            }

            // 실패 메시지와 함께 에러 페이지 렌더링
            req.session.flash = {
                type: 'error',
                message: error.message || '이메일 인증에 실패했습니다.'
            };

            return ViewResolver.renderError(res, error);
        }
    }

}
