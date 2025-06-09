# E2E 회원가입 & 로그인 테스트

## 🎯 구조

```
tests/e2e/
├── auth/
│   ├── detailed-signup-behavior-test.spec.js  # 회원가입 테스트
│   └── login-examples.spec.js                 # 로그인 테스트 예시
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

# 로그인 테스트 실행
npx playwright test login-examples --headed

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

### 기본 로그인
```javascript
import { loginAsAdmin, loginAsSkkuMember, loginAsExternalMember } from '../helpers/simple-login.js';

// 관리자로 로그인
await loginAsAdmin(page);

// SKKU 멤버로 로그인
await loginAsSkkuMember(page);

// 외부 멤버로 로그인
await loginAsExternalMember(page);
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
import { getUsersByPermissionLevel } from '../fixtures/login-users.js';

const users = getUsersByPermissionLevel();
await loginAs(page, users.highest);  // 관리자
await loginAs(page, users.medium);   // SKKU 멤버
await loginAs(page, users.basic);    // 외부 멤버
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
