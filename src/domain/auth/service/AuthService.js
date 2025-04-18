import TokenRepository from '../../../infrastructure/db/repository/TokenRepository.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../../common/utils/emailSender.js';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';
import UserAccountRepository from '../../../infrastructure/db/repository/UserAccountRepository.js';

export default class AuthService {
    constructor() {
        this.tokenRepository = new TokenRepository();
        this.userRepository = new UserAccountRepository();
    }

    // 이메일 인증 토큰 생성
    async createEmailVerificationToken(userId, email) {
        // 기존 토큰 삭제
        await this.tokenRepository.deleteAllTokensForUser(userId, 'EMAIL_VERIFICATION');

        const token = generateDomainUUID(DOMAINS.TOKEN);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24); // 24시간 유효

        await this.tokenRepository.saveToken({
            id: token,
            userId,
            token,
            type: 'EMAIL_VERIFICATION',
            expiresAt: expiryDate
        });

        // 이메일 발송
        await sendVerificationEmail(email, token);

        return token;
    }

    // 비밀번호 재설정 토큰 생성
    async createPasswordResetToken(userId, email) {
        // 기존 토큰 삭제
        await this.tokenRepository.deleteAllTokensForUser(userId, 'PASSWORD_RESET');

        const token = generateDomainUUID(DOMAINS.TOKEN);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // 1시간 유효

        await this.tokenRepository.saveToken({
            id: token,
            userId,
            token,
            type: 'PASSWORD_RESET',
            expiresAt: expiryDate
        });

        // 이메일 발송
        await sendPasswordResetEmail(email, token);

        return token;
    }

    // 토큰 검증
    async verifyToken(token, type) {
        const tokenData = await this.tokenRepository.findByToken(token, type);

        if (!tokenData) {
            throw new Error('잘못된 요청입니다.');
        }

        // 토큰 만료 확인
        if (tokenData.expiresAt < new Date()) {
            throw new Error('토큰이 만료되었습니다.', { cause: { isExpired: true, userId: tokenData.userId } });
        }

        return tokenData;
    }

    // 토큰 삭제
    async deleteToken(token, type) {
        return await this.tokenRepository.deleteToken(token, type);
    }

    // 만료된 토큰 확인 및 재발행
    async handleExpiredToken(token, type) {
        try {
            // 디코딩된 토큰 확인
            const decodedToken = decodeURIComponent(token);

            // 만료된 토큰 조회
            const tokenData = await this.tokenRepository.findByToken(decodedToken, type);

            if (!tokenData) {
                throw new Error('토큰을 찾을 수 없습니다.');
            }

            // 사용자 정보 가져오기
            const userId = tokenData.userId;
            const user = await this.userRepository.findUserById(userId);

            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            // 토큰 타입에 따라 새 토큰 발행
            let newToken;
            if (type === 'EMAIL_VERIFICATION') {
                newToken = await this.createEmailVerificationToken(userId, user.email);
            } else if (type === 'PASSWORD_RESET') {
                newToken = await this.createPasswordResetToken(userId, user.email);
            } else {
                throw new Error('지원하지 않는 토큰 타입입니다.');
            }

            return {
                success: true,
                message: '새로운 토큰이 발급되어 이메일로 전송되었습니다.',
                tokenData: { userId, token: newToken }
            };
        } catch (error) {
            console.error('토큰 재발행 중 오류:', error);
            throw new Error('토큰 재발행에 실패했습니다.');
        }
    }

    // 토큰 만료 여부 확인
    async isTokenExpired(token, type) {
        const decodedToken = decodeURIComponent(token);
        const tokenData = await this.tokenRepository.findByToken(decodedToken, type);

        if (!tokenData) {
            return { exists: false, expired: true };
        }

        return {
            exists: true,
            expired: tokenData.expiresAt < new Date(),
            userId: tokenData.userId
        };
    }
}
