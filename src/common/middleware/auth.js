import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import { UserRole } from '../constants/UserRole.js';
import RBACService from '../../domain/auth/service/rbacService.js';
import { extractUserFromToken } from './jwtAuth.js';

const rbacService = new RBACService();

/**
 * 사용자 인증 미들웨어 (하이브리드: 세션 + JWT)
 */

// 사용자 정보 추출 (세션 또는 JWT)
export const extractUser = async (req, res, next) => {
    // JWT 토큰에서 사용자 정보 추출
    await extractUserFromToken(req, res, () => { });

    // 통합된 사용자 정보 설정
    const sessionUser = req.session?.user;
    const jwtUser = req.jwtUser;

    if (jwtUser) {
        req.user = jwtUser;
        req.authMethod = 'jwt';
    } else if (sessionUser) {
        req.user = sessionUser;
        req.authMethod = 'session';
    } else {
        req.user = null;
        req.authMethod = null;
    }

    next();
};

// 로그인 필요 여부 확인 (하이브리드)
export const isAuthenticated = async (req, res, next) => {
    // 사용자 정보 추출
    await extractUser(req, res, () => { });

    if (!req.user) {
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

    // 사용자가 활성 상태인지 확인
    if (!req.user.isActive) {
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
};

// 관리자 권한 확인
export const isAdmin = async (req, res, next) => {
    await extractUser(req, res, () => { });

    if (!req.user || req.user.role !== UserRole.ADMIN) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({
                success: false,
                error: '관리자 권한이 필요합니다.'
            });
        }
        return ViewResolver.render(res, ViewPath.ERROR, {
            title: '접근 제한',
            message: '관리자만 접근할 수 있습니다.'
        });
    }
    next();
};

// SKKU 회원 권한 확인
export const isSkkuMember = async (req, res, next) => {
    await extractUser(req, res, () => { });

    if (!req.user || (req.user.role !== UserRole.SKKU_MEMBER && req.user.role !== UserRole.ADMIN)) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({
                success: false,
                error: 'SKKU 회원 권한이 필요합니다.'
            });
        }
        return ViewResolver.render(res, ViewPath.ERROR, {
            title: '접근 제한',
            message: 'SKKU 회원만 접근할 수 있습니다.'
        });
    }
    next();
};

// 특정 역할 확인
export const hasRole = (role) => {
    return async (req, res, next) => {
        await extractUser(req, res, () => { });

        if (!req.user || req.user.role !== role) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    error: `${role} 권한이 필요합니다.`
                });
            }
            return ViewResolver.render(res, 'common/error', {
                title: '접근 제한',
                message: '접근 권한이 없습니다.'
            });
        }
        next();
    };
};

// 로그인 상태가 아닐 때만 접근 가능
export const isNotAuthenticated = async (req, res, next) => {
    await extractUser(req, res, () => { });

    if (req.user) {
        return res.redirect('/');
    }
    next();
};

// RBAC 기반 권한 확인 미들웨어
export const hasPermission = (permission) => {
    return rbacService.createPermissionMiddleware(permission);
};

// RBAC 기반 여러 권한 중 하나 확인
export const hasAnyPermission = (permissions) => {
    return rbacService.createPermissionMiddleware(permissions, false);
};

// RBAC 기반 모든 권한 확인
export const hasAllPermissions = (permissions) => {
    return rbacService.createPermissionMiddleware(permissions, true);
};

// 리소스 소유권 기반 권한 확인
export const hasOwnership = (permission, getResourceFn) => {
    return rbacService.createOwnershipMiddleware(permission, getResourceFn);
};

// 편의 메서드들 - 자주 사용되는 권한 조합
export const canCreateArtwork = () => hasPermission(rbacService.permissions.ARTWORK_CREATE);
export const canUpdateArtwork = () => hasPermission(rbacService.permissions.ARTWORK_UPDATE);
export const canDeleteArtwork = () => hasPermission(rbacService.permissions.ARTWORK_DELETE);
export const canManageUsers = () => hasPermission(rbacService.permissions.ADMIN_USERS);
export const canAccessAdminPanel = () => hasPermission(rbacService.permissions.ADMIN_PANEL);

// RBAC 서비스 인스턴스 내보내기
export { rbacService };
