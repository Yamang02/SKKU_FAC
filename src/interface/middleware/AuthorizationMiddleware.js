import { UserRole } from '../../infrastructure/data/user.js';

/**
 * 사용자가 로그인되어 있는지 확인하는 미들웨어
 */
export const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/user/login');
    }
};

/**
 * 사용자가 관리자인지 확인하는 미들웨어
 */
export const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === UserRole.ADMIN) {
        next();
    } else {
        res.status(403).render('common/error', {
            title: '접근 제한',
            message: '관리자만 접근할 수 있습니다.'
        });
    }
};
