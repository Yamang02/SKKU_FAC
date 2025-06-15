# E2E 회원가입 & 로그인 테스트

## 🎯 구조

```
tests/e2e/
├── auth/
│   ├── detailed-signup-behavior-test.spec.js  # 회원가입 테스트
│   └── authentication.spec.js                 # 인증 기능 종합 테스트 (로그인/로그아웃)
├── user/
│   └── profile-management.spec.js             # 사용자 프로필 관리 테스트
├── fixtures/
│   └── login-users.js                         # 대표 사용자 데이터
├── helpers/
│   └── simple-login.js                        # 로그인 헬퍼 함수
└── README.md
```

## 🚀 실행

```bash
# 회원가입 테스트 실행
npm run test:signup

# 인증 기능 테스트 실행 (로그인/로그아웃)
npm run test:auth

# 모든 인증 테스트 실행
npx playwright test tests/e2e/auth --headed
```

## 👥 대표 사용자 계정

### 🔑 로그인 정보 (모든 계정 비밀번호: `1234`)

| 역할 | 사용자명 | 이메일 | 용도 |
|------|----------|--------|------|
| **ADMIN** | `skkfntclbdmnsttrt` | `skkfntclbdmnsttrt@gmail.com` | 관리자 기능 테스트 |
| **SKKU_MEMBER** | `duplicate1749455784069` | `duplicate1749455784069@skku.edu` | SKKU 멤버 기능 테스트 |
| **EXTERNAL_MEMBER** | `external1749455846376` | `external1749455846376@example.com` | 외부 멤버 기능 테스트 |

## 📚 사용법

### 기본 로그인 (헬퍼 함수 사용)
```javascript
import { loginAsAdmin, loginAsSkkuMember, loginAsExternalMember } from '../helpers/simple-login.js';

// 관리자로 로그인
await loginAsAdmin(page);

// SKKU 멤버로 로그인
await loginAsSkkuMember(page);

// 외부 멤버로 로그인
await loginAsExternalMember(page);
```

### 직접 사용자 데이터 사용
```javascript
import { AUTHENTICATION_TEST_USERS } from '../fixtures/login-users.js';

// 특정 사용자로 로그인
const user = AUTHENTICATION_TEST_USERS.ADMIN;
await page.goto('http://localhost:3001/user/login');
await page.fill('#username', user.username);
await page.fill('#password', user.password);
await page.locator('button[type="submit"]').click();
```

### 기능별 로그인
```javascript
import { loginForFeature } from '../helpers/simple-login.js';

// 관리자 패널 접근을 위한 로그인
await loginForFeature(page, 'admin_panel');

// 작품 업로드를 위한 로그인
await loginForFeature(page, 'skku_artwork_upload');

// 전시 보기를 위한 로그인
await loginForFeature(page, 'public_exhibition_view');
```

### 권한 테스트
```javascript
import { getUsersByPermissionLevel, getActiveAuthenticationUsers } from '../fixtures/login-users.js';

// 권한 레벨별 테스트
const users = getUsersByPermissionLevel();
await loginAs(page, users.highest);  // 관리자
await loginAs(page, users.medium);   // SKKU 멤버
await loginAs(page, users.basic);    // 외부 멤버

// 모든 활성 사용자 순차 테스트
const allUsers = getActiveAuthenticationUsers();
for (const user of allUsers) {
    await loginAs(page, user);
    // 테스트 수행
}
```

## 📊 생성되는 테스트 데이터 (회원가입 테스트)

### SKKU 멤버
- **사용자명**: `skkutest[타임스탬프]`
- **이메일**: `skkutest[타임스탬프]@g.skku.edu`
- **비밀번호**: `Test123!@#` → **활성화 후 `1234`**

### 외부 멤버
- **사용자명**: `external[타임스탬프]`
- **이메일**: `external[타임스탬프]@example.com`
- **비밀번호**: `Test123!@#` → **활성화 후 `1234`**

## 🔐 수동 활성화 (필요시)

```sql
-- 모든 테스트 사용자 활성화
UPDATE users
SET status = 'ACTIVE',
    emailVerified = true,
    password = '$2b$10$bO75YjH01ZSyT5Zh8a3mBeIcfiqQCQkNRCNrYcoyesPB2GyBgDgay'
WHERE username LIKE 'skkutest%'
   OR username LIKE 'external%'
   OR username LIKE 'duplicate%';
```

**활성화 후 로그인 가능**: 모든 계정 비밀번호 `1234`

## 테스트 가이드

이 디렉토리는 Playwright를 사용한 End-to-End 테스트를 포함합니다.

## 테스트 구조

### 디렉토리 구성
- `auth/` - 인증 관련 테스트
  - `detailed-signup-behavior-test.spec.js` - 회원가입 테스트
  - `authentication.spec.js` - 인증 기능 종합 테스트 (로그인/로그아웃/세션 관리)
- `user/` - 사용자 관리 테스트
  - `profile-management.spec.js` - 프로필 수정/계정 삭제 테스트
- `helpers/` - 테스트 헬퍼 함수
  - `simple-login.js` - 로그인/로그아웃 헬퍼
- `fixtures/` - 테스트 데이터
  - `login-users.js` - 테스트용 사용자 정보

## 사용자 프로필 관리 테스트

### 테스트 파일: `user/profile-management.spec.js`

이 테스트는 사용자 프로필 수정 및 계정 삭제 기능을 검증합니다.

#### 테스트 시나리오

**1. 프로필 수정 테스트**
- SKKU 멤버 프로필 수정 (이름, 학과, 학번, 동아리 회원 여부)
- 외부 멤버 프로필 수정 (이름, 소속 기관)

**2. 계정 삭제 테스트**
- SKKU 멤버 계정 삭제 및 재로그인 실패 확인
- 외부 멤버 계정 삭제 및 재로그인 실패 확인

#### 테스트 데이터 요구사항

테스트 실행 전 다음 사용자들이 데이터베이스에 존재해야 합니다:

**수정 테스트용 사용자:**
- `skku2` (SKKU 멤버) - 비밀번호: `1234`
- `external2` (외부 멤버) - 비밀번호: `1234`

**삭제 테스트용 사용자:**
- `skku1` (SKKU 멤버) - 비밀번호: `1234`
- `external1` (외부 멤버) - 비밀번호: `1234`

#### 데이터베이스 초기화

테스트 실행 전 다음 SQL 스크립트를 실행하세요:

```bash
# 기본 테스트 데이터 로드
mysql -u root -p skku_sfa_gallery_test < scripts/sql/db/test-init/00.dump_default_data.sql

# 수정/삭제 테스트용 추가 데이터 로드
mysql -u root -p skku_sfa_gallery_test < scripts/sql/db/test-init/01.user_modification_test_data.sql
```

## 테스트 실행

### 간단한 테스트 실행 (권장)
```bash
# 인증 관련 테스트 (로그인, 회원가입, 로그아웃)
npm run test:auth

# 사용자 관리 테스트 (프로필 수정, 계정 삭제)
npm run test:user

# 프로필 관리 테스트만 실행 (데이터 초기화 포함)
npm run test:profile
```

### 수동 테스트 실행
```bash
# 1. 테스트 환경 시작 (개발 환경과 완전 분리)
docker-compose up test-env mysql-test -d

# 2. 테스트 데이터 초기화
npm run test:init-data

# 3. 특정 테스트 실행
npx playwright test tests/e2e/user/profile-management.spec.js
npx playwright test tests/e2e/auth/authentication.spec.js
```

### 헤드리스 모드 해제 (브라우저 UI 보기)
```bash
npx playwright test --headed tests/e2e/user/profile-management.spec.js
```

### 디버그 모드
```bash
npx playwright test --debug tests/e2e/user/profile-management.spec.js
```

## 환경 설정

### Docker 환경
이 프로젝트는 Docker Compose를 사용하여 테스트 환경을 구성합니다:

```bash
# 테스트 환경 시작 (포트 3001에서 실행)
docker-compose up test-env -d

# 테스트 DB는 포트 3308에서 접근 가능
# 환경 변수는 docker-compose.yml에서 자동 설정됨
```

### Playwright 설정
`playwright.config.js` 파일에서 다음 설정을 확인하세요:
- 브라우저 설정 (Chrome, Firefox, Safari)
- 테스트 타임아웃 설정
- 스크린샷 및 비디오 녹화 설정

## 주의사항

### 테스트 환경
1. **Docker 기반**: `docker-compose up test-env -d`로 테스트 서버 시작
2. **포트 구성**: 테스트 서버는 `http://localhost:3001`, 테스트 DB는 `localhost:3308`
3. **데이터 초기화**: 각 테스트 실행 전 테스트 데이터를 초기화하는 것을 권장

### 사용자 수정/삭제 테스트 특이사항
1. **삭제 테스트**: 계정 삭제 테스트는 실제로 사용자를 삭제하므로 테스트 후 해당 계정은 복구되지 않음
2. **수정 테스트**: 프로필 수정 테스트는 실제 데이터를 변경하므로 테스트 후 원본 데이터로 복구 필요
3. **테스트 순서**: 삭제 테스트는 마지막에 실행하는 것을 권장

### 트러블슈팅

**로그인 실패**
- 테스트 사용자 계정이 데이터베이스에 존재하는지 확인
- 비밀번호가 올바른지 확인 (`1234`)
- 사용자 상태가 `ACTIVE`인지 확인

**요소를 찾을 수 없음**
- 프로필 페이지의 HTML 구조가 변경되었는지 확인
- CSS 선택자나 ID가 올바른지 확인
- 페이지 로딩이 완료되었는지 확인 (`waitForLoadState`)

**계정 삭제 버튼을 찾을 수 없음**
- 프로필 페이지에 계정 삭제 기능이 구현되어 있는지 확인
- 버튼의 텍스트나 클래스명이 테스트 코드와 일치하는지 확인

## 테스트 결과 확인

### 콘솔 출력
테스트 실행 시 각 단계별 진행 상황이 콘솔에 출력됩니다:
- 🔄 프로필 수정 테스트 진행 상황
- 🗑️ 계정 삭제 테스트 진행 상황
- ✅ 성공 메시지
- ❌ 실패 메시지

### 스크린샷 및 비디오
테스트 실패 시 자동으로 스크린샷과 비디오가 `test-results/` 디렉토리에 저장됩니다.

### 데이터베이스 확인
테스트 후 데이터베이스에서 직접 결과를 확인할 수 있습니다:

```sql
-- 수정된 사용자 확인
SELECT ua.username, ua.name,
       CASE WHEN ua.role = 'SKKU_MEMBER' THEN sup.department
            ELSE eup.affiliation END as profile_info
FROM user_accounts ua
LEFT JOIN skku_user_profiles sup ON ua.id = sup.user_id
LEFT JOIN external_user_profiles eup ON ua.id = eup.user_id
WHERE ua.username IN ('skku2', 'external2');

-- 삭제된 사용자 확인 (결과가 없어야 함)
SELECT * FROM user_accounts
WHERE username IN ('skku1', 'external1');
```
