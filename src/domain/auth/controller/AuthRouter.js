import express from 'express';
import AuthApiController from './AuthApiController.js';
import AuthPageController from './AuthPageController.js';
import { isNotAuthenticated } from '../../../common/middleware/auth.js';

const AuthRouter = express.Router();
const authApiController = new AuthApiController();
const authPageController = new AuthPageController();

// ======================================
// Passport 기반 페이지 라우트
// ======================================

/**
 * 로그인 페이지
 */
AuthRouter.get('/login', isNotAuthenticated, authPageController.renderLoginPage.bind(authPageController));

/**
 * 로컬 로그인 처리 (Passport)
 */
AuthRouter.post('/login', isNotAuthenticated, authPageController.handleLocalLogin.bind(authPageController));

/**
 * Google 로그인 시작
 */
AuthRouter.get('/google', isNotAuthenticated, authPageController.initiateGoogleLogin.bind(authPageController));

/**
 * Google 로그인 콜백
 */
AuthRouter.get('/google/callback', authPageController.handleGoogleCallback.bind(authPageController));

/**
 * 로그아웃
 */
AuthRouter.post('/logout', authPageController.handleLogout.bind(authPageController));
AuthRouter.get('/logout', authPageController.handleLogout.bind(authPageController));

// ======================================
// API 라우트 (기존)
// ======================================

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

// JWT 관련 API 엔드포인트
/**
 * @swagger
 * /jwt/login:
 *   post:
 *     summary: JWT 로그인
 *     tags: [JWT Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: 로그인 실패
 */
AuthRouter.post('/jwt/login', authApiController.loginWithJWT.bind(authApiController));

/**
 * @swagger
 * /jwt/refresh:
 *   post:
 *     summary: JWT 토큰 갱신
 *     tags: [JWT Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 리프레시 토큰
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *       401:
 *         description: 토큰 갱신 실패
 */
AuthRouter.post('/jwt/refresh', authApiController.refreshJWTToken.bind(authApiController));

/**
 * @swagger
 * /jwt/verify:
 *   get:
 *     summary: JWT 토큰 검증
 *     tags: [JWT Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 유효한 토큰
 *       401:
 *         description: 유효하지 않은 토큰
 */
AuthRouter.get('/jwt/verify', authApiController.verifyJWTToken.bind(authApiController));

/**
 * @swagger
 * /jwt/logout:
 *   post:
 *     summary: JWT 로그아웃
 *     tags: [JWT Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
AuthRouter.post('/jwt/logout', authApiController.logoutJWT.bind(authApiController));

export default AuthRouter;
