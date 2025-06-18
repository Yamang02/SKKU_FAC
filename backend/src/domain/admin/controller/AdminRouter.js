import express from 'express';

/**
 * 관리자 페이지 리다이렉션 라우터 팩토리 함수
 * 모든 Admin 페이지 요청을 프론트엔드로 리다이렉션합니다.
 * API 요청은 /api/admin에서 JWT 기반으로 처리됩니다.
 * @param {Container} _container - 의존성 주입 컨테이너 (사용하지 않음)
 * @returns {express.Router} 생성된 라우터
 */
export function createAdminRouter(_container) {
    const AdminRouter = express.Router();

    // ==================== 프론트엔드 완전 분리 - 리다이렉션만 담당 ==================== //
    // 모든 Admin 페이지 요청을 프론트엔드로 리다이렉션
    // API 요청은 /api/admin에서 JWT 기반으로 처리됩니다.

    // Admin 메인 페이지들 → 프론트엔드 리다이렉션
    AdminRouter.get(['/', '/dashboard'], (req, res) => {
        res.redirect('http://localhost:3003/admin');
    });

    AdminRouter.get(['/users', '/users/:id'], (req, res) => {
        const userId = req.params.id ? `/${req.params.id}` : '';
        res.redirect(`http://localhost:3003/admin/users${userId}`);
    });

    AdminRouter.get(['/exhibitions', '/exhibitions/:id'], (req, res) => {
        const exhibitionId = req.params.id ? `/${req.params.id}` : '';
        res.redirect(`http://localhost:3003/admin/exhibitions${exhibitionId}`);
    });

    AdminRouter.get(['/artworks', '/artworks/:id'], (req, res) => {
        const artworkId = req.params.id ? `/${req.params.id}` : '';
        res.redirect(`http://localhost:3003/admin/artworks${artworkId}`);
    });

    // 기존 management 경로 리다이렉션 (하위 호환성)
    AdminRouter.get('/management/user', (req, res) => res.redirect(301, 'http://localhost:3003/admin/users'));
    AdminRouter.get('/management/user/:id', (req, res) => res.redirect(301, `http://localhost:3003/admin/users/${req.params.id}`));
    AdminRouter.get('/management/exhibition', (req, res) => res.redirect(301, 'http://localhost:3003/admin/exhibitions'));
    AdminRouter.get('/management/exhibition/:id', (req, res) => res.redirect(301, `http://localhost:3003/admin/exhibitions/${req.params.id}`));
    AdminRouter.get('/management/artwork', (req, res) => res.redirect(301, 'http://localhost:3003/admin/artworks'));
    AdminRouter.get('/management/artwork/:id', (req, res) => res.redirect(301, `http://localhost:3003/admin/artworks/${req.params.id}`));

    // 기타 모든 /admin/* 요청을 프론트엔드로 리다이렉션
    AdminRouter.get('/*', (req, res) => {
        res.redirect(`http://localhost:3003/admin${req.path}`);
    });

    return AdminRouter;
}
