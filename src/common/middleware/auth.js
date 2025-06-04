import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import { UserRole } from '../constants/UserRole.js';
import RBACService from '../../domain/auth/service/rbacService.js';
import { extractUserFromToken } from './jwtAuth.js';
import { logUnauthorizedAccess } from './auditLogger.js';

const rbacService = new RBACService();

/**
 * 사용자 인증 미들웨어 (하이브리드: 세션 + JWT)
 */

// 사용자 정보 추출 (세션 또는 JWT)
export const extractUser = async (req, res, next) => {
    // JWT 토큰에서 사용자 정보 추출
    await extractUserFromToken(req, res, () => {});

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
    await extractUser(req, res, () => {});

    if (!req.user) {
        // 감사 로그 기록
        logUnauthorizedAccess(req);

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
    await extractUser(req, res, () => {});

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
    await extractUser(req, res, () => {});

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
export const hasRole = role => {
    return async (req, res, next) => {
        await extractUser(req, res, () => {});

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
    await extractUser(req, res, () => {});

    if (req.user) {
        return res.redirect('/');
    }
    next();
};

// RBAC 기반 권한 확인 미들웨어
export const hasPermission = permission => {
    return rbacService.createPermissionMiddleware(permission);
};

// RBAC 기반 여러 권한 중 하나 확인
export const hasAnyPermission = permissions => {
    return rbacService.createPermissionMiddleware(permissions, false);
};

// RBAC 기반 모든 권한 확인
export const hasAllPermissions = permissions => {
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

// 새로운 세밀한 권한 체크 미들웨어들
export const canViewAdminDashboard = () => hasPermission(rbacService.permissions.ADMIN_DASHBOARD);

// 사용자 관리 권한
export const canReadUsers = () => hasPermission(rbacService.permissions.ADMIN_USER_READ);
export const canWriteUsers = () => hasPermission(rbacService.permissions.ADMIN_USER_WRITE);
export const canManageUserDetails = () => hasPermission(rbacService.permissions.USER_VIEW_DETAILS);
export const canResetUserPassword = () => hasPermission(rbacService.permissions.USER_RESET_PASSWORD);
export const canDeleteUsers = () => hasPermission(rbacService.permissions.USER_DELETE);

// 컨텐츠 관리 권한
export const canReadContent = () => hasPermission(rbacService.permissions.ADMIN_CONTENT_READ);
export const canWriteContent = () => hasPermission(rbacService.permissions.ADMIN_CONTENT_WRITE);
export const canDeleteContent = () => hasPermission(rbacService.permissions.ADMIN_CONTENT_DELETE);

// 작품 관리 권한
export const canManageArtworks = () => hasPermission(rbacService.permissions.ADMIN_ARTWORK_MANAGEMENT);
export const canViewArtworkDetails = () => hasPermission(rbacService.permissions.ARTWORK_VIEW_DETAILS);
export const canModerateArtworks = () => hasPermission(rbacService.permissions.ARTWORK_MODERATE);
export const canFeatureArtworks = () => hasPermission(rbacService.permissions.ARTWORK_FEATURE);

// 전시회 관리 권한
export const canManageExhibitions = () => hasPermission(rbacService.permissions.ADMIN_EXHIBITION_MANAGEMENT);
export const canViewExhibitionDetails = () => hasPermission(rbacService.permissions.EXHIBITION_VIEW_DETAILS);
export const canModerateExhibitions = () => hasPermission(rbacService.permissions.EXHIBITION_MODERATE);
export const canFeatureExhibitions = () => hasPermission(rbacService.permissions.EXHIBITION_FEATURE);

// 복합 권한 체크
export const canManageUserManagement = () =>
    hasAllPermissions([
        rbacService.permissions.ADMIN_USER_MANAGEMENT,
        rbacService.permissions.ADMIN_USER_READ,
        rbacService.permissions.ADMIN_USER_WRITE
    ]);

export const canManageContentManagement = () =>
    hasAllPermissions([rbacService.permissions.ADMIN_CONTENT_READ, rbacService.permissions.ADMIN_CONTENT_WRITE]);

// 읽기 전용 체크
export const isReadOnlyAdmin = () => hasPermission(rbacService.permissions.ADMIN_READ_ONLY);

// RBAC 서비스 인스턴스 내보내기
export { rbacService };
