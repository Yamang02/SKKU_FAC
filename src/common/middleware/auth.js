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

// RBAC 기반 권한 확인 미들웨어 (하위 호환성을 위해 유지)
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

// 사용자 수정 권한 (소유권 + 권한 체크)
export const canUpdateUser = () => {
    return async (req, res, next) => {
        await extractUser(req, res, () => { });

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const targetUserId = req.params.id || req.user.id;
        const currentUser = req.user;

        // 본인 수정 또는 관리자 권한 체크
        if (currentUser.id === targetUserId) {
            // 본인 프로필 수정 권한 체크
            if (rbacService.hasPermissionGroup(currentUser.role, 'MEMBER_BASIC')) {
                return next();
            }
        } else {
            // 다른 사용자 수정 - 관리자 권한 필요
            if (rbacService.hasPermissionGroup(currentUser.role, 'USER_MANAGEMENT')) {
                return next();
            }
        }

        return res.status(403).json({ error: 'Insufficient permissions' });
    };
};

// 사용자 삭제 권한 (소유권 + 권한 체크)
export const canDeleteUser = () => {
    return async (req, res, next) => {
        await extractUser(req, res, () => { });

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const targetUserId = req.params.id || req.user.id;
        const currentUser = req.user;

        // 본인 삭제 또는 관리자 권한 체크
        if (currentUser.id === targetUserId) {
            // 본인 계정 삭제 권한 체크
            if (rbacService.hasPermissionGroup(currentUser.role, 'MEMBER_BASIC')) {
                return next();
            }
        } else {
            // 다른 사용자 삭제 - 관리자 권한 필요
            if (rbacService.hasPermissionGroup(currentUser.role, 'USER_MANAGEMENT')) {
                return next();
            }
        }

        return res.status(403).json({ error: 'Insufficient permissions' });
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

// ========== 하위 호환성을 위한 기존 미들웨어 (Deprecated) ==========

// 관리자 권한 확인 (Deprecated: requireAdminAccess() 사용 권장)
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

// SKKU 회원 권한 확인 (Deprecated: requireMemberAccess() 사용 권장)
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

// 특정 역할 확인 (Deprecated: 권한 그룹 미들웨어 사용 권장)
export const hasRole = role => {
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

// 읽기 전용 관리자 체크 (특수 목적으로 유지)
export const isReadOnlyAdmin = () => hasPermission(rbacService.permissions.ADMIN_READ_ONLY);

// ========== 권한 그룹 기반 미들웨어 ==========

// 권한 그룹 확인 미들웨어
export const hasPermissionGroup = groupKey => {
    return rbacService.createPermissionGroupMiddleware(groupKey);
};

// 여러 권한 그룹 중 하나 확인
export const hasAnyPermissionGroup = groupKeys => {
    return rbacService.createPermissionGroupMiddleware(groupKeys, false);
};

// 모든 권한 그룹 확인
export const hasAllPermissionGroups = groupKeys => {
    return rbacService.createPermissionGroupMiddleware(groupKeys, true);
};

// ========== 편의 미들웨어 - 실제 프로젝트 구조에 맞게 단순화 ==========

// 공개 접근 (비로그인 사용자도 가능)
export const allowPublicAccess = () => hasPermissionGroup('PUBLIC_ACCESS');

// 기본 회원 권한 (SKKU_MEMBER, EXTERNAL_MEMBER)
export const requireMemberAccess = () => hasPermissionGroup('MEMBER_BASIC');

// 관리자 권한
export const requireAdminAccess = () => hasPermissionGroup('ADMIN_BASIC');

// 사용자 관리 권한
export const requireUserManagement = () => hasPermissionGroup('USER_MANAGEMENT');

// 컨텐츠 관리 권한
export const requireContentManagement = () => hasPermissionGroup('CONTENT_MANAGEMENT');

// 시스템 관리 권한
export const requireSystemManagement = () => hasPermissionGroup('SYSTEM_MANAGEMENT');

// ========== 조합 미들웨어 ==========

// 작품 관련 - 공개 조회 또는 회원 생성
export const artworkAccess = () => hasAnyPermissionGroup(['PUBLIC_ACCESS', 'MEMBER_BASIC']);

// 전시회 관련 - 공개 조회 또는 회원 출품
export const exhibitionAccess = () => hasAnyPermissionGroup(['PUBLIC_ACCESS', 'MEMBER_BASIC']);

// 관리자 또는 컨텐츠 관리자
export const adminOrContentManager = () => hasAnyPermissionGroup(['ADMIN_BASIC', 'CONTENT_MANAGEMENT']);

// RBAC 서비스 인스턴스 내보내기
export { rbacService };
