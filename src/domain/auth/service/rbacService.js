import { UserRole } from '../../../common/constants/UserRole.js';

/**
 * 역할 기반 접근 제어(RBAC) 서비스
 */
export default class RBACService {
    constructor() {
        // 권한 정의
        this.permissions = {
            // 사용자 관리 권한
            USER_CREATE: 'user:create',
            USER_READ: 'user:read',
            USER_UPDATE: 'user:update',
            USER_DELETE: 'user:delete',
            USER_ACTIVATE: 'user:activate',
            USER_DEACTIVATE: 'user:deactivate',

            // 작품 관리 권한
            ARTWORK_CREATE: 'artwork:create',
            ARTWORK_READ: 'artwork:read',
            ARTWORK_UPDATE: 'artwork:update',
            ARTWORK_DELETE: 'artwork:delete',
            ARTWORK_PUBLISH: 'artwork:publish',
            ARTWORK_FEATURE: 'artwork:feature',

            // 전시회 관리 권한
            EXHIBITION_CREATE: 'exhibition:create',
            EXHIBITION_READ: 'exhibition:read',
            EXHIBITION_UPDATE: 'exhibition:update',
            EXHIBITION_DELETE: 'exhibition:delete',
            EXHIBITION_PUBLISH: 'exhibition:publish',

            // 관리자 권한
            ADMIN_PANEL: 'admin:panel',
            ADMIN_SETTINGS: 'admin:settings',
            ADMIN_USERS: 'admin:users',
            ADMIN_CONTENT: 'admin:content',
            ADMIN_REPORTS: 'admin:reports',

            // 시스템 권한
            SYSTEM_CONFIG: 'system:config',
            SYSTEM_LOGS: 'system:logs',
            SYSTEM_MAINTENANCE: 'system:maintenance'
        };

        // 역할별 권한 매핑
        this.rolePermissions = {
            // 외부 회원 - 기본적인 조회 권한만
            [UserRole.EXTERNAL_MEMBER]: [
                this.permissions.ARTWORK_READ,
                this.permissions.EXHIBITION_READ,
                this.permissions.USER_READ,
                this.permissions.USER_UPDATE // 자신의 프로필만
            ],
            // SKKU 회원 - 작품 등록 및 기본 권한
            [UserRole.SKKU_MEMBER]: [
                this.permissions.ARTWORK_READ,
                this.permissions.ARTWORK_CREATE,
                this.permissions.ARTWORK_UPDATE, // 자신의 작품만
                this.permissions.EXHIBITION_READ,
                this.permissions.USER_READ,
                this.permissions.USER_UPDATE // 자신의 프로필만
            ],
            // 관리자 - 모든 권한
            [UserRole.ADMIN]: [
                // 모든 권한
                ...Object.values(this.permissions)
            ]
        };

        // 리소스 소유권 체크가 필요한 권한들
        this.ownershipRequiredPermissions = new Set([
            this.permissions.ARTWORK_UPDATE,
            this.permissions.ARTWORK_DELETE,
            this.permissions.USER_UPDATE
        ]);
    }

    /**
     * 사용자가 특정 권한을 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string} permission - 확인할 권한
     * @returns {boolean} 권한 여부
     */
    hasPermission(userRole, permission) {
        if (!userRole || !permission) {
            return false;
        }

        // ADMIN은 모든 권한을 가짐
        if (userRole === UserRole.ADMIN) {
            return true;
        }

        // 해당 역할의 권한 목록에서 확인
        const rolePerms = this.rolePermissions[userRole] || [];
        return rolePerms.includes(permission);
    }

    /**
     * 사용자가 여러 권한 중 하나라도 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string[]} permissions - 확인할 권한 목록
     * @returns {boolean} 권한 여부
     */
    hasAnyPermission(userRole, permissions) {
        if (!Array.isArray(permissions)) {
            return false;
        }

        return permissions.some(permission => this.hasPermission(userRole, permission));
    }

    /**
     * 사용자가 모든 권한을 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string[]} permissions - 확인할 권한 목록
     * @returns {boolean} 권한 여부
     */
    hasAllPermissions(userRole, permissions) {
        if (!Array.isArray(permissions)) {
            return false;
        }

        return permissions.every(permission => this.hasPermission(userRole, permission));
    }

    /**
     * 리소스 소유권 확인
     * @param {Object} user - 사용자 객체
     * @param {Object} resource - 리소스 객체
     * @param {string} permission - 권한
     * @returns {boolean} 소유권 여부
     */
    checkOwnership(user, resource, permission) {
        // 관리자는 모든 리소스에 접근 가능
        if (user.role === UserRole.ADMIN) {
            return true;
        }

        // 소유권 체크가 필요하지 않은 권한은 바로 통과
        if (!this.ownershipRequiredPermissions.has(permission)) {
            return this.hasPermission(user.role, permission);
        }

        // 리소스 소유자인지 확인
        const isOwner = resource.userId === user.id || resource.createdBy === user.id;

        return isOwner && this.hasPermission(user.role, permission);
    }

    /**
     * 사용자의 역할별 권한 목록 반환
     * @param {string} userRole - 사용자 역할
     * @returns {string[]} 권한 목록
     */
    getUserPermissions(userRole) {
        return this.rolePermissions[userRole] || [];
    }

    /**
     * 모든 권한 목록 반환
     * @returns {Object} 권한 객체
     */
    getAllPermissions() {
        return { ...this.permissions };
    }

    /**
     * 권한 기반 미들웨어 생성
     * @param {string|string[]} requiredPermissions - 필요한 권한(들)
     * @param {boolean} requireAll - 모든 권한이 필요한지 여부 (기본: false)
     * @returns {Function} 미들웨어 함수
     */
    createPermissionMiddleware(requiredPermissions, requireAll = false) {
        return (req, res, next) => {
            const user = req.jwtUser || req.session?.user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: '인증이 필요합니다.'
                });
            }

            const permissions = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : [requiredPermissions];

            const hasPermission = requireAll
                ? this.hasAllPermissions(user.role, permissions)
                : this.hasAnyPermission(user.role, permissions);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: '권한이 없습니다.',
                    requiredPermissions: permissions
                });
            }

            next();
        };
    }

    /**
     * 리소스 소유권 기반 미들웨어 생성
     * @param {string} permission - 필요한 권한
     * @param {Function} getResourceFn - 리소스 조회 함수
     * @returns {Function} 미들웨어 함수
     */
    createOwnershipMiddleware(permission, getResourceFn) {
        return async (req, res, next) => {
            const user = req.jwtUser || req.session?.user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: '인증이 필요합니다.'
                });
            }

            try {
                const resource = await getResourceFn(req);

                if (!resource) {
                    return res.status(404).json({
                        success: false,
                        error: '리소스를 찾을 수 없습니다.'
                    });
                }

                const hasPermission = this.checkOwnership(user, resource, permission);

                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        error: '해당 리소스에 대한 권한이 없습니다.'
                    });
                }

                req.resource = resource;
                next();
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: '권한 확인 중 오류가 발생했습니다.'
                });
            }
        };
    }
}
