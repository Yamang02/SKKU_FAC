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
    async verifyEmail(req, res) {
        const token = req.query;
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

            if (error.message === '이메일 인증 토큰이 만료되었습니다.') {
                // 사용자 찾기
                const userId = await this.userService.getUserIdByVerificationToken(token);

                if (userId) {
                    const user = await this.userService.getUserById(userId);

                    if (user) {
                        // 새 토큰 발급 및 이메일 재전송
                        await this.authService.createEmailVerificationToken(user.id, user.email);

                        req.session.flash = {
                            type: 'warning',
                            message: '인증 토큰이 만료되어 새로운 인증 이메일을 발송했습니다. 이메일을 확인해주세요.'
                        };
                    }
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
            return res.status(400).json(ApiResponse.error(error.message));
        }
    }
}
