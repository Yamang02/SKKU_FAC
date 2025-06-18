---
description:
globs:
alwaysApply: false
---
# 도메인 아키텍처 및 명명 규칙

## **핵심 원칙**

**폴더 구조가 도메인을 구분하므로, 메서드명에서 도메인명을 중복하지 않는다.**

- 도메인 경계: 폴더 구조로 명확히 구분
- 메서드명: 모든 레이어에서 간결하고 일관성 있게
- 의존성 주입: 도메인 간 호출 시 명시적 구분

## **올바른 구조**

### ✅ **폴더 구조로 도메인 구분**

```
src/domain/user/
├── controller/api/UserApiController.js
├── service/UserService.js
└── repository/UserRepository.js

src/domain/artwork/
├── controller/api/ArtworkApiController.js
├── service/ArtworkService.js
└── repository/ArtworkRepository.js
```

### ✅ **일관된 메서드 명명**

```javascript
// UserApiController.js
class UserApiController {
    async getProfile(req, res) { }      // ✅ 간결
    async updateProfile(req, res) { }   // ✅ 간결
    async deleteAccount(req, res) { }   // ✅ 간결
    async register(req, res) { }        // ✅ 간결
    async login(req, res) { }           // ✅ 간결
}

// UserService.js
class UserService {
    async getProfile(userId) { }        // ✅ 간결
    async updateProfile(userId, data) { } // ✅ 간결
    async deleteAccount(userId) { }     // ✅ 간결
    async register(userData) { }        // ✅ 간결
    async authenticate(username, password) { } // ✅ 간결
}

// ArtworkApiController.js
class ArtworkApiController {
    async getArtwork(req, res) { }      // ✅ 간결
    async updateArtwork(req, res) { }   // ✅ 간결
    async deleteArtwork(req, res) { }   // ✅ 간결
    async createArtwork(req, res) { }   // ✅ 간결
}
```

### ✅ **도메인 간 호출**

```javascript
// UserService.js - 다른 도메인 서비스 호출
class UserService {
    constructor(artworkService, emailService) {
        this.artworkService = artworkService;  // 의존성 주입으로 명확히 구분
        this.emailService = emailService;
    }

    async linkUserToArtwork(userId, artworkId) {
        // 간결한 메서드명으로 호출 - 의존성 주입으로 이미 구분됨
        const artwork = await this.artworkService.getArtwork(artworkId);
        const user = await this.getProfile(userId);
        // ...
    }

    async sendWelcomeEmail(userId) {
        const user = await this.getProfile(userId);
        await this.emailService.sendEmail(user.email, 'welcome');
    }
}
```

## **❌ 잘못된 패턴들**

### **도메인명 중복**
```javascript
// ❌ 불필요한 도메인명 중복
class UserApiController {
    async getUserProfile(req, res) { }     // ❌ User가 중복
    async updateUserProfile(req, res) { }  // ❌ User가 중복
    async deleteUserAccount(req, res) { }  // ❌ User가 중복
}
```

### **메서드 매핑/별칭**
```javascript
// ❌ 불필요한 별칭 메서드
class UserApiController {
    async updateUserProfile(req, res) { /* 실제 구현 */ }

    // ❌ 별칭 메서드 - 복잡성만 증가
    async updateProfile(req, res) {
        return this.updateUserProfile(req, res);
    }
}
```

### **라우터에서 장황한 호출**
```javascript
// ❌ 라우터에서 장황한 메서드명
UserRouter.put('/me', (req, res) => {
    return userApiController.updateUserProfile(req, res);  // ❌ 장황함
});

// ✅ 간결한 호출
UserRouter.put('/me', (req, res) => {
    return userApiController.updateProfile(req, res);  // ✅ 간결
});
```

## **관리자 도메인 예외**

관리자 도메인은 **관리 대상**을 명시해야 하므로 예외적으로 대상을 포함:

```javascript
// UserAdminController.js - 사용자 관리
class UserAdminController {
    async getUserList(req, res) { }        // ✅ 관리 대상 명시 필요
    async updateUserStatus(req, res) { }   // ✅ 관리 대상 명시 필요
    async deleteUser(req, res) { }         // ✅ 관리 대상 명시 필요
}

// ArtworkAdminController.js - 작품 관리
class ArtworkAdminController {
    async getArtworkList(req, res) { }     // ✅ 관리 대상 명시 필요
    async approveArtwork(req, res) { }     // ✅ 관리 대상 명시 필요
    async deleteArtwork(req, res) { }      // ✅ 관리 대상 명시 필요
}
```

## **마이그레이션 가이드**

### **1단계: 컨트롤러 정리**
- 도메인명이 포함된 메서드명을 간결하게 변경
- 별칭 메서드 제거

### **2단계: 서비스 정리**
- 서비스 메서드명도 간결하게 변경
- 도메인 간 호출 시 의존성 주입 활용

### **3단계: 라우터 업데이트**
- 간결한 메서드명으로 호출 변경

### **4단계: 테스트 업데이트**
- 변경된 메서드명에 맞춰 테스트 수정

## **장점**

1. **일관성**: 모든 레이어에서 동일한 명명 규칙
2. **간결성**: 불필요한 도메인명 중복 제거
3. **명확성**: 폴더 구조와 의존성 주입으로 도메인 구분
4. **유지보수성**: 별칭 메서드나 매핑 불필요
5. **확장성**: 새로운 도메인 추가 시 일관된 패턴 적용

이 규칙을 따르면 코드가 더 간결하고 일관성 있으며, 불필요한 복잡성을 제거할 수 있습니다.
