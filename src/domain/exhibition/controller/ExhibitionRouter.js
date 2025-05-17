import express from 'express';
import ExhibitionController from './ExhibitionController.js';
import ExhibitionApiController from './api/ExhibitionApiController.js';
const ExhibitionRouter = express.Router();
const exhibitionController = new ExhibitionController();
const exhibitionApiController = new ExhibitionApiController();

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
ExhibitionRouter.get('/api/list', (req, res) => exhibitionApiController.getExhibitionList(req, res));

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
ExhibitionRouter.get('/api/submittable', (req, res) => exhibitionApiController.findSubmittableExhibitions(req, res));

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
ExhibitionRouter.get('/api/featured', (req, res) => exhibitionApiController.getFeaturedExhibitions(req, res));

// 일반 사용자용 전시회 라우트
ExhibitionRouter.get('/', (req, res) => exhibitionController.getExhibitionListPage(req, res));


export default ExhibitionRouter;
