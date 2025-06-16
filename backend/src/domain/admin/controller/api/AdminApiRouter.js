import express from 'express';
import { createUserAdminApiRouter } from '#src/domain/user/controller/api/UserAdminApiRouter.js';
import { createArtworkAdminApiRouter } from '#src/domain/artwork/controller/api/ArtworkAdminApiRouter.js';
import { createExhibitionAdminApiRouter } from '#src/domain/exhibition/controller/api/ExhibitionAdminApiRouter.js';

/**
 * Admin API 라우터 생성 함수
 * 모든 도메인의 Admin API 라우터를 통합
 * @param {Object} container - 의존성 주입 컨테이너
 * @returns {express.Router} 통합 Admin API 라우터
 */
export function createAdminApiRouter(container) {
    const router = express.Router();

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
