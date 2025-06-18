---
description:
globs:
alwaysApply: false
---
# RBAC 권한 그룹화 시스템

## **개요**

실제 프로젝트 구조에 맞게 권한 시스템을 단순화했습니다:
- **3개 역할**: ADMIN, SKKU_MEMBER, EXTERNAL_MEMBER
- **6개 권한 그룹**: 논리적으로 관련된 권한들을 그룹화
- **90% 복잡성 감소**: 기존 6개 역할 + 60개 개별 권한 → 3개 역할 + 6개 그룹

## **권한 그룹 구조**

### **공개 접근 권한**
- **`PUBLIC_ACCESS`**: 비로그인 사용자도 접근 가능 (4개 권한)
  - `artwork:read`, `artwork:view_details`
  - `exhibition:read`, `exhibition:view_details`

### **회원 권한**
- **`MEMBER_BASIC`**: SKKU_MEMBER, EXTERNAL_MEMBER 공통 권한 (6개 권한)
  - `user:read`, `user:update_own`
  - `artwork:create`, `artwork:update_own`, `artwork:delete_own`
  - `exhibition:submit_artwork`

### **관리자 권한**
- **`ADMIN_BASIC`**: 관리자 기본 권한 (3개 권한)
  - `admin:panel`, `admin:dashboard`, `admin:reports`
- **`USER_MANAGEMENT`**: 사용자 관리 권한 (8개 권한)
  - `user:read`, `user:view_details`, `user:create`, `user:update`, `user:delete`, `user:activate`, `user:deactivate`, `user:reset_password`
- **`CONTENT_MANAGEMENT`**: 컨텐츠 관리 권한 (11개 권한)
  - `artwork:update`, `artwork:delete`, `artwork:publish`, `artwork:feature`, `artwork:moderate`
  - `exhibition:create`, `exhibition:update`, `exhibition:delete`, `exhibition:publish`, `exhibition:feature`, `exhibition:moderate`
- **`SYSTEM_MANAGEMENT`**: 시스템 관리 권한 (4개 권한)
  - `system:config`, `system:logs`, `system:maintenance`, `system:backup`

## **역할별 권한 매핑**

```javascript
// 외부 회원 & SKKU 회원 (동일한 권한)
EXTERNAL_MEMBER: ['PUBLIC_ACCESS', 'MEMBER_BASIC'] // 10개 권한
SKKU_MEMBER: ['PUBLIC_ACCESS', 'MEMBER_BASIC']     // 10개 권한

// 관리자 (모든 권한)
ADMIN: [
    'PUBLIC_ACCESS',      // 4개 권한
    'MEMBER_BASIC',       // 6개 권한
    'ADMIN_BASIC',        // 3개 권한
    'USER_MANAGEMENT',    // 8개 권한
    'CONTENT_MANAGEMENT', // 11개 권한
    'SYSTEM_MANAGEMENT'   // 4개 권한
] // 총 35개 권한 (중복 제거)
```

## **사용법**

### **기본 미들웨어**
```javascript
// 공개 접근 (비로그인 사용자도 가능)
app.get('/artwork/list', allowPublicAccess(), controller.getArtworkList);

// 회원 권한 필요
app.post('/artwork/new', requireMemberAccess(), controller.createArtwork);

// 관리자 권한 필요
app.get('/admin/dashboard', requireAdminAccess(), controller.getDashboard);
```

### **권한 그룹 직접 사용**
```javascript
// 특정 권한 그룹 확인
app.get('/admin/users', hasPermissionGroup('USER_MANAGEMENT'), controller.getUsers);

// 여러 권한 그룹 중 하나
app.put('/content/:id', hasAnyPermissionGroup(['CONTENT_MANAGEMENT', 'ADMIN_BASIC']), controller.updateContent);
```

### **조합 미들웨어**
```javascript
// 작품 관련 - 공개 조회 또는 회원 생성
app.use('/artwork', artworkAccess());

// 관리자 또는 컨텐츠 관리자
app.use('/admin/content', adminOrContentManager());
```

## **주요 특징**

### **✅ 공개 접근 지원**
- 작품/전시회 조회는 비로그인 사용자도 가능
- `PUBLIC_ACCESS` 그룹으로 명시적 관리

### **✅ 회원 동등성**
- SKKU_MEMBER와 EXTERNAL_MEMBER는 동일한 권한
- 저장되는 정보만 다름 (department vs affiliation)

### **✅ 단순한 구조**
- 3개 역할, 6개 권한 그룹으로 단순화
- 명확한 권한 분리 (공개/회원/관리자)

### **✅ 하위 호환성**
- 기존 개별 권한 시스템과 호환
- 점진적 마이그레이션 가능

## **권한 체크 로직**

### **공개 접근 권한**
```javascript
// 모든 사용자(비로그인 포함)가 접근 가능
if (groupKey === 'PUBLIC_ACCESS') {
    return true;
}
```

### **로그인 필요 권한**
```javascript
// 로그인이 필요한 권한의 경우
if (!userRole) {
    return false; // 인증 필요
}

// ADMIN은 모든 권한 그룹 보유
if (userRole === UserRole.ADMIN) {
    return true;
}
```

### **소유권 체크**
```javascript
// 본인 리소스만 수정 가능한 권한들
const ownershipRequiredPermissions = [
    'artwork:update_own',
    'artwork:delete_own',
    'user:update_own'
];
```

## **마이그레이션 가이드**

### **기존 코드에서 변경사항**
```javascript
// ❌ 기존 방식
hasPermission(rbacService.permissions.USER_READ)

// ✅ 새로운 방식
requireMemberAccess()
// 또는
hasPermissionGroup('MEMBER_BASIC')
```

### **라우터 업데이트**
```javascript
// ❌ 기존
router.get('/api/me', isAuthenticated, hasPermission('USER_READ'), controller.getProfile);

// ✅ 개선
router.get('/api/me', isAuthenticated, requireMemberAccess(), controller.getProfile);
```

## **성능 최적화**

### **권한 그룹 캐싱**
- 권한 그룹 정보는 애플리케이션 시작 시 메모리에 로드
- 런타임에 권한 계산 없이 빠른 조회

### **미들웨어 최적화**
- 공개 접근 권한은 즉시 통과
- 불필요한 데이터베이스 조회 방지

## **보안 고려사항**

### **권한 상승 방지**
- 각 권한 그룹은 명확히 분리됨
- 관리자만 모든 권한 그룹 보유

### **소유권 검증**
- `*_own` 권한은 리소스 소유권 추가 검증 필요
- 컨트롤러 레이어에서 소유권 체크 구현

### **로깅 및 감사**
- 모든 권한 체크는 로그 기록
- 접근 거부 시 상세한 컨텍스트 정보 제공

---

**참고**: 이 시스템은 실제 프로젝트의 단순한 구조에 최적화되어 있습니다. 복잡한 권한 요구사항이 생기면 권한 그룹을 추가하여 확장할 수 있습니다.
