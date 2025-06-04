import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';
import { UserNotFoundError, UserValidationError } from '../../../common/error/UserError.js';
import logger from '../../../common/utils/Logger.js';

export default class UserController {
    /**
     * 의존성 정의 (컨테이너에서 자동 주입)
     */
    static dependencies = ['UserService', 'AuthService'];

    /**
     * 생성자 - 의존성 주입
     * @param {UserService} userService - 사용자 서비스
     * @param {AuthService} authService - 인증 서비스
     */
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }

    // === 사용자 페이지 렌더링 ===
    /**
     * 로그인 페이지를 렌더링합니다.
     */
    getUserLoginPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN);
        } catch (error) {
            logger.error('로그인 페이지 렌더링 오류:', error);
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
            logger.error('회원가입 페이지 렌더링 오류:', error);
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
            logger.error('프로필 페이지 렌더링 오류:', error);
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
            logger.error('비밀번호 찾기 페이지 렌더링 오류:', error);
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
            logger.error('비밀번호 재설정 페이지 렌더링 오류:', error);
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
                throw new UserValidationError('잘못된 요청입니다.');
            }

            const tokenData = await this.authService.verifyToken(token, 'EMAIL_VERIFICATION');
            if (!tokenData) {
                throw new UserValidationError('잘못된 요청입니다.');
            }

            await this.userService.activateUser(tokenData.userId);

            // 토큰 삭제
            await this.authService.deleteToken(token, 'EMAIL_VERIFICATION');

            req.session.flash = {
                type: 'success',
                message: '이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.'
            };

            return ViewResolver.render(res, ViewPath.SUCCESS, {
                message: '이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.'
            });
        } catch (error) {
            logger.error('이메일 인증 오류:', error);

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
                    logger.error('토큰 재발행 오류:', tokenError);
                    req.session.flash = {
                        type: 'error',
                        message: '인증 토큰 재발행에 실패했습니다. 관리자에게 문의하세요.'
                    };
                }
            }

            // 커스텀 에러에 따른 구체적인 메시지 설정
            let errorMessage = '이메일 인증에 실패했습니다.';
            if (error instanceof UserValidationError) {
                errorMessage = error.message;
            } else if (error instanceof UserNotFoundError) {
                errorMessage = '사용자를 찾을 수 없습니다.';
            }

            // 실패 메시지와 함께 에러 페이지 렌더링
            req.session.flash = {
                type: 'error',
                message: errorMessage
            };

            return ViewResolver.renderError(res, error);
        }
    }
}
