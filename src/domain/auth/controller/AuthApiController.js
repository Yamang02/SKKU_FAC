import AuthService from '../service/AuthService.js';
import UserService from '../../user/service/UserService.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';
import { ApiResponse } from '../../common/model/ApiResponse.js';

export default class AuthApiController {
    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
    }

    /**
     * 이메일 인증을 처리합니다.
     */
    async processEmailVerification(req, res) {
        const { token } = req.query;
        try {
            if (!token) {
                throw new Error('잘못된 요청입니다.');
            }

            // 토큰 검증
            const tokenData = await this.authService.verifyToken(token, 'EMAIL_VERIFICATION');

            // 사용자 계정 활성화
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
            console.error('이메일 인증 오류:', error);

            // 만료된 토큰 처리
            if (error.cause?.isExpired) {
                try {
                    // 새 토큰 발급 및 이메일 재전송
                    await this.authService.handleExpiredToken(token, 'EMAIL_VERIFICATION');

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

            req.session.flash = {
                type: 'error',
                message: error.message || '이메일 인증에 실패했습니다.'
            };

            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 비밀번호 재설정 이메일을 발송합니다.
     */
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const user = await this.userService.getUserByEmail(email);

            if (!user) {
                throw new Error('해당 이메일로 등록된 사용자가 없습니다.');
            }

            // 비밀번호 재설정 토큰 생성 및 이메일 발송
            await this.authService.createPasswordResetToken(user.id, user.email);

            return res.json(ApiResponse.success(null, '비밀번호 재설정 링크가 이메일로 전송되었습니다.'));
        } catch (error) {
            console.error('비밀번호 재설정 이메일 발송 오류:', error);
            return res.status(400).json(ApiResponse.error(error.message));
        }
    }

    /**
     * 비밀번호를 재설정합니다.
     */
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // 토큰 검증
            const tokenData = await this.authService.verifyToken(token, 'PASSWORD_RESET');

            // 비밀번호 변경
            const result = await this.userService.updatePassword(tokenData.userId, newPassword);

            if (!result) {
                throw new Error('비밀번호 재설정에 실패했습니다.');
            } else {
                // 토큰 삭제
                await this.authService.deleteToken(token, 'PASSWORD_RESET');
                return res.json(ApiResponse.success(null, '비밀번호가 성공적으로 재설정되었습니다.'));
            }

        } catch (error) {
            console.error('비밀번호 재설정 오류:', error);

            // 만료된 토큰 처리
            if (error.cause?.isExpired && req.body?.token) {
                try {
                    // 새 토큰 발급 및 이메일 재전송
                    await this.authService.handleExpiredToken(req.body.token, 'PASSWORD_RESET');

                    return res.status(400).json(ApiResponse.error(
                        '비밀번호 재설정 링크가 만료되었습니다. 새로운 링크가 이메일로 전송되었으니 확인해주세요.',
                        { tokenExpired: true }
                    ));
                } catch (tokenError) {
                    console.error('토큰 재발행 오류:', tokenError);
                    return res.status(400).json(ApiResponse.error(
                        '비밀번호 재설정 링크 갱신에 실패했습니다. 다시 시도하거나 관리자에게 문의하세요.'
                    ));
                }
            }

            return res.status(400).json(ApiResponse.error(error.message));
        }
    }

    /**
    * 토큰 유효성을 검사합니다.
    */
    async validateToken(req, res) {
        try {
            const { token, type } = req.query;

            if (!token || !type) {
                return res.status(400).json(ApiResponse.error('필수 파라미터가 누락되었습니다.'));
            }

            if (type !== 'EMAIL_VERIFICATION' && type !== 'PASSWORD_RESET') {
                return res.status(400).json(ApiResponse.error('유효하지 않은 토큰 유형입니다.'));
            }

            // 토큰 검증
            await this.authService.verifyToken(token, type);

            return res.json(ApiResponse.success({ isValid: true }, '유효한 토큰입니다.'));
        } catch (error) {
            console.error('토큰 유효성 검사 오류:', error);

            // 만료된 토큰 처리
            if (error.cause?.isExpired && req.query?.token) {
                try {
                    // 토큰 정보 반환
                    return res.status(400).json(ApiResponse.error(
                        '토큰이 만료되었습니다.',
                        { tokenExpired: true, userId: error.cause.userId }
                    ));
                } catch (tokenError) {
                    console.error('토큰 검증 오류:', tokenError);
                }
            }

            return res.status(400).json(ApiResponse.error(error.message, { isValid: false }));
        }
    }

    /**
     * 토큰을 재발급합니다.
     */
    async resendToken(req, res) {
        try {
            const { email, type } = req.body;

            if (!email || !type) {
                throw new Error('필수 정보가 누락되었습니다.');
            }

            if (type !== 'EMAIL_VERIFICATION' && type !== 'PASSWORD_RESET') {
                throw new Error('유효하지 않은 토큰 유형입니다.');
            }

            const user = await this.userService.getUserByEmail(email);
            if (!user) {
                throw new Error('해당 이메일로 등록된 사용자가 없습니다.');
            }

            if (type === 'EMAIL_VERIFICATION') {
                await this.authService.createEmailVerificationToken(user.id, user.email);
            } else {
                await this.authService.createPasswordResetToken(user.id, user.email);
            }

            return res.json(ApiResponse.success(null, '새로운 링크가 이메일로 전송되었습니다.'));
        } catch (error) {
            console.error('토큰 재발급 오류:', error);
            return res.status(400).json(ApiResponse.error(error.message));
        }
    }

    /**
     * JWT 로그인 - 토큰 발급
     */
    async loginWithJWT(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json(ApiResponse.error('이메일과 비밀번호를 입력해주세요.'));
            }

            // 사용자 인증
            const user = await this.userService.authenticateUser(email, password);

            // JWT 토큰 생성
            const tokens = await this.authService.authenticateAndGenerateTokens(user);

            return res.json(ApiResponse.success({
                user: tokens.user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }, '로그인에 성공했습니다.'));

        } catch (error) {
            console.error('JWT 로그인 오류:', error);
            return res.status(401).json(ApiResponse.error(error.message || '로그인에 실패했습니다.'));
        }
    }

    /**
     * JWT 토큰 갱신
     */
    async refreshJWTToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json(ApiResponse.error('리프레시 토큰이 필요합니다.'));
            }

            // 토큰 갱신
            const tokens = await this.authService.refreshTokens(refreshToken);

            return res.json(ApiResponse.success({
                user: tokens.user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }, '토큰이 갱신되었습니다.'));

        } catch (error) {
            console.error('JWT 토큰 갱신 오류:', error);
            return res.status(401).json(ApiResponse.error(error.message || '토큰 갱신에 실패했습니다.'));
        }
    }

    /**
     * JWT 토큰 검증
     */
    async verifyJWTToken(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : null;

            if (!token) {
                return res.status(400).json(ApiResponse.error('토큰이 필요합니다.'));
            }

            // 토큰 검증
            const decoded = this.authService.verifyAccessToken(token);

            return res.json(ApiResponse.success({
                valid: true,
                user: {
                    id: decoded.id,
                    username: decoded.username,
                    email: decoded.email,
                    role: decoded.role,
                    isActive: decoded.isActive
                }
            }, '유효한 토큰입니다.'));

        } catch (error) {
            console.error('JWT 토큰 검증 오류:', error);
            return res.status(401).json(ApiResponse.error(error.message || '유효하지 않은 토큰입니다.', { valid: false }));
        }
    }

    /**
     * JWT 로그아웃 (클라이언트 측에서 토큰 삭제)
     */
    async logoutJWT(req, res) {
        try {
            // JWT는 stateless이므로 서버에서 특별한 처리가 필요 없음
            // 클라이언트에서 토큰을 삭제하도록 안내
            return res.json(ApiResponse.success(null, '로그아웃되었습니다. 클라이언트에서 토큰을 삭제해주세요.'));
        } catch (error) {
            console.error('JWT 로그아웃 오류:', error);
            return res.status(500).json(ApiResponse.error('로그아웃 처리 중 오류가 발생했습니다.'));
        }
    }
}
