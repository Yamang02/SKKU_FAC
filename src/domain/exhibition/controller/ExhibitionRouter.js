import express from 'express';
import ExhibitionController from './ExhibitionController.js';
import ExhibitionApiController from './api/ExhibitionApiController.js';
import CacheMiddleware from '../../../common/middleware/CacheMiddleware.js';
import { DomainSanitization } from '../../../common/middleware/sanitization.js';

const ExhibitionRouter = express.Router();
const exhibitionController = new ExhibitionController();
const exhibitionApiController = new ExhibitionApiController();
const cacheMiddleware = new CacheMiddleware();

// API 라우트

/**
     * @swagger
     * /exhibition/api/list:
     *   get:
     *     summary: 전시회 목록 조회
     *     parameters:
     *       - in: query
     *         name: page
     *         required: false
     *         description: 페이지 번호
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         required: false
     *         description: 페이지당 전시회 수
     *         schema:
     *           type: integer
     *       - in: query
     *         name: type
     *         required: false
     *         description: 전시회 유형
     *         schema:
     *           type: string
     *       - in: query
     *         name: year
     *         required: false
     *         description: 전시회 연도
     *         schema:
     *           type: string
     *       - in: query
     *         name: category
     *         required: false
     *         description: 전시회 카테고리
     *         schema:
     *           type: string
     *       - in: query
     *         name: submission
     *         required: false
     *         description: 출품 상태
     *         schema:
     *           type: string
     *       - in: query
     *         name: sort
     *         required: false
     *         description: 정렬 기준
     *         schema:
     *           type: string
     *       - in: query
     *         name: search
     *         required: false
     *         description: 검색어
     *         schema:
     *           type: string
     *       - in: query
     *         name: searchType
     *         required: false
     *         description: 검색 유형
     *         schema:
     *           type: string
     *       - in: query
     *         name: status
     *         required: false
     *         description: 전시회 상태 (planning, submission_open, review, active, completed)
     *         schema:
     *           type: string
     *     responses:
     *       200:
    *         description: 전시회 목록 조회 성공
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
        *                     exhibitions:
        *                       type: array
        *                       items:
        *                         type: object
        *                         properties:
        *                           ExhibitionListDto
        *                     page:
        *                       type: object
        *                       properties:
        *                         currentPage:
        *                           type: integer
        *                           description: 현재 페이지 번호
        *                         totalPages:
        *                           type: integer
        *                           description: 총 페이지 수
        *                         totalItems:
        *                           type: integer
        *                           description: 총 전시회 수
        *                         limit:
        *                           type: integer
        *                           description: 페이지당 전시회 수
        *                     total:
        *                       type: integer
        *                       description: 전시회 총 개수
        *       500:
        *         description: 서버 오류
        */
ExhibitionRouter.get('/api/list', DomainSanitization.exhibition.search, cacheMiddleware.list({ ttl: 600, keyPrefix: 'exhibition_list' }), (req, res) => exhibitionApiController.getExhibitionList(req, res));

/**
 * @swagger
 * /exhibition/api/status/{status}:
 *   get:
 *     summary: 상태별 전시회 목록 조회
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         description: 전시회 상태 (planning, submission_open, review, active, completed)
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: 페이지 번호
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         description: 페이지당 전시회 수
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 상태별 전시회 목록 조회 성공
 *       400:
 *         description: 잘못된 상태 값
 *       500:
 *         description: 서버 오류
 */
ExhibitionRouter.get('/api/status/:status', cacheMiddleware.dynamic({ ttl: 300, keyPrefix: 'exhibition_status' }), (req, res) => exhibitionController.getExhibitionsByStatus(req, res));

/**
 * @swagger
 * /exhibition/api/submittable:
 *   get:
 *     summary: 출품 가능한 전시회 목록 조회
 *     responses:
 *       200:
 *         description: 출품 가능한 전시회 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       // 전시회 객체의 속성들 (ExhibitionSimpleDto의 속성들)
 *       500:
 *         description: 서버 오류
 */
ExhibitionRouter.get('/api/submittable', cacheMiddleware.static({ ttl: 900, keyPrefix: 'exhibition_submittable' }), (req, res) => exhibitionApiController.findSubmittableExhibitions(req, res));

/**
 * @swagger
 * /exhibition/api/featured:
 *   get:
 *     summary: 주요 전시회 목록 조회
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         description: 최대 표시할 전시회 수
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 주요 전시회 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       // 전시회 객체의 속성들 (ExhibitionSimpleDto의 속성들)
 *       500:
 *         description: 서버 오류
 */
ExhibitionRouter.get('/api/featured', cacheMiddleware.static({ ttl: 1800, keyPrefix: 'exhibition_featured' }), (req, res) => exhibitionApiController.getFeaturedExhibitions(req, res));

// 관리자용 전시회 관리 API 라우트
/**
 * @swagger
 * /exhibition/api/admin/list:
 *   get:
 *     summary: 관리자용 전시회 목록 조회
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         description: 전시회 상태 필터
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 전시회 목록 조회 성공
 */
ExhibitionRouter.get('/api/admin/list', cacheMiddleware.dynamic({ ttl: 180, keyPrefix: 'exhibition_admin_list' }), (req, res) => exhibitionController.getExhibitions(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}:
 *   get:
 *     summary: 전시회 상세 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 전시회 조회 성공
 *       404:
 *         description: 전시회를 찾을 수 없음
 */
ExhibitionRouter.get('/api/admin/:id', cacheMiddleware.create({ ttl: 900, keyPrefix: 'exhibition_detail' }), (req, res) => exhibitionController.getExhibition(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/status:
 *   get:
 *     summary: 전시회 상태 정보 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 전시회 상태 정보 조회 성공
 *       404:
 *         description: 전시회를 찾을 수 없음
 */
ExhibitionRouter.get('/api/admin/:id/status', cacheMiddleware.create({ ttl: 600, keyPrefix: 'exhibition_status' }), (req, res) => exhibitionController.getExhibitionWithStatus(req, res));

/**
 * @swagger
 * /exhibition/api/admin:
 *   post:
 *     summary: 새 전시회 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 전시회 생성 성공
 *       400:
 *         description: 잘못된 요청
 */
ExhibitionRouter.post('/api/admin', async (req, res) => {
    const result = await exhibitionController.createExhibition(req, res);
    // 전시회 관련 캐시 무효화
    await cacheMiddleware.invalidatePattern('exhibition_*');
    return result;
});

/**
 * @swagger
 * /exhibition/api/admin/{id}:
 *   put:
 *     summary: 전시회 정보 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 전시회 수정 성공
 *       404:
 *         description: 전시회를 찾을 수 없음
 */
ExhibitionRouter.put('/api/admin/:id', async (req, res) => {
    const result = await exhibitionController.updateExhibition(req, res);
    // 전시회 관련 캐시 무효화
    await cacheMiddleware.invalidatePattern('exhibition_*');
    return result;
});

/**
 * @swagger
 * /exhibition/api/admin/{id}:
 *   delete:
 *     summary: 전시회 삭제
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 전시회 삭제 성공
 *       404:
 *         description: 전시회를 찾을 수 없음
 */
ExhibitionRouter.delete('/api/admin/:id', async (req, res) => {
    const result = await exhibitionController.deleteExhibition(req, res);
    // 전시회 관련 캐시 무효화
    await cacheMiddleware.invalidatePattern('exhibition_*');
    return result;
});

// 상태 관리 API 라우트
/**
 * @swagger
 * /exhibition/api/admin/{id}/status:
 *   put:
 *     summary: 전시회 상태 변경
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [planning, submission_open, review, active, completed]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 상태 변경 성공
 *       400:
 *         description: 잘못된 상태 전환
 *       404:
 *         description: 전시회를 찾을 수 없음
 */
ExhibitionRouter.put('/api/admin/:id/status', (req, res) => exhibitionController.changeStatus(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/open-submissions:
 *   post:
 *     summary: 작품 제출 시작
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 작품 제출 시작 성공
 *       400:
 *         description: 잘못된 상태 전환
 */
ExhibitionRouter.post('/api/admin/:id/open-submissions', (req, res) => exhibitionController.openSubmissions(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/start-review:
 *   post:
 *     summary: 작품 심사 시작
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 작품 심사 시작 성공
 *       400:
 *         description: 잘못된 상태 전환
 */
ExhibitionRouter.post('/api/admin/:id/start-review', (req, res) => exhibitionController.startReview(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/activate:
 *   post:
 *     summary: 전시회 활성화 (시작)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 전시회 활성화 성공
 *       400:
 *         description: 잘못된 상태 전환
 */
ExhibitionRouter.post('/api/admin/:id/activate', (req, res) => exhibitionController.activateExhibition(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/complete:
 *   post:
 *     summary: 전시회 완료
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 전시회 완료 성공
 *       400:
 *         description: 잘못된 상태 전환
 */
ExhibitionRouter.post('/api/admin/:id/complete', (req, res) => exhibitionController.completeExhibition(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/reset-planning:
 *   post:
 *     summary: 전시회를 기획 상태로 되돌리기
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 기획 상태로 되돌리기 성공
 *       400:
 *         description: 잘못된 상태 전환
 */
ExhibitionRouter.post('/api/admin/:id/reset-planning', (req, res) => exhibitionController.resetToPlanning(req, res));

// 레거시 호환성 라우트
/**
 * @swagger
 * /exhibition/api/admin/{id}/toggle-featured:
 *   post:
 *     summary: 주요 전시회 상태 토글 (레거시)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 주요 전시회 상태 변경 성공
 */
ExhibitionRouter.post('/api/admin/:id/toggle-featured', (req, res) => exhibitionController.toggleFeatured(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/toggle-submission:
 *   post:
 *     summary: 작품 제출 상태 토글 (레거시)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 작품 제출 상태 변경 성공
 */
ExhibitionRouter.post('/api/admin/:id/toggle-submission', (req, res) => exhibitionController.toggleSubmissionOpen(req, res));

/**
 * @swagger
 * /exhibition/api/admin/{id}/artworks:
 *   get:
 *     summary: 전시회 작품 목록 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 전시회 작품 목록 조회 성공
 */
ExhibitionRouter.get('/api/admin/:id/artworks', (req, res) => exhibitionController.getExhibitionArtworks(req, res));

// 일반 사용자용 전시회 라우트
ExhibitionRouter.get('/', (req, res) => exhibitionController.getExhibitionListPage(req, res));

export default ExhibitionRouter;
