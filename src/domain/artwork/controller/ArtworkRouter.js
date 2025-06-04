import express from 'express';
import ArtworkApiController from './api/ArtworkApiController.js';
import { imageUploadMiddleware } from '../../../common/middleware/imageUploadMiddleware.js';
import { isAuthenticated } from '../../../common/middleware/auth.js';
import { DomainSanitization } from '../../../common/middleware/sanitization.js';

/**
 * 작품 라우터 팩토리 함수
 * 의존성 주입 컨테이너를 받아서 라우터를 생성합니다.
 * @param {Container} container - 의존성 주입 컨테이너
 * @returns {express.Router} 생성된 라우터
 */
export function createArtworkRouter(container) {
    const ArtworkRouter = express.Router();

    // 의존성 주입된 컨트롤러들을 해결
    const artworkController = container.resolve('ArtworkController');
    const artworkApiController = new ArtworkApiController(); // 아직 의존성 주입 미적용

    // === API 엔드포인트 ===

    // 작품등록 , 수정, 삭제
    /**
     * @swagger
     * /artwork/api/new:
     *   post:
     *     summary: 작품 등록
     *     tags: [Artwork]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: 작품 제목
     *               image:
     *                 type: string
     *                 format: binary
     *                 description: 작품 이미지 파일
     *               department:
     *                 type: string
     *                 description: 작가의 소속
     *               exhibitionId:
     *                 type: string
     *                 description: 전시회 ID
     *               year:
     *                 type: integer
     *                 description: 제작 연도
     *               medium:
     *                 type: string
     *                 description: 작품 매체
     *               size:
     *                 type: string
     *                 description: 작품 크기
     *               description:
     *                 type: string
     *                 description: 작품 설명
     *     responses:
     *       201:
     *         description: 작품 등록 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   description: ArtworkSimpleDto
     *       400:
     *         description: 잘못된 요청 (유효성 검사 실패, 이미지파일 업로드 실패)
     *       401:
     *         description: 인증 실패 (로그인 필요)
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.post('/api/new', isAuthenticated, DomainSanitization.artwork.create, imageUploadMiddleware('artwork'), artworkApiController.createArtwork.bind(artworkApiController));

    /**
     * @swagger
     * /artwork/api/{id}:
     *   put:
     *     summary: 작품 수정
     *     tags: [Artwork]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: 수정할 작품의 ID
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               year:
     *                 type: integer
     *                 description: 작품 제작 연도
     *               medium:
     *                 type: string
     *                 description: 작품 매체
     *               size:
     *                 type: string
     *                 description: 작품 크기
     *               description:
     *                 type: string
     *                 description: 작품 설명
     *     responses:
     *       200:
     *         description: 작품 수정 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   description: ArtworkDetailDto
     *       400:
     *         description: 잘못된 요청 (유효성 검사 실패)
     *       404:
     *         description: 작품을 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.put('/api/:id', isAuthenticated, DomainSanitization.artwork.update, artworkApiController.updateArtwork.bind(artworkApiController));

    /**
     * @swagger
     * /artwork/api/{id}:
     *   delete:
     *     summary: 작품 삭제
     *     tags: [Artwork]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: 삭제할 작품의 ID
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 작품 삭제 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       404:
     *         description: 작품을 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.delete('/api/:id', artworkApiController.deleteArtwork.bind(artworkApiController));

    // 작품 목록 조회 API
    /**
     * @swagger
     * /artwork/api/list:
     *   get:
     *     summary: 작품 목록 조회
     *     tags: [Artwork]
     *     parameters:
     *       - in: query
     *         name: page
     *         required: false
     *         description: 페이지 번호 (기본값: 1)
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         required: false
     *         description: 페이지당 작품 수 (기본값: 12)
     *         schema:
     *           type: integer
     *           default: 12
     *       - in: query
     *         name: sortField
     *         required: false
     *         description: 정렬 기준 필드 (기본값: createdAt)
     *         schema:
     *           type: string
     *           default: createdAt
     *       - in: query
     *         name: sortOrder
     *         required: false
     *         description: 정렬 순서 (asc 또는 desc, 기본값: desc)
     *         schema:
     *           type: string
     *           default: desc
     *       - in: query
     *         name: keyword
     *         required: false
     *         description: 작품 제목 또는 설명에 대한 검색 키워드
     *         schema:
     *           type: string
     *       - in: query
     *         name: exhibition
     *         required: false
     *         description: 전시회 ID로 필터링
     *         schema:
     *           type: string
     *       - in: query
     *         name: year
     *         required: false
     *         description: 작품 제작 연도로 필터링
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 작품 목록 조회 성공
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
     *                     items:
     *                       type: array
     *                       items:
     *                         type: object
     *                         description: ArtworkDetailDto
     *                     total:
     *                       type: integer
     *                       description: 총 작품 수
     *                     pageInfo:
     *                       type: object
     *                       properties:
     *                         currentPage:
     *                           type: integer
     *                           description: 현재 페이지 번호
     *                         totalPages:
     *                           type: integer
     *                           description: 총 페이지 수
     *                         hasPrev:
     *                           type: boolean
     *                           description: 이전 페이지 존재 여부
     *                         hasNext:
     *                           type: boolean
     *                           description: 다음 페이지 존재 여부
     *       400:
     *         description: 잘못된 요청 (유효성 검사 실패)
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.get('/api/list', DomainSanitization.artwork.search, artworkApiController.getArtworkList.bind(artworkApiController));

    /**
     * @swagger
     * /artwork/api/featured:
     *   get:
     *     summary: 추천 작품 목록 조회
     *     tags: [Artwork]
     *     responses:
     *       200:
     *         description: 추천 작품 목록 조회 성공
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
     *                     description: ArtworkSimpleDto[]
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.get('/api/featured', artworkApiController.getFeaturedArtworks.bind(artworkApiController));

    /**
     * @swagger
     * /artwork/api/detail/{slug}:
     *   get:
     *     summary: 작품 상세 정보 조회
     *     tags: [Artwork]
     *     parameters:
     *       - in: path
     *         name: slug
     *         required: true
     *         description: 조회할 작품의 슬러그
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 작품 상세 정보 조회 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   description: ArtworkDetailDto , 필드에 RelatedArtworkDto[] 포함
     *       404:
     *         description: 작품을 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.get('/api/detail/:slug', artworkApiController.getArtworkDetail.bind(artworkApiController));

    // 전시회 출품 및 취소하기
    /**
     * @swagger
     * /artwork/api/exhibiting:
     *   post:
     *     summary: 작품을 전시회에 출품
     *     tags: [Artwork]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               artworkId:
     *                 type: string
     *                 description: 출품할 작품의 ID
     *               exhibitionId:
     *                 type: string
     *                 description: 출품할 전시회의 ID
     *     responses:
     *       200:
     *         description: 출품 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       400:
     *         description: 잘못된 요청 (유효성 검사 실패)
     *       404:
     *         description: 작품 또는 전시회를 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.post('/api/exhibiting', DomainSanitization.artwork.create, artworkApiController.submitArtwork.bind(artworkApiController));

    /**
     * @swagger
     * /artwork/api/exhibiting/{artworkId}/{exhibitionId}:
     *   delete:
     *     summary: 작품의 전시회 출품 취소
     *     tags: [Artwork]
     *     parameters:
     *       - in: path
     *         name: artworkId
     *         required: true
     *         description: 취소할 작품의 ID
     *         schema:
     *           type: string
     *       - in: path
     *         name: exhibitionId
     *         required: true
     *         description: 취소할 전시회의 ID
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 출품 취소 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       404:
     *         description: 작품 또는 전시회를 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
    ArtworkRouter.delete('/api/exhibiting/:artworkId/:exhibitionId', artworkApiController.cancelArtworkSubmission.bind(artworkApiController));

    // === 페이지 라우트 ===
    // 작품 목록 페이지 (기본 경로)
    ArtworkRouter.get(['/', '/list'], artworkController.getArtworkListPage.bind(artworkController));

    // 작품 생성 페이지
    ArtworkRouter.get('/new', isAuthenticated, artworkController.getArtworkRegistrationPage.bind(artworkController));

    // 작품 상세 페이지
    ArtworkRouter.get('/:slug', artworkController.getArtworkDetailPage.bind(artworkController));

    // 관리자용 작품 관리 페이지는 AdminRouter에서 처리합니다.

    return ArtworkRouter;
}
