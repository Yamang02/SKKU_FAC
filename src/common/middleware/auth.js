import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import { UserRole } from '../constants/UserRole.js';

/**
 * 사용자 인증 미들웨어
 */

// 로그인 필요 여부 확인
export const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({
                success: false,
                error: '로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.'
            });
        }
        req.session.returnTo = req.originalUrl;
        return ViewResolver.render(res, ViewPath.ERROR, {
            title: '로그인 필요',
            error: '로그인이 필요한 서비스입니다.',
            message: '로그인 후 이용해주세요.',
            returnTo: req.originalUrl,
            redirectUrl: '/auth/login'
        });
    }
    next();
};

// 관리자 권한 확인
export const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== UserRole.ADMIN) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }
        return ViewResolver.render(res, ViewPath.ERROR, {
            title: '접근 제한',
            message: '관리자만 접근할 수 있습니다.'
        });
    }
    next();
};

// 특정 역할 확인
export const hasRole = (role) => {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            next();
        } else {
            return ViewResolver.render(res, 'common/error', {
                title: '접근 제한',
                message: '접근 권한이 없습니다.'
            });
        }
    };
};

// 로그인 상태가 아닐 때만 접근 가능
export const isNotAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};
