import { UserRole } from '../../../common/constants/UserRole.js';
import logger from '../../../common/utils/Logger.js';
import { logPermissionDenied, logUnauthorizedAccess } from '../../../common/middleware/auditLogger.js';

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
            USER_RESET_PASSWORD: 'user:reset_password',
            USER_VIEW_DETAILS: 'user:view_details',

            // 작품 관리 권한
            ARTWORK_CREATE: 'artwork:create',
            ARTWORK_READ: 'artwork:read',
            ARTWORK_UPDATE: 'artwork:update',
            ARTWORK_DELETE: 'artwork:delete',
            ARTWORK_PUBLISH: 'artwork:publish',
            ARTWORK_FEATURE: 'artwork:feature',
            ARTWORK_MODERATE: 'artwork:moderate',
            ARTWORK_VIEW_DETAILS: 'artwork:view_details',

            // 전시회 관리 권한
            EXHIBITION_CREATE: 'exhibition:create',
            EXHIBITION_READ: 'exhibition:read',
            EXHIBITION_UPDATE: 'exhibition:update',
            EXHIBITION_DELETE: 'exhibition:delete',
            EXHIBITION_PUBLISH: 'exhibition:publish',
            EXHIBITION_FEATURE: 'exhibition:feature',
            EXHIBITION_MODERATE: 'exhibition:moderate',
            EXHIBITION_VIEW_DETAILS: 'exhibition:view_details',

            // 관리자 권한 - 더 세밀한 분류
            ADMIN_PANEL: 'admin:panel',
            ADMIN_DASHBOARD: 'admin:dashboard',
            ADMIN_SETTINGS: 'admin:settings',
            ADMIN_USERS: 'admin:users',
            ADMIN_CONTENT: 'admin:content',
            ADMIN_REPORTS: 'admin:reports',
            ADMIN_USER_MANAGEMENT: 'admin:user_management',
            ADMIN_EXHIBITION_MANAGEMENT: 'admin:exhibition_management',
            ADMIN_ARTWORK_MANAGEMENT: 'admin:artwork_management',

            // 시스템 권한
            SYSTEM_CONFIG: 'system:config',
            SYSTEM_LOGS: 'system:logs',
            SYSTEM_MAINTENANCE: 'system:maintenance',
            SYSTEM_BACKUP: 'system:backup',

            // 새로운 세밀한 권한들
            ADMIN_READ_ONLY: 'admin:read_only',
            ADMIN_USER_READ: 'admin:user_read',
            ADMIN_USER_WRITE: 'admin:user_write',
            ADMIN_CONTENT_READ: 'admin:content_read',
            ADMIN_CONTENT_WRITE: 'admin:content_write',
            ADMIN_CONTENT_DELETE: 'admin:content_delete',
            ADMIN_SYSTEM_READ: 'admin:system_read',
            ADMIN_SYSTEM_WRITE: 'admin:system_write'
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
            // 읽기 전용 관리자 - 모든 데이터 조회만 가능
            [UserRole.ADMIN_READ_ONLY]: [
                this.permissions.ADMIN_PANEL,
                this.permissions.ADMIN_DASHBOARD,
                this.permissions.ADMIN_READ_ONLY,
                this.permissions.ADMIN_USER_READ,
                this.permissions.ADMIN_CONTENT_READ,
                this.permissions.ADMIN_SYSTEM_READ,
                this.permissions.USER_READ,
                this.permissions.USER_VIEW_DETAILS,
                this.permissions.ARTWORK_READ,
                this.permissions.ARTWORK_VIEW_DETAILS,
                this.permissions.EXHIBITION_READ,
                this.permissions.EXHIBITION_VIEW_DETAILS,
                this.permissions.ADMIN_REPORTS
            ],
            // 사용자 관리자 - 사용자 관련 모든 권한
            [UserRole.ADMIN_USER_MANAGER]: [
                this.permissions.ADMIN_PANEL,
                this.permissions.ADMIN_DASHBOARD,
                this.permissions.ADMIN_USER_MANAGEMENT,
                this.permissions.ADMIN_USER_READ,
                this.permissions.ADMIN_USER_WRITE,
                this.permissions.USER_CREATE,
                this.permissions.USER_READ,
                this.permissions.USER_UPDATE,
                this.permissions.USER_DELETE,
                this.permissions.USER_ACTIVATE,
                this.permissions.USER_DEACTIVATE,
                this.permissions.USER_RESET_PASSWORD,
                this.permissions.USER_VIEW_DETAILS,
                this.permissions.ADMIN_USERS,
                this.permissions.ADMIN_REPORTS,
                // 컨텐츠는 읽기만 가능
                this.permissions.ARTWORK_READ,
                this.permissions.ARTWORK_VIEW_DETAILS,
                this.permissions.EXHIBITION_READ,
                this.permissions.EXHIBITION_VIEW_DETAILS
            ],
            // 컨텐츠 관리자 - 작품/전시회 관련 모든 권한
            [UserRole.ADMIN_CONTENT_MANAGER]: [
                this.permissions.ADMIN_PANEL,
                this.permissions.ADMIN_DASHBOARD,
                this.permissions.ADMIN_EXHIBITION_MANAGEMENT,
                this.permissions.ADMIN_ARTWORK_MANAGEMENT,
                this.permissions.ADMIN_CONTENT_READ,
                this.permissions.ADMIN_CONTENT_WRITE,
                this.permissions.ADMIN_CONTENT_DELETE,
                this.permissions.ARTWORK_CREATE,
                this.permissions.ARTWORK_READ,
                this.permissions.ARTWORK_UPDATE,
                this.permissions.ARTWORK_DELETE,
                this.permissions.ARTWORK_PUBLISH,
                this.permissions.ARTWORK_FEATURE,
                this.permissions.ARTWORK_MODERATE,
                this.permissions.ARTWORK_VIEW_DETAILS,
                this.permissions.EXHIBITION_CREATE,
                this.permissions.EXHIBITION_READ,
                this.permissions.EXHIBITION_UPDATE,
                this.permissions.EXHIBITION_DELETE,
                this.permissions.EXHIBITION_PUBLISH,
                this.permissions.EXHIBITION_FEATURE,
                this.permissions.EXHIBITION_MODERATE,
                this.permissions.EXHIBITION_VIEW_DETAILS,
                this.permissions.ADMIN_CONTENT,
                this.permissions.ADMIN_REPORTS,
                // 사용자는 읽기만 가능
                this.permissions.USER_READ,
                this.permissions.USER_VIEW_DETAILS
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
     * @param {Object} context - 로깅을 위한 컨텍스트 정보
     * @returns {boolean} 권한 여부
     */
    hasPermission(userRole, permission, context = {}) {
        if (!userRole || !permission) {
            logger.warn('RBAC 권한 체크 실패 - 잘못된 매개변수', {
                userRole,
                permission,
                context
            });
            return false;
        }

        // ADMIN은 모든 권한을 가짐
        if (userRole === UserRole.ADMIN) {
            logger.debug('RBAC 권한 체크 성공 - 슈퍼 관리자', {
                userRole,
                permission,
                context
            });
            return true;
        }

        // 해당 역할의 권한 목록에서 확인
        const rolePerms = this.rolePermissions[userRole] || [];
        const hasAccess = rolePerms.includes(permission);

        if (hasAccess) {
            logger.debug('RBAC 권한 체크 성공', {
                userRole,
                permission,
                context
            });
        } else {
            logger.warn('RBAC 권한 체크 실패 - 권한 없음', {
                userRole,
                permission,
                availablePermissions: rolePerms,
                context
            });
        }

        return hasAccess;
    }

    /**
     * 사용자가 여러 권한 중 하나라도 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string[]} permissions - 확인할 권한 목록
     * @param {Object} context - 로깅을 위한 컨텍스트 정보
     * @returns {boolean} 권한 여부
     */
    hasAnyPermission(userRole, permissions, context = {}) {
        if (!Array.isArray(permissions)) {
            return false;
        }

        return permissions.some(permission => this.hasPermission(userRole, permission, context));
    }

    /**
     * 사용자가 모든 권한을 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string[]} permissions - 확인할 권한 목록
     * @param {Object} context - 로깅을 위한 컨텍스트 정보
     * @returns {boolean} 권한 여부
     */
    hasAllPermissions(userRole, permissions, context = {}) {
        if (!Array.isArray(permissions)) {
            return false;
        }

        return permissions.every(permission => this.hasPermission(userRole, permission, context));
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
            const context = {
                endpoint: req.originalUrl,
                method: req.method,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                userId: user?.id,
                sessionId: req.sessionID
            };

            if (!user) {
                logger.warn('RBAC 미들웨어 - 인증되지 않은 접근 시도', {
                    ...context,
                    requiredPermissions
                });

                // 감사 로그 기록
                logUnauthorizedAccess(req);

                return res.status(401).json({
                    success: false,
                    error: '인증이 필요합니다.'
                });
            }

            const permissions = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : [requiredPermissions];

            const hasPermission = requireAll
                ? this.hasAllPermissions(user.role, permissions, context)
                : this.hasAnyPermission(user.role, permissions, context);

            if (!hasPermission) {
                logger.warn('RBAC 미들웨어 - 권한 없는 접근 시도', {
                    ...context,
                    userRole: user.role,
                    requiredPermissions: permissions,
                    requireAll
                });

                // 감사 로그 기록
                logPermissionDenied(req, permissions);

                return res.status(403).json({
                    success: false,
                    error: '권한이 없습니다.',
                    requiredPermissions: permissions
                });
            }

            logger.info('RBAC 미들웨어 - 권한 체크 성공', {
                ...context,
                userRole: user.role,
                requiredPermissions: permissions,
                requireAll
            });

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
