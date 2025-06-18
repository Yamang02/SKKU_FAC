---
description:
globs:
alwaysApply: false
---
# 도메인 구조에서 RBAC 적용 가이드

## **RBAC 적용 레이어**

### **1. 라우터 레이어 (Route-Level Authorization)**
가장 외부에서 접근을 제어하는 첫 번째 방어선

```javascript
// UserRouter.js
import { hasPermission, canManageUsers, canWriteUsers } from '#common/middleware/auth.js';
import { rbacService } from '#domain/auth/service/rbacService.js';

// ✅ 라우터에서 권한 체크
UserRouter.get('/admin/users',
    isAuthenticated,
    canManageUsers(),  // ADMIN_USERS 권한 필요
    (req, res) => userAdminController.getUserList(req, res)
);

UserRouter.put('/admin/users/:id',
    isAuthenticated,
    canWriteUsers(),  // ADMIN_USER_WRITE 권한 필요
    (req, res) => userAdminController.updateUser(req, res)
);

// 개인 프로필은 본인만 수정 가능
UserRouter.put('/me',
    isAuthenticated,
    hasPermission(rbacService.permissions.USER_UPDATE),
    (req, res) => userApiController.updateProfile(req, res)
);
```

### **2. 컨트롤러 레이어 (Controller-Level Authorization)**
비즈니스 로직 실행 전 세밀한 권한 체크

```javascript
// UserApiController.js
import { rbacService } from '#domain/auth/service/rbacService.js';

class UserApiController {
    constructor(userService, rbacService) {
        this.userService = userService;
        this.rbacService = rbacService;
    }

    async updateProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const targetUserId = req.params.id || userId;

            // ✅ 컨트롤러에서 소유권 체크
            if (!this.canModifyUser(req.session.user, targetUserId)) {
                return res.status(403).json(ApiResponse.error('권한이 없습니다.'));
            }

            const updatedUser = await this.userService.updateProfile(targetUserId, req.body);
            return res.json(ApiResponse.success(updatedUser));
        } catch (error) {
            // 에러 처리
        }
    }

    // ✅ 권한 체크 헬퍼 메서드
    canModifyUser(currentUser, targetUserId) {
        // 본인 수정은 항상 허용
        if (currentUser.id === targetUserId) {
            return this.rbacService.hasPermission(currentUser.role, 'user:update');
        }

        // 다른 사용자 수정은 관리자 권한 필요
        return this.rbacService.hasPermission(currentUser.role, 'admin:users');
    }
}
```

### **3. 서비스 레이어 (Business Logic Authorization)**
비즈니스 규칙에 따른 권한 체크

```javascript
// UserService.js
class UserService {
    constructor(userRepository, rbacService) {
        this.userRepository = userRepository;
        this.rbacService = rbacService;
    }

    async updateProfile(userId, userData, currentUser) {
        // ✅ 서비스에서 비즈니스 규칙 체크
        if (!this.canUpdateUserData(currentUser, userId, userData)) {
            throw new UserAuthError('해당 데이터를 수정할 권한이 없습니다.');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        // 역할별 수정 가능한 필드 제한
        const allowedFields = this.getAllowedUpdateFields(currentUser.role, userId === currentUser.id);
        const filteredData = this.filterUpdateData(userData, allowedFields);

        return await this.userRepository.updateProfile({ ...user, ...filteredData });
    }

    // ✅ 역할별 수정 가능한 필드 정의
    getAllowedUpdateFields(userRole, isOwner) {
        const baseFields = ['name'];

        if (isOwner) {
            baseFields.push('email', 'password');
        }

        if (this.rbacService.hasPermission(userRole, 'admin:users')) {
            baseFields.push('role', 'status', 'isActive');
        }

        return baseFields;
    }

    canUpdateUserData(currentUser, targetUserId, userData) {
        // 본인 데이터 수정
        if (currentUser.id === targetUserId) {
            return this.rbacService.hasPermission(currentUser.role, 'user:update');
        }

        // 다른 사용자 데이터 수정 (관리자만)
        if (this.rbacService.hasPermission(currentUser.role, 'admin:users')) {
            // 관리자도 다른 관리자의 역할은 변경할 수 없음
            if (userData.role && !this.canChangeRole(currentUser.role, userData.role)) {
                return false;
            }
            return true;
        }

        return false;
    }
}
```

## **도메인별 RBAC 패턴**

### **User 도메인**
```javascript
// 권한 정의
const USER_PERMISSIONS = {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    VIEW_DETAILS: 'user:view_details',
    MANAGE_ROLES: 'user:manage_roles'
};

// 라우터에서 적용
UserRouter.post('/', hasPermission(USER_PERMISSIONS.CREATE));
UserRouter.get('/:id', hasPermission(USER_PERMISSIONS.READ));
UserRouter.put('/:id', hasPermission(USER_PERMISSIONS.UPDATE));
UserRouter.delete('/:id', hasPermission(USER_PERMISSIONS.DELETE));
```

### **Artwork 도메인**
```javascript
// 권한 정의
const ARTWORK_PERMISSIONS = {
    CREATE: 'artwork:create',
    READ: 'artwork:read',
    UPDATE: 'artwork:update',
    DELETE: 'artwork:delete',
    PUBLISH: 'artwork:publish',
    MODERATE: 'artwork:moderate'
};

// 소유권 기반 권한 체크
class ArtworkApiController {
    async updateArtwork(req, res) {
        const artworkId = req.params.id;
        const currentUser = req.session.user;

        // 작품 소유자이거나 관리자 권한 필요
        const artwork = await this.artworkService.getArtwork(artworkId);

        if (artwork.userId !== currentUser.id &&
            !this.rbacService.hasPermission(currentUser.role, 'admin:content')) {
            return res.status(403).json(ApiResponse.error('권한이 없습니다.'));
        }

        // 업데이트 진행
    }
}
```

### **Exhibition 도메인**
```javascript
// 전시회 상태별 권한 체크
class ExhibitionService {
    async updateExhibition(exhibitionId, updateData, currentUser) {
        const exhibition = await this.exhibitionRepository.findById(exhibitionId);

        // 전시회 상태에 따른 권한 체크
        if (exhibition.status === 'PUBLISHED') {
            if (!this.rbacService.hasPermission(currentUser.role, 'exhibition:moderate')) {
                throw new ExhibitionAuthError('게시된 전시회는 관리자만 수정할 수 있습니다.');
            }
        }

        return await this.exhibitionRepository.update(exhibitionId, updateData);
    }
}
```

## **RBAC 미들웨어 확장**

### **도메인별 권한 미들웨어**
```javascript
// auth.js에 도메인별 미들웨어 추가

// User 도메인
export const canCreateUser = () => hasPermission(rbacService.permissions.USER_CREATE);
export const canUpdateUser = () => hasPermission(rbacService.permissions.USER_UPDATE);
export const canDeleteUser = () => hasPermission(rbacService.permissions.USER_DELETE);

// Artwork 도메인
export const canCreateArtwork = () => hasPermission(rbacService.permissions.ARTWORK_CREATE);
export const canModerateArtwork = () => hasPermission(rbacService.permissions.ARTWORK_MODERATE);

// Exhibition 도메인
export const canCreateExhibition = () => hasPermission(rbacService.permissions.EXHIBITION_CREATE);
export const canPublishExhibition = () => hasPermission(rbacService.permissions.EXHIBITION_PUBLISH);

// 소유권 기반 권한 체크
export const canModifyOwnResource = (resourceType) => {
    return async (req, res, next) => {
        const currentUser = req.session.user;
        const resourceId = req.params.id;

        // 리소스 소유자 확인 로직
        const isOwner = await checkResourceOwnership(resourceType, resourceId, currentUser.id);
        const hasAdminPermission = rbacService.hasPermission(currentUser.role, `admin:${resourceType}`);

        if (!isOwner && !hasAdminPermission) {
            return res.status(403).json(ApiResponse.error('권한이 없습니다.'));
        }

        next();
    };
};
```

## **권한 체크 헬퍼 유틸리티**

```javascript
// RBACHelper.js
export class RBACHelper {
    static canAccessResource(user, resource, action) {
        const permission = `${resource}:${action}`;
        return rbacService.hasPermission(user.role, permission);
    }

    static canModifyOwnResource(user, resource, resourceOwnerId) {
        return user.id === resourceOwnerId ||
               rbacService.hasPermission(user.role, `admin:${resource}`);
    }

    static filterDataByPermission(user, data, fieldPermissions) {
        const result = {};

        for (const [field, permission] of Object.entries(fieldPermissions)) {
            if (rbacService.hasPermission(user.role, permission)) {
                result[field] = data[field];
            }
        }

        return result;
    }
}
```

## **베스트 프랙티스**

### **1. 다층 방어 (Defense in Depth)**
- 라우터 → 컨트롤러 → 서비스 각 레이어에서 권한 체크
- 각 레이어마다 다른 관점의 권한 검증

### **2. 최소 권한 원칙 (Principle of Least Privilege)**
- 필요한 최소한의 권한만 부여
- 기본적으로 접근 거부, 명시적 허용

### **3. 소유권 기반 접근 제어**
- 리소스 소유자는 자신의 리소스에 대한 권한 보유
- 관리자는 모든 리소스에 대한 권한 보유

### **4. 동적 권한 체크**
- 리소스 상태에 따른 동적 권한 변경
- 컨텍스트 기반 접근 제어

이러한 구조로 각 도메인이 독립적이면서도 일관된 보안 정책을 적용할 수 있습니다.
