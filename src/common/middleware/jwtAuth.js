import AuthService from '../../domain/auth/service/AuthService.js';
import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import { UserRole } from '../constants/UserRole.js';

const authService = new AuthService();

/**
 * JWT 기반 인증 미들웨어
 */

// JWT 토큰에서 사용자 정보 추출
export const extractUserFromToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

        if (token) {
            try {
                const decoded = authService.verifyAccessToken(token);
                req.jwtUser = decoded;
            } catch (error) {
                // 토큰이 유효하지 않으면 무시하고 계속 진행
                req.jwtUser = null;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// JWT 인증 필수 미들웨어
export const requireJwtAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

        if (!token) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    error: '인증 토큰이 필요합니다.'
                });
            }
            return ViewResolver.render(res, ViewPath.ERROR, {
                title: '인증 필요',
                error: '접근 권한이 없습니다.',
                message: '로그인이 필요한 서비스입니다.'
            });
        }

        try {
            const decoded = authService.verifyAccessToken(token);
            req.jwtUser = decoded;

            // 사용자가 활성 상태인지 확인
            if (!decoded.isActive) {
                if (req.xhr || req.headers.accept?.includes('application/json')) {
                    return res.status(403).json({
                        success: false,
                        error: '비활성화된 계정입니다.'
                    });
                }
                return ViewResolver.render(res, ViewPath.ERROR, {
                    title: '계정 비활성화',
                    error: '비활성화된 계정입니다.',
                    message: '관리자에게 문의하세요.'
                });
            }

            next();
        } catch (error) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    error: error.message || '유효하지 않은 토큰입니다.'
                });
            }
            return ViewResolver.render(res, ViewPath.ERROR, {
                title: '인증 실패',
                error: '토큰 인증에 실패했습니다.',
                message: error.message || '다시 로그인해 주세요.'
            });
        }
    } catch (error) {
        next(error);
    }
};

// JWT 기반 관리자 권한 확인
export const requireJwtAdmin = (req, res, next) => {
    if (!req.jwtUser || req.jwtUser.role !== UserRole.ADMIN) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({
                success: false,
                error: '관리자 권한이 필요합니다.'
            });
        }
        return ViewResolver.render(res, ViewPath.ERROR, {
            title: '접근 제한',
            error: '관리자 권한이 필요합니다.',
            message: '접근 권한이 없습니다.'
        });
    }
    next();
};

// JWT 기반 특정 역할 확인
export const requireJwtRole = (role) => {
    return (req, res, next) => {
        if (!req.jwtUser || req.jwtUser.role !== role) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    error: `${role} 권한이 필요합니다.`
                });
            }
            return ViewResolver.render(res, ViewPath.ERROR, {
                title: '접근 제한',
                error: `${role} 권한이 필요합니다.`,
                message: '접근 권한이 없습니다.'
            });
        }
        next();
    };
};

// 하이브리드 인증 미들웨어 (세션 또는 JWT)
export const requireAuth = (req, res, next) => {
    // 세션 인증 확인
    const hasSessionAuth = req.session && req.session.user;

    // JWT 인증 확인
    let hasJwtAuth = false;
    if (req.jwtUser) {
        hasJwtAuth = true;
    }

    if (!hasSessionAuth && !hasJwtAuth) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({
                success: false,
                error: '로그인이 필요한 서비스입니다.'
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

    // 사용자 정보를 req.user에 통합
    if (hasJwtAuth) {
        req.user = req.jwtUser;
    } else if (hasSessionAuth) {
        req.user = req.session.user;
    }

    next();
};

// 하이브리드 관리자 권한 확인
export const requireAdminAuth = (req, res, next) => {
    const user = req.jwtUser || req.session?.user;

    if (!user || user.role !== UserRole.ADMIN) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({
                success: false,
                error: '관리자 권한이 필요합니다.'
            });
        }
        return ViewResolver.render(res, ViewPath.ERROR, {
            title: '접근 제한',
            error: '관리자 권한이 필요합니다.',
            message: '관리자만 접근할 수 있습니다.'
        });
    }
    next();
};
