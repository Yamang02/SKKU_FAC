# 🧪 SKKU 미술동아리 갤러리 테스트 가이드

## 📋 현재 테스트 구조

### 🎯 **실제 테스트 파일 현황**

```
tests/
├── 📂 e2e/                           # End-to-End 테스트
│   ├── auth/                         # 인증 관련 E2E 테스트
│   │   ├── auth-tests.spec.js        # 종합 인증 테스트 (14KB)
│   │   ├── signup-test.spec.js       # 상세 회원가입 테스트 (17KB)
│   │   ├── simple-signup-test.spec.js # 간단 회원가입 테스트 (3.2KB)
│   │   └── user-role-tests.spec.js   # 사용자 역할별 테스트 (14KB)
│   ├── artwork-tests.spec.js         # 작품 관리 E2E 테스트 (22KB)
│   ├── exhibition-tests.spec.js      # 전시회 관리 E2E 테스트 (25KB)
│   └── helpers/                      # 테스트 헬퍼 함수
│       └── test-helpers.js           # 공통 헬퍼 함수
├── 📂 unit/                          # 단위 테스트
│   └── middleware/                   # 미들웨어 단위 테스트
│       └── validation-middleware.spec.js # 검증 미들웨어 테스트
├── 📂 integration/                   # 통합 테스트
│   └── basic-functionality.spec.js   # 기본 기능 통합 테스트
└── 📂 docs/                          # 테스트 문서
    └── README.md                     # 이 파일
```

## 🚀 빠른 시작

### **일상적인 테스트 명령어**

```bash
# 전체 테스트 실행
npm test

# 브라우저 창 표시하며 실행
npm run test:headed

# 인터랙티브 UI로 실행
npm run test:ui

# 디버그 모드로 실행
npm run test:debug
```

### **도메인별 테스트**

```bash
# 인증 관련 테스트
npm run test:auth

# 작품 관련 테스트
npm run test:artwork

# 전시회 관련 테스트
npm run test:exhibition

# 검증 미들웨어 테스트
npm run test:validation

# 기본 기능 확인
npm run test:basic-check
```

### **회원가입 테스트 (세분화)**

```bash
# 전체 회원가입 테스트
npm run test:signup

# SKKU 사용자 회원가입만
npm run test:signup:skku

# 외부 사용자 회원가입만
npm run test:signup:external

# 사용자 역할별 테스트
npm run test:user-roles
```

### **중요도별 테스트**

```bash
# 핵심 기능 테스트 (빠른 확인)
npm run test:critical

# 회귀 테스트 (기본 기능 확인)
npm run test:regression

# 스모크 테스트 (향후 확장)
npm run test:smoke
```

## 🔧 개발 워크플로우 통합

### **1. 기능 개발 전**
```bash
# 현재 기능이 정상 작동하는지 확인
npm run test:basic-check
```

### **2. 기능 개발 중**
```bash
# 관련 도메인 테스트 실행
npm run test:auth        # 인증 관련 작업 시
npm run test:artwork     # 작품 관련 작업 시
npm run test:exhibition  # 전시회 관련 작업 시
```

### **3. 기능 개발 완료 후**
```bash
# 전체 회귀 테스트
npm run test:regression

# 핵심 기능 확인
npm run test:critical
```

## 📊 테스트 파일별 상세 정보

### **✅ 핵심 테스트 파일들**

#### 1. **인증 관련 테스트**
- **`auth-tests.spec.js`** (14KB) - 종합 인증 테스트
  - 회원가입 플로우 (SKKU/외부 사용자)
  - 로그인/로그아웃 기능
  - 프로필 관리
  - 세션 관리 및 보안 테스트

- **`signup-test.spec.js`** (17KB) - 상세 회원가입 테스트
  - 실제 폼 동작 테스트
  - API 요청/응답 모니터링
  - 클라이언트 사이드 검증
  - 역할별 필드 동작

- **`user-role-tests.spec.js`** (14KB) - 사용자 역할별 테스트
  - 관리자(ADMIN) 권한 테스트
  - SKKU 회원(SKKU_MEMBER) 권한 테스트
  - 외부 회원(EXTERNAL_MEMBER) 권한 테스트
  - 비로그인 사용자 제한 테스트

#### 2. **작품 관리 테스트**
- **`artwork-tests.spec.js`** (22KB) - 작품 관리 E2E 테스트
  - 작품 목록 및 검색 (U_10)
  - 작품 상세 보기 (U_20)
  - 작품 업로드 (U_30)
  - 작품 수정/삭제 (U_40)
  - 작품 공유 기능 (U_41)

#### 3. **전시회 관리 테스트**
- **`exhibition-tests.spec.js`** (25KB) - 전시회 관리 E2E 테스트
  - 전시회 목록 및 검색 (U_50)
  - 전시회 상세 보기 (U_60)
  - 전시회 작품 출품
  - 출품 취소 기능
  - 전시회 상태별 테스트

#### 4. **기본 기능 및 검증**
- **`basic-functionality.spec.js`** (14KB) - 기본 기능 통합 테스트
  - 홈페이지 및 네비게이션
  - API 엔드포인트 응답
  - 보안 헤더 확인
  - 404 오류 페이지
  - 반응형 디자인 기본 테스트

- **`validation-middleware.spec.js`** (20KB) - 검증 미들웨어 테스트
  - Task 5.1 구현 검증
  - 회원가입/로그인 검증
  - API 응답 형식 테스트
  - 보안 테스트 (SQL 인젝션, XSS)

## 🎯 테스트 전략

### **테스트 우선순위**

1. **🔴 Critical (필수)** - 매번 실행
   - `basic-functionality.spec.js`
   - `auth-tests.spec.js`

2. **🟡 Important (중요)** - 관련 기능 수정 시
   - `artwork-tests.spec.js`
   - `exhibition-tests.spec.js`
   - `validation-middleware.spec.js`

3. **🟢 Extended (확장)** - 전체 테스트 시
   - `signup-test.spec.js`
   - `user-role-tests.spec.js`

### **테스트 실행 시나리오**

#### **빠른 확인 (2-3분)**
```bash
npm run test:critical
```

#### **도메인별 확인 (5-10분)**
```bash
npm run test:auth && npm run test:artwork
```

#### **전체 확인 (15-20분)**
```bash
npm test
```

## 🧹 테스트 결과물 관리

### **테스트 결과물 위치**
```
test-results/
├── screenshots/          # 스크린샷 (실패/성공)
├── videos/               # 실패한 테스트 비디오
├── traces/               # Playwright 트레이스
└── reports/              # HTML/JSON 리포트
```

### **정리 명령어**
```bash
# 테스트 결과 리포트 열기
npm run test:report

# Playwright 브라우저 재설치
npm run test:install
```

## 🔍 문제 해결

### **테스트 실패 시**
1. `npm run test:report`로 상세 리포트 확인
2. `test-results/screenshots/` 에서 실패 스크린샷 확인
3. `test-results/videos/` 에서 실패 비디오 확인

### **테스트 환경 문제 시**
1. 서버가 실행 중인지 확인 (`npm start`)
2. 환경 변수 설정 확인
3. `npm run test:install` - Playwright 브라우저 재설치

## 📚 테스트 작성 가이드

### **새 테스트 추가 시**

1. **적절한 디렉토리 선택**
   - E2E 테스트: `tests/e2e/`
   - 단위 테스트: `tests/unit/`
   - 통합 테스트: `tests/integration/`

2. **헬퍼 함수 활용**
   ```javascript
   import {
       generateTestUser,
       loginUser,
       captureScreenshot,
       expectSuccessMessage
   } from './helpers/test-helpers.js';
   ```

3. **테스트 명명 규칙**
   - 파일명: `feature-name.spec.js`
   - 테스트명: 한국어로 명확하게 작성
   - 그룹화: `test.describe()` 활용

### **테스트 작성 예시**
```javascript
test.describe('새 기능 테스트', () => {
    test('기본 동작 확인', async ({ page }) => {
        await page.goto('/new-feature');
        await captureScreenshot(page, 'new-feature-page');

        // 테스트 로직
        await expect(page.locator('.feature-element')).toBeVisible();
    });
});
```

## 🎨 실제 프로젝트 구조 기반

이 테스트들은 다음 실제 프로젝트 구조를 기반으로 작성되었습니다:

- **기술 스택**: Node.js + Express.js + Sequelize + MySQL
- **인증**: 세션 기반 인증
- **스토리지**: Cloudinary (이미지)
- **템플릿**: EJS
- **검증**: Joi + 커스텀 미들웨어
- **사용자 역할**: `ADMIN`, `SKKU_MEMBER`, `EXTERNAL_MEMBER`

## 💡 팁

1. **개발 중에는** `npm run test:headed`를 사용해서 브라우저에서 직접 확인
2. **CI/CD에서는** `npm test`를 사용해서 헤드리스 모드로 실행
3. **디버깅 시에는** `npm run test:debug`를 사용해서 단계별 실행
4. **특정 기능 테스트** 시에는 도메인별 명령어 활용

---

**📞 문의사항이나 테스트 추가 요청이 있으시면 개발팀에 연락해주세요.**
