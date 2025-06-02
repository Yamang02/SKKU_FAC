import { test, expect } from '@playwright/test';
import RBACService from '../../../src/domain/auth/service/rbacService.js';

/**
 * RBACService 단위테스트
 */
test.describe('RBACService', () => {
    let rbacService;

    test.beforeEach(() => {
        rbacService = new RBACService();
    });

    test.describe('역할 권한 매핑', () => {
        test('ADMIN 역할 권한 확인', () => {
            const adminPermissions = rbacService.getUserPermissions('ADMIN');

            expect(adminPermissions).toContain('user:create');
            expect(adminPermissions).toContain('user:read');
            expect(adminPermissions).toContain('user:update');
            expect(adminPermissions).toContain('user:delete');
            expect(adminPermissions).toContain('artwork:create');
            expect(adminPermissions).toContain('artwork:read');
            expect(adminPermissions).toContain('artwork:update');
            expect(adminPermissions).toContain('artwork:delete');
            expect(adminPermissions).toContain('admin:panel');
        });

        test('SKKU_MEMBER 역할 권한 확인', () => {
            const skkuPermissions = rbacService.getUserPermissions('SKKU_MEMBER');

            expect(skkuPermissions).toContain('artwork:create');
            expect(skkuPermissions).toContain('artwork:read');
            expect(skkuPermissions).toContain('artwork:update');
            expect(skkuPermissions).toContain('exhibition:read');
            expect(skkuPermissions).toContain('user:read');
            expect(skkuPermissions).toContain('user:update');

            // 관리자 전용 권한은 없어야 함
            expect(skkuPermissions).not.toContain('admin:panel');
            expect(skkuPermissions).not.toContain('user:delete');
            expect(skkuPermissions).not.toContain('artwork:delete');
        });

        test('EXTERNAL_MEMBER 역할 권한 확인', () => {
            const externalPermissions = rbacService.getUserPermissions('EXTERNAL_MEMBER');

            expect(externalPermissions).toContain('artwork:read');
            expect(externalPermissions).toContain('exhibition:read');
            expect(externalPermissions).toContain('user:read');
            expect(externalPermissions).toContain('user:update');

            // 생성/수정/삭제 권한은 없어야 함
            expect(externalPermissions).not.toContain('artwork:create');
            expect(externalPermissions).not.toContain('artwork:delete');
            expect(externalPermissions).not.toContain('exhibition:create');
        });

        test('존재하지 않는 역할 처리', () => {
            const permissions = rbacService.getUserPermissions('INVALID_ROLE');
            expect(permissions).toEqual([]);
        });
    });

    test.describe('권한 확인', () => {
        test('관리자 권한 확인', () => {
            expect(rbacService.hasPermission('ADMIN', 'user:create')).toBe(true);
            expect(rbacService.hasPermission('ADMIN', 'admin:panel')).toBe(true);
            expect(rbacService.hasPermission('ADMIN', 'artwork:delete')).toBe(true);
        });

        test('SKKU 멤버 권한 확인', () => {
            expect(rbacService.hasPermission('SKKU_MEMBER', 'artwork:create')).toBe(true);
            expect(rbacService.hasPermission('SKKU_MEMBER', 'artwork:read')).toBe(true);
            expect(rbacService.hasPermission('SKKU_MEMBER', 'admin:panel')).toBe(false);
            expect(rbacService.hasPermission('SKKU_MEMBER', 'user:delete')).toBe(false);
        });

        test('외부 멤버 권한 확인', () => {
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'artwork:read')).toBe(true);
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'exhibition:read')).toBe(true);
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'artwork:create')).toBe(false);
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'user:delete')).toBe(false);
        });

        test('권한이 없는 경우', () => {
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'admin:panel')).toBe(false);
            expect(rbacService.hasPermission('SKKU_MEMBER', 'system:config')).toBe(false);
        });
    });

    test.describe('소유권 기반 권한', () => {
        test('자신의 작품에 대한 권한 확인', () => {
            const user = { id: 1, role: 'SKKU_MEMBER' };
            const ownArtwork = { userId: 1 };

            expect(rbacService.checkOwnership(user, ownArtwork, 'artwork:update')).toBe(true);
            expect(rbacService.checkOwnership(user, ownArtwork, 'artwork:delete')).toBe(false); // SKKU_MEMBER는 삭제 권한 없음
        });

        test('다른 사용자의 작품에 대한 권한 확인', () => {
            const user = { id: 1, role: 'SKKU_MEMBER' };
            const otherArtwork = { userId: 2 };

            expect(rbacService.checkOwnership(user, otherArtwork, 'artwork:update')).toBe(false);
            expect(rbacService.checkOwnership(user, otherArtwork, 'artwork:delete')).toBe(false);
        });

        test('관리자는 모든 리소스에 접근 가능', () => {
            const admin = { id: 1, role: 'ADMIN' };
            const anyArtwork = { userId: 2 };

            expect(rbacService.checkOwnership(admin, anyArtwork, 'artwork:update')).toBe(true);
            expect(rbacService.checkOwnership(admin, anyArtwork, 'artwork:delete')).toBe(true);
        });

        test('소유권이 필요 없는 권한', () => {
            const user = { id: 1, role: 'SKKU_MEMBER' };
            const artwork = { userId: 2 };

            // 읽기 권한은 소유권과 관계없이 허용
            expect(rbacService.checkOwnership(user, artwork, 'artwork:read')).toBe(true);
            expect(rbacService.checkOwnership(user, artwork, 'exhibition:read')).toBe(true);
        });
    });

    test.describe('미들웨어 생성', () => {
        test('권한 기반 미들웨어 생성', () => {
            const middleware = rbacService.createPermissionMiddleware('artwork:create');

            expect(typeof middleware).toBe('function');
        });

        test('여러 권한 기반 미들웨어 생성', () => {
            const middleware = rbacService.createPermissionMiddleware(['artwork:create', 'artwork:update']);

            expect(typeof middleware).toBe('function');
        });

        test('소유권 기반 미들웨어 생성', () => {
            const getResource = (req) => ({ userId: req.params.userId });
            const middleware = rbacService.createOwnershipMiddleware('artwork:update', getResource);

            expect(typeof middleware).toBe('function');
        });
    });

    test.describe('편의 메서드', () => {
        test('여러 권한 중 하나라도 가지고 있는지 확인', () => {
            expect(rbacService.hasAnyPermission('ADMIN', ['user:create', 'admin:panel'])).toBe(true);
            expect(rbacService.hasAnyPermission('SKKU_MEMBER', ['artwork:create', 'admin:panel'])).toBe(true);
            expect(rbacService.hasAnyPermission('EXTERNAL_MEMBER', ['artwork:create', 'admin:panel'])).toBe(false);
        });

        test('모든 권한을 가지고 있는지 확인', () => {
            expect(rbacService.hasAllPermissions('ADMIN', ['user:create', 'artwork:create'])).toBe(true);
            expect(rbacService.hasAllPermissions('SKKU_MEMBER', ['artwork:create', 'artwork:read'])).toBe(true);
            expect(rbacService.hasAllPermissions('SKKU_MEMBER', ['artwork:create', 'admin:panel'])).toBe(false);
        });

        test('모든 권한 목록 반환', () => {
            const allPermissions = rbacService.getAllPermissions();

            expect(allPermissions).toHaveProperty('USER_CREATE');
            expect(allPermissions).toHaveProperty('ARTWORK_CREATE');
            expect(allPermissions).toHaveProperty('ADMIN_PANEL');
        });
    });

    test.describe('계층적 권한', () => {
        test('상위 권한이 하위 권한을 포함', () => {
            // 관리자는 모든 권한을 가져야 함
            expect(rbacService.hasPermission('ADMIN', 'user:read')).toBe(true);
            expect(rbacService.hasPermission('ADMIN', 'artwork:read')).toBe(true);
            expect(rbacService.hasPermission('ADMIN', 'exhibition:read')).toBe(true);
        });

        test('하위 권한이 상위 권한을 포함하지 않음', () => {
            // 외부 멤버는 읽기만 가능하고 쓰기는 불가능
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'artwork:read')).toBe(true);
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'artwork:create')).toBe(false);
            expect(rbacService.hasPermission('EXTERNAL_MEMBER', 'artwork:update')).toBe(false);
        });
    });
});
