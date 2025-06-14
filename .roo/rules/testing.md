# 🧪 SKKU Gallery Testing Guide

## **프로젝트 특화 테스트 전략**

### **실제 테스트 구조**
# 🧪 SKKU Gallery Testing Guide

## **프로젝트 특화 테스트 전략**

### **실제 테스트 구조**
```
tests/
├── e2e/                              # E2E 테스트
│   ├── auth/                         # 인증 관련
│   │   ├── auth-tests.spec.js        # 종합 인증 테스트
│   │   ├── signup-test.spec.js       # 상세 회원가입 테스트
│   │   ├── simple-signup-test.spec.js # 간단 회원가입 테스트
│   │   └── user-role-tests.spec.js   # 사용자 역할별 테스트
│   ├── artwork-tests.spec.js         # 작품 관리 테스트
│   ├── exhibition-tests.spec.js      # 전시회 관리 테스트
│   └── helpers/test-helpers.js       # 공통 헬퍼 함수
├── unit/middleware/                  # 단위 테스트
│   └── validation-middleware.spec.js # 검증 미들웨어 테스트
└── integration/                      # 통합 테스트
    └── basic-functionality.spec.js   # 기본 기능 테스트
```

## **Pre-Test Analysis (MANDATORY)**

**🔍 코드 탐색 우선 원칙:**

1. **실제 구현 파일 확인**
   - `codebase_search`로 target 파일 위치 확인
   - `read_file`로 정확한 구조, 메서드, 의존성 파악
   - `grep_search`로 import/export 패턴과 메서드 시그니처 확인
   - 실제 파일 경로, 클래스명, 메서드명 검증

2. **SKKU Gallery 아키텍처 이해**
   - **도메인 구조**: `src/domain/{domain}/controller|service|model/`
   - **ESM 모듈**: 모든 파일이 `import/export` 사용
   - **상대 경로**: `../../../` 패턴으로 계층 구조 준수
   - **의존성 주입**: Constructor 매개변수와 DI 패턴 확인

3. **실제 vs 예상 구조 매핑**
   - 문서와 실제 구현 간 차이점 문서화
   - 실제 코드 구조 기반으로 테스트 계획 업데이트

**❌ 파일 구조, 메서드명, import 경로를 검증 없이 가정하지 말 것**

## **Playwright Test Configuration**

### **테스트 타입별 설정**
- **Unit Tests**: `playwright.unit.config.js` (웹서버 없음)
- **Integration Tests**: `playwright.integration.config.js` (웹서버 포트 3000)
- **E2E Tests**: `playwright.config.js` (전체 애플리케이션)

### **SKKU Gallery 특화 설정**
```javascript
import { test, expect } from '@playwright/test';
import Config from '../../../src/config/Config.js';

// 실제 프로젝트 import 경로 준수
const config = Config.getInstance();
const jwtConfig = config.getJwtConfig();
```

## **도메인별 테스트 매핑**

### **인증 도메인 (`src/domain/auth/`, `src/domain/user/`)**
```bash
# 기본 인증 테스트
npm run test:auth

# 상세 회원가입 테스트
npm run test:signup

# 사용자 역할별 테스트 (ADMIN, SKKU_MEMBER, EXTERNAL_MEMBER)
npm run test:user-roles

# 검증 미들웨어 테스트
npm run test:validation
```

### **작품 도메인 (`src/domain/artwork/`)**
```bash
# 작품 관리 기본 테스트
npm run test:artwork
```
**연관 기능**: Cloudinary 이미지 업로드, 이미지 최적화

### **전시회 도메인 (`src/domain/exhibition/`)**
```bash
# 전시회 관리 테스트
npm run test:exhibition
```
**연관 기능**: 작품 출품, 전시회 상태 관리

### **공통/인프라 (`src/common/`, `src/infrastructure/`)**
```bash
# 기본 시스템 기능
npm run test:basic-check

# 미들웨어 검증
npm run test:validation
```

## **SKKU Gallery 기술 스택 기반 테스트**

### **실제 기술 환경**
- **Backend**: Node.js + Express.js + Sequelize + MySQL
- **Frontend**: EJS + Vanilla JavaScript
- **인증**: 세션 기반 (express-session)
- **검증**: Joi + 커스텀 미들웨어
- **스토리지**: Cloudinary
- **사용자 역할**: `ADMIN`, `SKKU_MEMBER`, `EXTERNAL_MEMBER`

### **실제 라우트 패턴**
- **홈**: `/`
- **인증**: `/user/login`, `/user/new`, `/user/me`
- **작품**: `/artwork`, `/artwork/new`
- **전시회**: `/exhibition`
- **관리자**: `/admin/management/{domain}`

### **실제 CSS 클래스 (테스트용)**
- **페이지 제목**: `.page-title-user`
- **알림 메시지**: `.alert-success-user`, `.alert-danger-user`
- **작품 그리드**: `.artwork-grid`
- **전시회 목록**: `.exhibition-list`

## **Mock 전략 (SKKU Gallery 맞춤)**

### **Repository 패턴 Mocking**
```javascript
// ✅ DO: 실제 Repository 구조 기반 Mock
const mockArtworkRepository = {
    findById: async (id) => ({ id, title: 'Test Artwork' }),
    create: async (data) => ({ id: 1, ...data }),
    findByExhibitionId: async (exhibitionId) => []
};

// ✅ DO: Service 계층 의존성 주입 Mock
const artworkService = new ArtworkService({
    artworkRepository: mockArtworkRepository,
    imageService: mockImageService,
    config: mockConfig
});
```

### **인증/세션 Mocking**
```javascript
// 세션 기반 인증 Mock
const mockSession = {
    userId: 'test-user-id',
    userRole: 'SKKU_MEMBER',
    isAuthenticated: true
};

// JWT 하이브리드 Mock (실제 구현 확인 후)
const mockJwtToken = 'mock.jwt.token';
```

## **Domain-Specific Testing Patterns**

### **User Domain Testing**
```javascript
// 실제 UserService 구조 기반
import UserService from '../../src/domain/user/service/UserService.js';
import UserRequestDto from '../../src/domain/user/model/dto/UserRequestDto.js';

test('사용자 생성 테스트', async () => {
    const userRequest = new UserRequestDto({
        username: 'testuser',
        email: 'test@skku.edu',
        password: 'securePassword123',
        role: 'SKKU_MEMBER'
    });

    const result = await userService.createUser(userRequest);
    expect(result.username).toBe('testuser');
});
```

### **Artwork Domain Testing**
```javascript
// Cloudinary 통합 Mock
const mockCloudinaryUpload = {
    public_id: 'test-artwork-image',
    secure_url: 'https://res.cloudinary.com/test/image.jpg'
};

test('작품 이미지 업로드 테스트', async () => {
    // 실제 ArtworkService 메서드 구조 확인 후 작성
});
```

### **Exhibition Domain Testing**
```javascript
// 전시회-작품 관계 테스트
test('전시회 작품 출품 테스트', async () => {
    // ArtworkExhibitionRelationshipRepository 구조 기반
});
```

## **Test Helper Functions (실제 프로젝트 맞춤)**

```javascript
// tests/e2e/helpers/test-helpers.js 활용
import {
    generateTestUser,
    loginUser,
    captureScreenshot,
    expectSuccessMessage
} from '../helpers/test-helpers.js';

// SKKU Gallery 특화 헬퍼
export const createTestArtwork = async (page, artworkData) => {
    // 실제 작품 생성 폼 구조 기반
};

export const createTestExhibition = async (page, exhibitionData) => {
    // 실제 전시회 생성 폼 구조 기반
};
```

## **TaskMaster Integration Workflow**

### **개발 전 테스트 (Pre-Development)**
```bash
# 기본 기능 확인
npm run test:basic-check

# 도메인별 확인 (작업할 도메인에 따라)
npm run test:auth        # 인증 관련 작업 시
npm run test:artwork     # 작품 관련 작업 시
npm run test:exhibition  # 전시회 관련 작업 시
```

### **개발 중 테스트 (During Development)**
```bash
# 실시간 확인 (headless 모드 해제)
npm run test:auth -- --headed

# 특정 기능 테스트
npm run test:validation  # 미들웨어 수정 시
```

### **개발 후 테스트 (Post-Development)**
```bash
# 핵심 기능 확인
npm run test:critical

# 회귀 테스트
npm run test:regression

# 전체 테스트
npm test
```

## **테스트 우선순위**

### **🔴 Critical (매번 실행)**
- `basic-functionality.spec.js` - 시스템 기본 동작
- `auth-tests.spec.js` - 인증 핵심 기능

### **🟡 Important (관련 기능 수정 시)**
- `artwork-tests.spec.js` - 작품 관리
- `exhibition-tests.spec.js` - 전시회 관리
- `validation-middleware.spec.js` - 입력 검증

### **🟢 Extended (전체 테스트 시)**
- `signup-test.spec.js` - 상세 회원가입 플로우
- `user-role-tests.spec.js` - 역할별 권한 테스트

## **Common Pitfalls & SKKU Gallery Solutions**

### **❌ 피해야 할 패턴**
```javascript
// ❌ DON'T: Playwright에 없는 함수 사용
const mockFn = test.fn(); // test.fn()은 존재하지 않음

// ❌ DON'T: 실제와 다른 구조 가정
import SomeService from './wrong/path/SomeService.js';
```

### **✅ 권장 패턴**
```javascript
// ✅ DO: 간단한 객체/함수 Mock
const mockFunction = async (param) => ({ result: 'mocked' });

// ✅ DO: 실제 import 경로 사용
import UserService from '../../../src/domain/user/service/UserService.js';
```

## **Port Management & Environment**

### **테스트 서버 포트 설정**
- **Unit Tests**: 서버 불필요
- **Integration Tests**: 포트 3000
- **E2E Tests**: 전체 애플리케이션 서버

### **환경 변수 설정**
```javascript
// Config.js 활용
const config = Config.getInstance();
const testConfig = config.getTestConfig();
```

## **Debugging & Troubleshooting**

### **테스트 실패 시 진단**
1. `npm run test:report` - HTML 리포트 확인
2. `test-results/screenshots/` - 스크린샷 확인
3. `npm run test:debug` - 디버그 모드 실행

### **실제 프로젝트 구조 확인**
1. `codebase_search` - 파일 위치 확인
2. `read_file` - 실제 구현 확인
3. `grep_search` - 패턴 및 의존성 확인

---

**💡 핵심 원칙**: 가정하지 말고 확인하라. SKKU Gallery의 실제 구조와 구현을 기반으로 테스트를 작성하라.

# 테스트 실행 규칙

## **도커 환경 필수**
- **모든 테스트는 도커 환경에서 실행**
- 로컬 환경에서 직접 테스트 실행 금지
- 일관된 테스트 환경 보장을 위한 필수 사항

## **도커 테스트 명령어**
```bash
# ✅ DO: 도커로 테스트 실행
docker-compose up --build test-env

# ✅ DO: 특정 테스트 실행
docker-compose run --rm test-env npm run test:login

# ❌ DON'T: 로컬에서 직접 실행
npm run test:login
npm test
playwright test
```

## **환경 일관성**
- **Node.js 버전**: 도커 이미지의 고정 버전 사용
- **데이터베이스**: 도커 컴포즈로 격리된 테스트 DB 사용
- **의존성**: package-lock.json 기반 정확한 버전 설치
- **환경 변수**: .env.test 파일 자동 로드

## **테스트 격리**
- 각 테스트 실행 시 독립된 컨테이너 사용
- 테스트 간 데이터 오염 방지
- 캐시 및 세션 상태 격리

## **성능 최적화**
- 도커 이미지 레이어 캐싱 활용
- 멀티 스테이지 빌드로 테스트 전용 이미지 구성
- 필요한 서비스만 시작하여 리소스 절약

## **CI/CD 연동**
- Railway 배포 전 도커 테스트 통과 필수
- GitHub Actions에서 동일한 도커 환경 사용
- 로컬 개발자 환경과 CI 환경 일치
