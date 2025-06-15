import PassportService from '../service/PassportService.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';

/**
 * Passport 기반 인증 페이지 컨트롤러
 */
export default class AuthPageController {
    constructor() {
        this.passportService = new PassportService();
    }

    /**
     * 로그인 페이지 렌더링
     */
    async renderLoginPage(req, res) {
        try {
            // 이미 로그인된 사용자는 홈으로 리다이렉트
            if (req.user || req.session?.user) {
                return res.redirect('/');
            }

            const flashMessages = req.session.flash || {};
            delete req.session.flash;

            return ViewResolver.render(res, ViewPath.AUTH_LOGIN, {
                title: '로그인',
                error: flashMessages.error,
                success: flashMessages.success,
                returnTo: req.query.returnTo || req.session.returnTo
            });
        } catch (error) {
            console.error('로그인 페이지 렌더링 오류:', error);
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 로컬 로그인 처리 (Passport)
     */
    async handleLocalLogin(req, res, next) {
        return this.passportService.authenticateLocal(req, res, next);
    }

    // Google OAuth 메서드 제거됨

    /**
     * 로그아웃 처리
     */
    async handleLogout(req, res) {
        try {
            // Passport 로그아웃
            req.logout(err => {
                if (err) {
                    console.error('Passport 로그아웃 오류:', err);
                }
            });

            // 세션 데이터 정리
            if (req.session) {
                req.session.destroy(err => {
                    if (err) {
                        console.error('세션 파기 오류:', err);
                    }
                });
            }

            // 쿠키 정리
            res.clearCookie('connect.sid');

            req.session.flash = {
                type: 'success',
                message: '성공적으로 로그아웃되었습니다.'
            };

            return res.redirect('/auth/login');
        } catch (error) {
            console.error('로그아웃 처리 오류:', error);
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 로그인 성공 후 처리
     */
    async handleLoginSuccess(req, res) {
        try {
            const returnTo = req.session.returnTo || '/';
            delete req.session.returnTo;

            req.session.flash = {
                type: 'success',
                message: '성공적으로 로그인되었습니다.'
            };

            return res.redirect(returnTo);
        } catch (error) {
            console.error('로그인 성공 처리 오류:', error);
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 로그인 실패 후 처리
     */
    async handleLoginFailure(req, res) {
        try {
            req.session.flash = {
                type: 'error',
                message: '로그인에 실패했습니다. 다시 시도해 주세요.'
            };

            return res.redirect('/auth/login');
        } catch (error) {
            console.error('로그인 실패 처리 오류:', error);
            return ViewResolver.renderError(res, error);
        }
    }
}
