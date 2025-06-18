import express from 'express';
import { createUserAdminApiRouter } from '#src/domain/user/admin/controller/UserAdminApiRouter.js';
import { createArtworkAdminApiRouter } from '#src/domain/artwork/admin/controller/ArtworkAdminApiRouter.js';
import { createExhibitionAdminApiRouter } from '#src/domain/exhibition/admin/controller/ExhibitionAdminApiRouter.js';
import { requireJwtAuthApi, requireJwtAdminApi, extractUserFromToken } from '#src/common/middleware/jwtAuth.js';

/**
 * Admin API 라우터 생성 함수
 * 모든 도메인의 Admin API 라우터를 통합하고 JWT 인증을 적용
 * @param {Object} container - 의존성 주입 컨테이너
 * @returns {express.Router} 통합 Admin API 라우터
 */
export function createAdminApiRouter(container) {
    const router = express.Router();

    // JWT 토큰 추출 미들웨어 적용 (모든 요청에 대해)
    router.use(extractUserFromToken);

    // JWT 인증 및 관리자 권한 검증 미들웨어 적용 (API 전용 - JSON 응답만)
    router.use(requireJwtAuthApi);
    router.use(requireJwtAdminApi);

    // 각 도메인별 Admin API 라우터 생성
    const userAdminApiRouter = createUserAdminApiRouter(container);
    const artworkAdminApiRouter = createArtworkAdminApiRouter(container);
    const exhibitionAdminApiRouter = createExhibitionAdminApiRouter(container);

    // 도메인별 라우터 마운트
    router.use('/', userAdminApiRouter);
    router.use('/', artworkAdminApiRouter);
    router.use('/', exhibitionAdminApiRouter);

    return router;
}
