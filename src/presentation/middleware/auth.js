import { UserStatus } from '../../infrastructure/data/user.js';

/**
 * 로그인 여부를 확인하는 미들웨어
 */
export const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    next();
};

/**
 * 사용자 상태를 확인하는 미들웨어
 */
export const checkUserStatus = (req, res, next) => {
    if (!req.user) {
        return next();
    }

    if (req.user.status === UserStatus.INACTIVE) {
        req.logout(() => {
            res.status(403).render('error', {
                error: '비활성화된 계정입니다.'
            });
        });
        return;
    }

    if (req.user.status === UserStatus.BLOCKED) {
        req.logout(() => {
            res.status(403).render('error', {
                error: '차단된 계정입니다.'
            });
        });
        return;
    }

    next();
};

/**
 * 특정 역할을 가진 사용자만 접근을 허용하는 미들웨어
 */
export const hasRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).render('error', {
                error: '접근 권한이 없습니다.'
            });
        }
        next();
    };
};
