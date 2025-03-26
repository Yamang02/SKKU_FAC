import ViewResolver from '../utils/ViewResolver.js';

export const UserRole = {
    ADMIN: 'ADMIN',
    USER: 'USER'
};

export const authenticate = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        req.session.returnTo = req.originalUrl;
        return ViewResolver.render(res, 'user/Login', {
            error: '로그인이 필요한 서비스입니다.',
            returnTo: req.originalUrl
        });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === UserRole.ADMIN) {
        next();
    } else {
        return ViewResolver.render(res, 'common/error', {
            title: '접근 제한',
            message: '관리자만 접근할 수 있습니다.'
        });
    }
};

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
