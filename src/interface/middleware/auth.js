import viewResolver from '../../presentation/view/ViewResolver.js';

export const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        req.session.returnTo = req.originalUrl;
        return viewResolver.render(res, 'user/Login', {
            error: '로그인이 필요한 서비스입니다.',
            returnTo: req.originalUrl
        });
    }
};

export const hasRole = (role) => {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            next();
        } else {
            return viewResolver.render(res, 'common/error', {
                title: '접근 제한',
                message: '접근 권한이 없습니다.'
            });
        }
    };
};
