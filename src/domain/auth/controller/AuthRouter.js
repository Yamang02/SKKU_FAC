import express from 'express';
import AuthApiController from './AuthApiController.js';

const AuthRouter = express.Router();
const authApiController = new AuthApiController();

// 이메일 인증 처리 - API가 아닌 페이지 라우트
AuthRouter.post('/verify-email', authApiController.processEmailVerification.bind(authApiController));

/**
 * @swagger
 * /request-password-reset:
 *   post:
 *     summary: 비밀번호 재설정 이메일 요청
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 비밀번호 재설정을 요청하는 이메일
 *     responses:
 *       200:
 *         description: 이메일 발송 성공
 *       400:
 *         description: 잘못된 요청
 */
AuthRouter.post('/request-password-reset', authApiController.requestPasswordReset.bind(authApiController));

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: 비밀번호 재설정
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: 비밀번호 재설정 토큰
 *               newPassword:
 *                 type: string
 *                 description: 새 비밀번호
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 성공
 *       400:
 *         description: 잘못된 요청
 */
AuthRouter.post('/reset-password', authApiController.resetPassword.bind(authApiController));

/**
 * @swagger
 * /resend-token:
 *   post:
 *     summary: 토큰 재발송
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 재발송할 이메일
 *               type:
 *                 type: string
 *                 description: 토큰 유형 (EMAIL_VERIFICATION 또는 PASSWORD_RESET)
 *     responses:
 *       200:
 *         description: 새로운 링크 발송 성공
 *       400:
 *         description: 잘못된 요청
 */
AuthRouter.post('/resend-token', authApiController.resendToken.bind(authApiController));

/**
 * @swagger
 * /validate-token:
 *   get:
 *     summary: 토큰 유효성 검사
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: 검증할 토큰
 *       - in: query
 *         name: type
 *         required: true
 *         description: 토큰 유형 (EMAIL_VERIFICATION 또는 PASSWORD_RESET)
 *     responses:
 *       200:
 *         description: 유효한 토큰
 *       400:
 *         description: 잘못된 요청
 */
AuthRouter.get('/validate-token', authApiController.validateToken.bind(authApiController));

export default AuthRouter;
