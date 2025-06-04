import express from 'express';
import { isAuthenticated, isNotAuthenticated } from '../../../common/middleware/auth.js';
// 새로운 DTO 기반 검증 미들웨어
import { UserValidation } from '../../../common/middleware/domainValidation.js';
// 새로운 포괄적인 sanitization 미들웨어
import { DomainSanitization } from '../../../common/middleware/sanitization.js';
import CacheMiddleware from '../../../common/middleware/CacheMiddleware.js';

/**
 * UserRouter 팩토리 함수
 * 의존성 주입된 UserController를 받아서 라우터를 생성합니다.
 * @param {UserController} userController - 의존성 주입된 UserController 인스턴스
 * @param {UserApiController} userApiController - 의존성 주입된 UserApiController 인스턴스
 * @returns {express.Router} 설정된 라우터
 */
export function createUserRouter(userController, userApiController) {
    const UserRouter = express.Router();
    const cacheMiddleware = new CacheMiddleware();

    // === API 엔드포인트 ===

    // 회원가입 API
    /**
     * @swagger
     * /:
     *   post:
     *     summary: 사용자 등록
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               role:
     *                 type: string
     *               department:
     *                 type: string
     *               affiliation:
     *                 type: string
     *               studentYear:
     *                 type: integer
     *               isClubMember:
     *                 type: boolean
     *     responses:
     *       201:
     *         description: 사용자 등록 성공
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
     *                    userResponseDtos // 사용자 정보 속성들
     *       400:
     *         description: 유효성 검사 오류
     *       500:
     *         description: 서버 오류
     */
    UserRouter.post('/', isNotAuthenticated, DomainSanitization.user.register, UserValidation.validateRegister, async (req, res) => {
        const result = await userApiController.registerUser(req, res);
        // 사용자 관련 캐시 무효화 (필요시)
        await cacheMiddleware.invalidatePattern('user_*');
        return result;
    });

    // 로그인/로그아웃 API
    /**
     * @swagger
     * /login:
     *   post:
     *     summary: 사용자 로그인
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
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
     *                     // 사용자 정보 속성들
     *       404:
     *         description: 사용자 없음
     *       500:
     *         description: 서버 오류
    */
    UserRouter.post('/login', isNotAuthenticated, DomainSanitization.user.register, UserValidation.validateLogin, (req, res) => userApiController.loginUser(req, res));
    /**
     * @swagger
     * /logout:
     *   get:
     *     summary: 사용자 로그아웃
     *     responses:
     *       200:
     *         description: 로그아웃 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       500:
     *         description: 서버 오류
     */
    UserRouter.get('/logout', (req, res) => userApiController.logoutUser(req, res));

    // 현재 사용자 프로필 정보 조회 API (개인정보이므로 캐싱 안함)
    /**
     * @swagger
     * /api/me:
     *   get:
     *     summary: 현재 사용자 프로필 조회
     *     responses:
     *       200:
     *         description: 사용자 프로필 조회 성공
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
     *                     userDetailDto // 사용자 정보 속성들
     *       404:
     *         description: 사용자 없음
     *       500:
     *         description: 서버 오류
     */
    UserRouter.get('/api/me', isAuthenticated, (req, res) => userApiController.getUserProfile(req, res));

    // 현재 사용자 세션 정보 조회 API (개인정보이므로 캐싱 안함)
    /**
     * @swagger
     * /api/session:
     *   get:
     *     summary: 현재 사용자 세션 정보 조회
     *     responses:
     *       200:
     *         description: 세션 정보 조회 성공
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
     *                     미들웨어를 통해 담긴 user정보들  // 사용자 세션 정보 속성들
     *       500:
     *         description: 서버 오류
     */
    UserRouter.get('/api/session', isAuthenticated, (req, res) => userApiController.getSessionUser(req, res));

    // 현재 사용자 프로필 수정 API
    /**
     * @swagger
     * /me:
     *   put:
     *     summary: 사용자 프로필 수정
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               department:
     *                 type: string
     *               studentYear:
     *                 type: integer
     *               affiliation:
     *                 type: string
     *               isClubMember:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: 프로필 수정 성공
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
     *                     userDetailDto // 사용자 정보 속성들
     *       400:
     *         description: 유효성 검사 오류
     *       404:
     *         description: 사용자 없음
     *       500:
     *         description: 서버 오류
     */
    UserRouter.put('/me', isAuthenticated, DomainSanitization.user.updateProfile, UserValidation.validateUpdateProfile, async (req, res) => {
        const result = await userApiController.updateProfile(req, res);
        // 사용자 관련 캐시 무효화
        await cacheMiddleware.invalidatePattern('user_*');
        return result;
    });

    // 현재 사용자 삭제 API
    /**
     * @swagger
     * /me:
     *   delete:
     *     summary: 사용자 계정 삭제
     *     responses:
     *       200:
     *         description: 사용자 계정 삭제 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       500:
     *         description: 서버 오류
     */
    UserRouter.delete('/me', isAuthenticated, (req, res) => userApiController.deleteUserAccount(req, res));

    // 아이디 찾기 API
    /**
     * @swagger
     * /api/find-username:
     *   get:
     *     summary: 아이디 찾기
     *     parameters:
     *       - in: query
     *         name: email
     *         required: true
     *         description: 사용자 이메일
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 아이디 찾기 성공
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
     *                     username:
     *                       type: string
     *       400:
     *         description: 이메일 입력 오류
     *       404:
     *         description: 사용자 없음
     *       500:
     *         description: 서버 오류
     */
    UserRouter.get('/api/find-username', DomainSanitization.user.register, UserValidation.validateEmailQuery, (req, res) => userApiController.findUsername(req, res));

    // 비밀번호 재설정 요청 API
    /**
     * @swagger
     * /password/reset:
     *   post:
     *     summary: 비밀번호 재설정 요청
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: 비밀번호 재설정 요청 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data : userSimpleDto
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       404:
     *         description: 사용자 없음
     *       500:
     *         description: 서버 오류
     */
    UserRouter.post('/password/reset', isNotAuthenticated, DomainSanitization.user.register, UserValidation.validateResetPassword, (req, res) => userApiController.resetPassword(req, res));

    // 플래시 메시지 API
    UserRouter.get('/api/flash-message', (req, res) => userApiController.getFlashMessage(req, res));

    // === 페이지 라우트 ===
    // 로그인 페이지
    UserRouter.get('/login', isNotAuthenticated, (req, res) => userController.getUserLoginPage(req, res));

    // 회원가입 페이지
    UserRouter.get('/new', isNotAuthenticated, (req, res) => userController.getUserRegistrationPage(req, res));

    // 프로필 페이지
    UserRouter.get('/me', isAuthenticated, (req, res) => userController.getUserProfilePage(req, res));

    // 비밀번호 재설정 페이지
    UserRouter.get('/password/forgot', isNotAuthenticated, (req, res) => userController.getUserPasswordForgotPage(req, res));
    UserRouter.get('/password/reset', isNotAuthenticated, (req, res) => userController.getUserPasswordResetPage(req, res));

    // 이메일 인증 페이지
    UserRouter.get('/verify-email', (req, res) => userController.verifyEmailPage(req, res));

    return UserRouter;
}
