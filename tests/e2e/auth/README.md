# 사용자 행동 세분화 인증 테스트

이 디렉토리에는 회원가입과 로그인 과정에서 발생하는 사용자 행동을 세분화하여 테스트하는 파일들이 포함되어 있습니다.

## 테스트 파일 구조

### 1. `detailed-signup-behavior-test.spec.js`
회원가입 과정의 모든 사용자 행동을 단계별로 테스트합니다.

**테스트 단계:**
- **1단계**: 페이지 접근 및 초기 상태 확인
- **2단계**: 기본 정보 입력 과정 (사용자명, 이메일, 비밀번호)
- **3단계**: 역할 선택 및 동적 필드 표시
- **4단계**: 폼 유효성 검사 및 버튼 활성화
- **5단계**: 폼 제출 과정
- **6단계**: 오류 상황 처리
- **7단계**: 접근성 및 사용성 테스트

**주요 테스트 시나리오:**
- 실시간 폼 검증
- 비밀번호 표시/숨김 토글
- 역할별 필드 동적 표시
- 중복 제출 방지
- 서버/네트워크 오류 처리
- 키보드 네비게이션

### 2. `detailed-login-behavior-test.spec.js`
로그인 과정의 모든 사용자 행동을 단계별로 테스트합니다.

**테스트 단계:**
- **1단계**: 로그인 페이지 접근 및 초기 상태
- **2단계**: 사용자 입력 과정
- **3단계**: 폼 제출 및 인증 과정
- **4단계**: 오류 상황 처리
- **5단계**: 접근성 및 사용성 테스트
- **6단계**: 보안 관련 테스트

**주요 테스트 시나리오:**
- 유효/무효 자격 증명 처리
- Enter 키를 통한 폼 제출
- 중복 로그인 시도 방지
- SQL 인젝션/XSS 방어
- 모바일 반응형 테스트

## 테스트 실행 방법

### 전체 인증 테스트 실행
```bash
# 모든 인증 관련 테스트 실행
npx playwright test tests/e2e/auth/

# 특정 브라우저에서만 실행
npx playwright test tests/e2e/auth/ --project=chromium
```

### 개별 테스트 파일 실행
```bash
# 회원가입 세분화 테스트만 실행
npx playwright test tests/e2e/auth/detailed-signup-behavior-test.spec.js

# 로그인 세분화 테스트만 실행
npx playwright test tests/e2e/auth/detailed-login-behavior-test.spec.js
```

### 특정 테스트 그룹 실행
```bash
# 회원가입의 특정 단계만 테스트
npx playwright test tests/e2e/auth/detailed-signup-behavior-test.spec.js -g "1단계"

# 로그인의 보안 테스트만 실행
npx playwright test tests/e2e/auth/detailed-login-behavior-test.spec.js -g "보안"
```

### 헤드리스 모드 해제 (브라우저 UI 보기)
```bash
# 브라우저 창을 보면서 테스트 실행
npx playwright test tests/e2e/auth/detailed-signup-behavior-test.spec.js --headed

# 디버그 모드로 실행 (단계별 실행)
npx playwright test tests/e2e/auth/detailed-signup-behavior-test.spec.js --debug
```

## 테스트 결과 확인

### 스크린샷 및 리포트
테스트 실행 후 다음 위치에서 결과를 확인할 수 있습니다:

- **스크린샷**: `test-results/screenshots/`
- **HTML 리포트**: `playwright-report/`
- **테스트 결과**: `test-results/`

### 리포트 보기
```bash
# HTML 리포트 열기
npx playwright show-report
```

## 테스트 데이터

### 회원가입 테스트 데이터
- **SKKU 사용자**: 동적으로 생성되는 타임스탬프 기반 데이터
- **외부 사용자**: 동적으로 생성되는 타임스탬프 기반 데이터

### 로그인 테스트 데이터
- **유효한 사용자**: `testuser` / `Test123!@#`
- **무효한 사용자**: `nonexistentuser` / `WrongPassword123!`

## 주의사항

1. **서버 실행**: 테스트 실행 전에 애플리케이션 서버가 `http://localhost:3000`에서 실행 중이어야 합니다.

2. **데이터베이스**: 회원가입 테스트는 실제 데이터베이스에 데이터를 생성할 수 있으므로, 테스트용 데이터베이스를 사용하는 것을 권장합니다.

3. **네트워크 모킹**: 일부 테스트는 네트워크 요청을 모킹하여 오류 상황을 시뮬레이션합니다.

4. **타임아웃**: 네트워크 요청이나 페이지 로딩에 시간이 걸릴 수 있으므로, 적절한 대기 시간이 설정되어 있습니다.

## 테스트 확장

새로운 사용자 행동이나 시나리오를 추가하려면:

1. 해당 테스트 파일의 적절한 `test.describe` 블록에 새 테스트 추가
2. 필요한 경우 `beforeEach`에서 테스트 데이터 확장
3. 새로운 페이지나 기능의 경우 별도 테스트 파일 생성

## 문제 해결

### 일반적인 문제
- **타임아웃 오류**: 네트워크 상태나 서버 응답 시간 확인
- **요소를 찾을 수 없음**: 페이지 로딩 완료 후 요소 접근 확인
- **스크린샷 실패**: `test-results` 디렉토리 권한 확인

### 디버깅 팁
```bash
# 특정 테스트만 디버그 모드로 실행
npx playwright test -g "특정 테스트 이름" --debug

# 브라우저 개발자 도구와 함께 실행
npx playwright test --headed --slowMo=1000
```
