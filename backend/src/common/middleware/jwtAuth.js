import AuthService from '../../domain/auth/service/AuthService.js';
import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import { UserRole } from '../constants/UserRole.js';
import { ApiResponse } from '../../domain/common/model/ApiResponse.js';
import logger from '../utils/Logger.js';

const authService = new AuthService();

/**
 * JWT 기반 인증 미들웨어
 */

/**
 * Authorization 헤더에서 JWT 토큰 추출
 * @param {string} authHeader - Authorization 헤더 값
 * @returns {string|null} 추출된 토큰 또는 null
 */
const extractTokenFromHeader = (authHeader) => {
    return authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
};

/**
 * 보안 이벤트 로깅
 * @param {string} event - 이벤트 타입
 * @param {Object} req - Express request 객체
 * @param {string} details - 추가 상세 정보
 */
const logSecurityEvent = (event, req, details = '') => {
    logger.warn(`JWT 보안 이벤트: ${event}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        details,
        timestamp: new Date().toISOString()
    });
};

// JWT 토큰에서 사용자 정보 추출
export const extractUserFromToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

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
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            logSecurityEvent('토큰 누락', req);

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json(ApiResponse.error('인증 토큰이 필요합니다.'));
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
                logSecurityEvent('비활성 계정 접근 시도', req, `사용자 ID: ${decoded.id}`);

                if (req.xhr || req.headers.accept?.includes('application/json')) {
                    return res.status(403).json(ApiResponse.error('비활성화된 계정입니다.'));
                }
                return ViewResolver.render(res, ViewPath.ERROR, {
                    title: '계정 비활성화',
                    error: '비활성화된 계정입니다.',
                    message: '관리자에게 문의하세요.'
                });
            }

            next();
        } catch (error) {
            logSecurityEvent('토큰 검증 실패', req, error.message);

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json(ApiResponse.error(error.message || '유효하지 않은 토큰입니다.'));
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
        logSecurityEvent('관리자 권한 없는 접근 시도', req, `사용자 역할: ${req.jwtUser?.role || 'none'}`);

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json(ApiResponse.error('관리자 권한이 필요합니다.'));
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
export const requireJwtRole = role => {
    return (req, res, next) => {
        if (!req.jwtUser || req.jwtUser.role !== role) {
            logSecurityEvent('역할 권한 없는 접근 시도', req, `필요 역할: ${role}, 사용자 역할: ${req.jwtUser?.role || 'none'}`);

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json(ApiResponse.error(`${role} 권한이 필요합니다.`));
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
        logSecurityEvent('인증되지 않은 접근 시도', req);

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json(ApiResponse.error('로그인이 필요한 서비스입니다.'));
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
        logSecurityEvent('관리자 권한 없는 하이브리드 접근 시도', req, `사용자 역할: ${user?.role || 'none'}`);

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json(ApiResponse.error('관리자 권한이 필요합니다.'));
        }
        return ViewResolver.render(res, ViewPath.ERROR, {
            title: '접근 제한',
            error: '관리자 권한이 필요합니다.',
            message: '관리자만 접근할 수 있습니다.'
        });
    }
    next();
};
