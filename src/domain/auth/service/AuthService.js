import TokenRepository from '../../../infrastructure/db/repository/TokenRepository.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../../common/utils/emailSender.js';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';
export default class AuthService {
    constructor() {
        this.tokenRepository = new TokenRepository();
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
            throw new Error('이메일 인증 토큰이 만료되었습니다.');
        }

        return tokenData;
    }

    // 토큰 삭제
    async deleteToken(token, type) {
        return await this.tokenRepository.deleteToken(token, type);
    }
}
