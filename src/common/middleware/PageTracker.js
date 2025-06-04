/**
 * 페이지 방문 기록을 추적하는 미들웨어
 */
export const pageTracker = (req, res, next) => {
    // 세션이 존재하고, 에러 페이지나 정적 파일이 아닌 경우에만 추적
    if (
        req.session &&
        !req.path.includes('/error') &&
        !req.path.startsWith('/static') &&
        !req.path.startsWith('/css') &&
        !req.path.startsWith('/js') &&
        !req.path.startsWith('/images') &&
        !req.path.startsWith('/uploads') &&
        !req.path.startsWith('/assets')
    ) {
        req.session.previousPage = req.originalUrl;
    }
    next();
};
