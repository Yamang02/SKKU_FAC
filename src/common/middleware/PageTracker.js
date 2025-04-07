/**
 * 페이지 방문 기록을 추적하는 미들웨어
 */
export const pageTracker = (req, res, next) => {
    // 에러 페이지나 정적 파일은 추적하지 않음
    if (!req.path.includes('/error') && !req.path.startsWith('/static') && !req.path.startsWith('/css') && !req.path.startsWith('/js')) {
        req.session.previousPage = req.originalUrl;
    }
    next();
};
