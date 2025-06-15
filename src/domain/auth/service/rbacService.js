import { UserRole } from '#common/constants/UserRole.js';
import logger from '#common/utils/Logger.js';

/**
 * RBAC (Role-Based Access Control) 서비스
 * 역할 기반 접근 제어를 관리합니다.
 */
export default class RBACService {
    constructor() {
        // 권한 그룹 정의 - 실제 프로젝트 구조에 맞게 재설계
        this.permissionGroups = {
            // 공개 접근 권한 (비로그인 사용자도 가능)
            PUBLIC_ACCESS: {
                name: '공개 접근 권한',
                permissions: [
                    'artwork:read',
                    'artwork:view_details',
                    'exhibition:read',
                    'exhibition:view_details'
                ]
            },

            // 기본 회원 권한 (SKKU_MEMBER, EXTERNAL_MEMBER 공통)
            MEMBER_BASIC: {
                name: '기본 회원 권한',
                permissions: [
                    'user:read',
                    'user:update_own', // 본인 프로필 수정
                    'artwork:create',
                    'artwork:update_own', // 본인 작품 수정
                    'artwork:delete_own', // 본인 작품 삭제
                    'exhibition:submit_artwork' // 전시회에 작품 출품
                ]
            },

            // 관리자 기본 권한
            ADMIN_BASIC: {
                name: '관리자 기본 권한',
                permissions: [
                    'admin:panel',
                    'admin:dashboard',
                    'admin:reports'
                ]
            },

            // 사용자 관리 권한
            USER_MANAGEMENT: {
                name: '사용자 관리 권한',
                permissions: [
                    'user:read',
                    'user:view_details',
                    'user:create',
                    'user:update',
                    'user:delete',
                    'user:activate',
                    'user:deactivate',
                    'user:reset_password'
                ]
            },

            // 컨텐츠 관리 권한
            CONTENT_MANAGEMENT: {
                name: '컨텐츠 관리 권한',
                permissions: [
                    'artwork:update', // 모든 작품 수정
                    'artwork:delete', // 모든 작품 삭제
                    'artwork:publish',
                    'artwork:feature',
                    'artwork:moderate',
                    'exhibition:create',
                    'exhibition:update',
                    'exhibition:delete',
                    'exhibition:publish',
                    'exhibition:feature',
                    'exhibition:moderate'
                ]
            },

            // 시스템 관리 권한
            SYSTEM_MANAGEMENT: {
                name: '시스템 관리 권한',
                permissions: [
                    'system:config',
                    'system:logs',
                    'system:maintenance',
                    'system:backup'
                ]
            }
        };

        // 개별 권한 정의 (하위 호환성을 위해 유지)
        this.permissions = this._generatePermissionsFromGroups();

        // 역할별 권한 그룹 매핑 - 실제 3개 역할에 맞게 단순화
        this.rolePermissionGroups = {
            // 외부 회원 - 기본 회원 권한 + 공개 접근
            [UserRole.EXTERNAL_MEMBER]: [
                'PUBLIC_ACCESS',
                'MEMBER_BASIC'
            ],

            // SKKU 회원 - 외부 회원과 동일한 권한
            [UserRole.SKKU_MEMBER]: [
                'PUBLIC_ACCESS',
                'MEMBER_BASIC'
            ],

            // 관리자 - 모든 권한
            [UserRole.ADMIN]: [
                'PUBLIC_ACCESS',
                'MEMBER_BASIC',
                'ADMIN_BASIC',
                'USER_MANAGEMENT',
                'CONTENT_MANAGEMENT',
                'SYSTEM_MANAGEMENT'
            ]
        };

        // 역할별 권한 매핑 (기존 방식과 호환성 유지)
        this.rolePermissions = this._generateRolePermissionsFromGroups();

        // 리소스 소유권 체크가 필요한 권한들
        this.ownershipRequiredPermissions = new Set([
            'artwork:update_own',
            'artwork:delete_own',
            'user:update_own'
        ]);
    }

    /**
     * 권한 그룹에서 개별 권한 객체 생성
     * @private
     */
    _generatePermissionsFromGroups() {
        const permissions = {};

        Object.entries(this.permissionGroups).forEach(([_groupKey, group]) => {
            group.permissions.forEach(permission => {
                // permission 문자열을 상수명으로 변환 (예: 'user:read' -> 'USER_READ')
                const constantName = permission.toUpperCase().replace(':', '_');
                permissions[constantName] = permission;
            });
        });

        return permissions;
    }

    /**
     * 권한 그룹에서 역할별 권한 배열 생성
     * @private
     */
    _generateRolePermissionsFromGroups() {
        const rolePermissions = {};

        Object.entries(this.rolePermissionGroups).forEach(([role, groupKeys]) => {
            const permissions = new Set();

            groupKeys.forEach(groupKey => {
                const group = this.permissionGroups[groupKey];
                if (group) {
                    group.permissions.forEach(permission => {
                        permissions.add(permission);
                    });
                }
            });

            rolePermissions[role] = Array.from(permissions);
        });

        return rolePermissions;
    }

    /**
     * 특정 권한 그룹의 권한들을 가져오기
     * @param {string} groupKey - 권한 그룹 키
     * @returns {string[]} 권한 배열
     */
    getPermissionGroup(groupKey) {
        const group = this.permissionGroups[groupKey];
        return group ? [...group.permissions] : [];
    }

    /**
     * 사용자 역할의 권한 그룹들을 가져오기
     * @param {string} userRole - 사용자 역할
     * @returns {string[]} 권한 그룹 키 배열
     */
    getUserPermissionGroups(userRole) {
        return this.rolePermissionGroups[userRole] || [];
    }

    /**
     * 권한 그룹 정보 조회
     * @param {string} groupKey - 권한 그룹 키
     * @returns {Object|null} 권한 그룹 정보
     */
    getPermissionGroupInfo(groupKey) {
        return this.permissionGroups[groupKey] || null;
    }

    /**
     * 모든 권한 그룹 목록 조회
     * @returns {Object} 권한 그룹 목록
     */
    getAllPermissionGroups() {
        return { ...this.permissionGroups };
    }

    /**
     * 공개 접근 가능한 권한인지 확인
     * @param {string} permission - 확인할 권한
     * @returns {boolean} 공개 접근 가능 여부
     */
    isPublicPermission(permission) {
        const publicGroup = this.permissionGroups.PUBLIC_ACCESS;
        return publicGroup ? publicGroup.permissions.includes(permission) : false;
    }

    /**
     * 사용자가 특정 권한 그룹을 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string} groupKey - 권한 그룹 키
     * @param {Object} context - 로깅을 위한 컨텍스트 정보
     * @returns {boolean} 권한 그룹 보유 여부
     */
    hasPermissionGroup(userRole, groupKey, context = {}) {
        if (!groupKey) {
            logger.warn('RBAC 권한 그룹 체크 실패 - 잘못된 매개변수', {
                userRole,
                groupKey,
                context
            });
            return false;
        }

        // 공개 접근 권한은 모든 사용자(비로그인 포함)가 가짐
        if (groupKey === 'PUBLIC_ACCESS') {
            logger.debug('RBAC 권한 그룹 체크 성공 - 공개 접근', {
                userRole: userRole || 'anonymous',
                groupKey,
                context
            });
            return true;
        }

        // 로그인이 필요한 권한의 경우 userRole 확인
        if (!userRole) {
            logger.warn('RBAC 권한 그룹 체크 실패 - 로그인 필요', {
                userRole,
                groupKey,
                context
            });
            return false;
        }

        // ADMIN은 모든 권한 그룹을 가짐
        if (userRole === UserRole.ADMIN) {
            logger.debug('RBAC 권한 그룹 체크 성공 - 관리자', {
                userRole,
                groupKey,
                context
            });
            return true;
        }

        const userGroups = this.rolePermissionGroups[userRole] || [];
        const hasGroup = userGroups.includes(groupKey);

        if (hasGroup) {
            logger.debug('RBAC 권한 그룹 체크 성공', {
                userRole,
                groupKey,
                context
            });
        } else {
            logger.warn('RBAC 권한 그룹 체크 실패 - 권한 그룹 없음', {
                userRole,
                groupKey,
                availableGroups: userGroups,
                context
            });
        }

        return hasGroup;
    }

    /**
     * 사용자가 여러 권한 그룹 중 하나라도 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string[]} groupKeys - 확인할 권한 그룹 키 목록
     * @param {Object} context - 로깅을 위한 컨텍스트 정보
     * @returns {boolean} 권한 그룹 보유 여부
     */
    hasAnyPermissionGroup(userRole, groupKeys, context = {}) {
        if (!Array.isArray(groupKeys)) {
            return false;
        }

        return groupKeys.some(groupKey => this.hasPermissionGroup(userRole, groupKey, context));
    }

    /**
     * 사용자가 모든 권한 그룹을 가지고 있는지 확인
     * @param {string} userRole - 사용자 역할
     * @param {string[]} groupKeys - 확인할 권한 그룹 키 목록
     * @param {Object} context - 로깅을 위한 컨텍스트 정보
     * @returns {boolean} 모든 권한 그룹 보유 여부
     */
    hasAllPermissionGroups(userRole, groupKeys, context = {}) {
        if (!Array.isArray(groupKeys)) {
            return false;
        }

        return groupKeys.every(groupKey => this.hasPermissionGroup(userRole, groupKey, context));
    }

    /**
     * 권한 그룹 기반 미들웨어 생성
     * @param {string|string[]} requiredGroups - 필요한 권한 그룹(들)
     * @param {boolean} requireAll - 모든 그룹이 필요한지 여부 (기본값: false)
     * @returns {Function} Express 미들웨어 함수
     */
    createPermissionGroupMiddleware(requiredGroups, requireAll = false) {
        return (req, res, next) => {
            const groups = Array.isArray(requiredGroups) ? requiredGroups : [requiredGroups];
            const context = {
                url: req.originalUrl,
                method: req.method,
                userId: req.user?.id
            };

            // 공개 접근 권한만 필요한 경우 바로 통과
            if (groups.length === 1 && groups[0] === 'PUBLIC_ACCESS') {
                logger.debug('RBAC 권한 그룹 미들웨어 - 공개 접근 허용', {
                    requiredGroups: groups,
                    context
                });
                return next();
            }

            // 로그인이 필요한 권한의 경우 인증 확인
            const needsAuth = groups.some(group => group !== 'PUBLIC_ACCESS');
            if (needsAuth && (!req.user || !req.user.role)) {
                logger.warn('RBAC 권한 그룹 미들웨어 - 인증되지 않은 사용자', {
                    url: req.originalUrl,
                    method: req.method,
                    requiredGroups: groups
                });
                return res.status(401).json({
                    error: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            let hasAccess;
            if (requireAll) {
                hasAccess = this.hasAllPermissionGroups(req.user?.role, groups, context);
            } else {
                hasAccess = this.hasAnyPermissionGroup(req.user?.role, groups, context);
            }

            if (hasAccess) {
                next();
            } else {
                logger.warn('RBAC 권한 그룹 미들웨어 - 접근 거부', {
                    userRole: req.user?.role,
                    requiredGroups: groups,
                    requireAll,
                    context
                });
                res.status(403).json({
                    error: 'Insufficient permissions',
                    code: 'PERMISSION_DENIED'
                });
            }
        };
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

                return res.status(401).json({
                    success: false,
                    error: '인증이 필요합니다.'
                });
            }

            const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

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
