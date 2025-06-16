# DTO 기반 검증 미들웨어 시스템

이 문서는 SKKU Fine Art Club Gallery 프로젝트의 새로운 DTO 기반 검증 미들웨어
시스템에 대한 사용법을 설명합니다.

## 📋 개요

새로운 검증 시스템은 다음과 같은 구조로 구성되어 있습니다:

- **BaseDto**: 모든 DTO의 기본 클래스
- **Domain DTOs**: 각 도메인별 요청/응답 DTO 클래스
- **dtoValidation.js**: 핵심 검증 미들웨어 함수들
- **domainValidation.js**: 도메인별 검증 미들웨어 모음
- **validation.js**: 기존 Joi 기반 검증 (호환성 유지)

## 🚀 기본 사용법

### 1. 단일 DTO 검증

```javascript
import { UserValidation } from '../common/middleware/domainValidation.js';

// 라우터에서 사용
router.post(
    '/register',
    UserValidation.validateRegister, // DTO 검증 미들웨어
    userController.register
);

// 컨트롤러에서 검증된 DTO 사용
export const register = async (req, res) => {
    // req.userDto에 검증된 UserRequestDto 인스턴스가 첨부됨
    const userData = req.userDto.toPlainObject();

    // 또는 검증된 데이터 직접 사용
    const { username, email, password } = req.body; // 이미 검증됨

    // 비즈니스 로직 처리...
};
```

### 2. 다중 검증 조합

```javascript
import { validateMultiple } from '../common/middleware/dtoValidation.js';
import UserRequestDto from '../../domain/user/model/dto/UserRequestDto.js';
import { validateFiles } from '../common/middleware/dtoValidation.js';

// 사용자 등록 + 프로필 이미지 업로드
const validateUserWithProfile = validateMultiple([
    {
        DtoClass: UserRequestDto,
        schemaMethod: UserRequestDto.registerSchema,
        source: 'body',
        dtoProperty: 'userDto',
    },
]);

router.post(
    '/register-with-profile',
    upload.single('profileImage'), // multer 미들웨어
    validateFiles({
        // 파일 검증
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        required: false,
    }),
    validateUserWithProfile, // DTO 검증
    userController.registerWithProfile
);
```

### 3. 조건부 검증

```javascript
import { validateIf } from '../common/middleware/dtoValidation.js';
import { AdminValidation } from '../common/middleware/domainValidation.js';

// 관리자만 접근 가능한 기능
const validateAdminUpdate = validateIf(
    req => req.user && req.user.role === 'ADMIN',
    AdminValidation.validateUserManagementUpdate
);

router.put(
    '/admin/users/:id',
    authMiddleware, // 인증 확인
    validateAdminUpdate, // 관리자 권한 + DTO 검증
    adminController.updateUser
);
```

## 📚 도메인별 검증 미들웨어

### User Domain

```javascript
import { UserValidation } from '../common/middleware/domainValidation.js';

// 사용 가능한 검증 미들웨어
UserValidation.validateRegister; // 사용자 등록
UserValidation.validateLogin; // 로그인
UserValidation.validateUpdateProfile; // 프로필 업데이트
UserValidation.validateEmailQuery; // 이메일 쿼리 (query params)
UserValidation.validateResetPassword; // 비밀번호 재설정
```

### Artwork Domain

```javascript
import { ArtworkValidation } from '../common/middleware/domainValidation.js';

ArtworkValidation.validateCreate; // 작품 생성
ArtworkValidation.validateUpdate; // 작품 업데이트
ArtworkValidation.validateListQuery; // 작품 목록 쿼리
```

### Exhibition Domain

```javascript
import { ExhibitionValidation } from '../common/middleware/domainValidation.js';

ExhibitionValidation.validateCreate; // 전시회 생성
ExhibitionValidation.validateUpdate; // 전시회 업데이트
ExhibitionValidation.validateListQuery; // 전시회 목록 쿼리
```

### Auth Domain

```javascript
import { AuthValidation } from '../common/middleware/domainValidation.js';

AuthValidation.validatePasswordResetRequest; // 비밀번호 재설정 요청
AuthValidation.validatePasswordReset; // 비밀번호 재설정
AuthValidation.validateTokenVerification; // 토큰 검증
AuthValidation.validateJwtLogin; // JWT 로그인
AuthValidation.validateJwtRefresh; // JWT 토큰 갱신
AuthValidation.validateEmailVerification; // 이메일 인증
```

### Admin Domain

```javascript
import { AdminValidation } from '../common/middleware/domainValidation.js';

AdminValidation.validateUserManagementUpdate; // 사용자 관리
AdminValidation.validateArtworkManagementUpdate; // 작품 관리
AdminValidation.validateExhibitionManagementUpdate; // 전시회 관리
AdminValidation.validateSystemSettingsUpdate; // 시스템 설정
AdminValidation.validateListFilter; // 목록 필터
AdminValidation.validatePasswordReset; // 비밀번호 초기화
```

## 🔧 고급 사용법

### 1. 커스텀 검증 미들웨어 생성

```javascript
import { validateWithDto } from '../common/middleware/dtoValidation.js';
import CustomDto from './CustomDto.js';

const validateCustomData = validateWithDto(CustomDto, CustomDto.customSchema, {
    source: 'body', // 'body', 'query', 'params'
    attachDto: true, // DTO 인스턴스를 req에 첨부할지 여부
    dtoProperty: 'customDto', // req에 첨부될 속성명
    validationOptions: {
        // Joi 검증 옵션
        allowUnknown: true,
        stripUnknown: true,
    },
});
```

### 2. 응답 검증 (개발 환경)

```javascript
import { validateResponse } from '../common/middleware/dtoValidation.js';
import UserResponseDto from '../../domain/user/model/dto/UserResponseDto.js';

// 개발 환경에서만 응답 검증
router.get(
    '/users/:id',
    validateResponse(UserResponseDto, UserResponseDto.responseSchema, {
        enabled: process.env.NODE_ENV !== 'production',
        logOnly: true, // 에러 발생 시 로그만 남기고 정상 응답
    }),
    userController.getUser
);
```

### 3. 파일 업로드 검증

```javascript
import { validateFiles } from '../common/middleware/dtoValidation.js';

// 이미지 파일 검증
const validateImageUpload = validateFiles({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles: 5, // 최대 5개 파일
    required: true, // 파일 업로드 필수
});

router.post(
    '/artworks',
    upload.array('images', 5), // multer 설정
    validateImageUpload, // 파일 검증
    ArtworkValidation.validateCreate, // DTO 검증
    artworkController.create
);
```

## 🔄 기존 시스템과의 호환성

기존 `validation.js`의 미들웨어들은 계속 사용할 수 있습니다:

```javascript
// 기존 방식 (계속 지원됨)
import { UserValidationMiddleware } from '../common/middleware/validation.js';

router.post(
    '/legacy-register',
    UserValidationMiddleware.validateRegister,
    userController.register
);

// 새로운 방식
import { UserValidation } from '../common/middleware/domainValidation.js';

router.post(
    '/new-register',
    UserValidation.validateRegister,
    userController.register
);
```

## 🐛 에러 처리

검증 실패 시 표준 ApiResponse 형식으로 에러가 반환됩니다:

```json
{
    "success": false,
    "message": "사용자명은 최소 3자 이상이어야 합니다, 이메일은 필수 입력 항목입니다",
    "data": null,
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📝 로깅

모든 검증 과정은 자동으로 로깅됩니다:

- **성공**: DEBUG 레벨로 검증 성공 정보
- **실패**: WARN 레벨로 검증 실패 상세 정보
- **에러**: ERROR 레벨로 시스템 오류 정보

## 🎯 모범 사례

### 1. DTO 인스턴스 활용

```javascript
export const createArtwork = async (req, res) => {
    // DTO 인스턴스 사용 (권장)
    const artworkDto = req.artworkDto;

    // 필요한 필드만 추출
    const publicData = artworkDto.pick(['title', 'description', 'medium']);

    // 민감한 정보 제외
    const safeData = artworkDto.omit(['internalNotes']);

    // 다른 데이터와 병합
    const finalData = artworkDto.merge({ createdBy: req.user.id });

    // 비즈니스 로직...
};
```

### 2. 조건부 검증 활용

```javascript
// 사용자 역할에 따른 다른 검증
const validateBasedOnRole = validateIf(
    req => req.user.role === 'ADMIN',
    AdminValidation.validateUserManagementUpdate
);

// 요청 메서드에 따른 다른 검증
const validateBasedOnMethod = validateIf(
    req => req.method === 'POST',
    ArtworkValidation.validateCreate
);
```

### 3. 에러 처리 커스터마이징

```javascript
// 커스텀 에러 처리가 필요한 경우
const customValidationMiddleware = (req, res, next) => {
    const dto = new UserRequestDto(req.body);
    const result = dto.validateWithSchema(UserRequestDto.registerSchema());

    if (!result.isValid) {
        // 커스텀 에러 응답
        return res.status(422).json({
            error: 'VALIDATION_FAILED',
            details: result.errors,
            suggestions: [
                '사용자명을 확인해주세요',
                '이메일 형식을 확인해주세요',
            ],
        });
    }

    req.userDto = new UserRequestDto(result.value);
    next();
};
```

## 🔍 디버깅 팁

1. **검증 로그 확인**: `TASKMASTER_LOG_LEVEL=debug`로 상세 로그 확인
2. **DTO 상태 확인**: `req.dto.isValid()`, `req.dto.getValidationErrors()` 사용
3. **스키마 테스트**: 개별 스키마를 직접 테스트하여 문제 파악

이 시스템을 통해 더 안전하고 일관된 API 검증을 구현할 수 있습니다.
