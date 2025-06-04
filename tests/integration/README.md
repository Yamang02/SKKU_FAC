# 🧪 Integration Testing System

SKKU Fine Art Club Gallery 프로젝트의 통합 테스트 시스템입니다. Playwright와 Docker를 기반으로 한 포괄적인 API 및 E2E 테스트 환경을 제공합니다.

## 📋 목차

- [시스템 개요](#시스템-개요)
- [테스트 환경 설정](#테스트-환경-설정)
- [테스트 실행](#테스트-실행)
- [CI/CD 통합](#cicd-통합)
- [테스트 데이터 관리](#테스트-데이터-관리)
- [문제 해결](#문제-해결)

## 🎯 시스템 개요

### 주요 특징

- **Docker 기반 격리된 테스트 환경**: MySQL(3307), Redis(6380) 테스트 컨테이너
- **Playwright 통합**: API 테스트와 E2E 테스트 지원
- **자동 데이터 관리**: 테스트 데이터 시딩 및 정리 자동화
- **CI/CD 최적화**: GitHub Actions와 완전 통합
- **다중 환경 지원**: 로컬, Docker, CI/CD 환경

### 디렉토리 구조

```
tests/integration/
├── api/                    # API 통합 테스트
│   ├── auth.test.js       # 인증 API 테스트
│   ├── user.test.js       # 사용자 API 테스트
│   ├── exhibition.test.js # 전시회 API 테스트
│   ├── artwork.test.js    # 작품 API 테스트
│   └── health.test.js     # 헬스체크 테스트
├── e2e/                   # E2E 테스트 (향후 확장)
├── helpers/               # 테스트 헬퍼 유틸리티
│   ├── playwrightApiHelpers.js  # API 테스트 헬퍼
│   ├── dockerTestSetup.js       # Docker 환경 설정
│   ├── testDataSeeder.js        # 테스트 데이터 시딩
│   ├── testHooks.js             # Playwright 훅 시스템
│   ├── globalSetup.js           # 글로벌 설정
│   └── globalTeardown.js        # 글로벌 정리
├── fixtures/              # 테스트 데이터 픽스처
│   └── testData.js        # 테스트 데이터 정의
└── README.md              # 이 문서
```

## ⚙️ 테스트 환경 설정

### 1. 사전 요구사항

```bash
# Node.js 22.13.0 이상
node --version

# Docker 및 Docker Compose
docker --version
docker-compose --version

# 의존성 설치
npm install
```

### 2. Docker 테스트 환경 시작

```bash
# 테스트 컨테이너 시작
npm run docker:test

# 컨테이너 상태 확인
docker-compose ps
```

### 3. Playwright 브라우저 설치

```bash
# Playwright 브라우저 설치
npm run test:install
```

## 🚀 테스트 실행

### 로컬 환경에서 테스트

```bash
# 모든 통합 테스트 실행
npm run test:docker

# 특정 API 테스트 실행
npm run test:integration:docker:health    # 헬스체크만
npm run test:integration:docker:api       # API 테스트만

# 개별 테스트 파일 실행
npx playwright test tests/integration/api/user.test.js
```

### 테스트 옵션

```bash
# 헤드리스 모드 (기본)
npm run test:docker

# UI 모드로 실행
npx playwright test tests/integration/api/ --ui

# 디버그 모드
npx playwright test tests/integration/api/health.test.js --debug

# 특정 브라우저로 실행
npx playwright test --project=chromium
```

### 테스트 리포트

```bash
# HTML 리포트 보기
npm run test:report

# 실시간 리포트 (테스트 실행 중)
npx playwright test --reporter=html
```

## 🔄 CI/CD 통합

### GitHub Actions 워크플로우

프로젝트는 `.github/workflows/integration-tests.yml`에 정의된 포괄적인 CI/CD 파이프라인을 제공합니다.

#### 주요 작업 (Jobs)

1. **integration-tests**: 메인 통합 테스트
   - MySQL 8.0 및 Redis 7 서비스 컨테이너
   - 테스트 데이터베이스 자동 설정
   - 전체 API 테스트 스위트 실행
   - HTML 및 JSON 리포트 생성

2. **test-matrix**: 크로스 플랫폼 테스트
   - Ubuntu, Windows, macOS에서 실행
   - Node.js 20.x, 22.x 버전 매트릭스
   - 기본 헬스체크 테스트만 실행

3. **security-scan**: 보안 스캔
   - npm audit 실행
   - 의존성 취약점 검사

4. **performance-test**: 성능 테스트
   - 메인 브랜치 푸시 시에만 실행
   - 응답 시간 및 캐싱 테스트

#### CI/CD 전용 스크립트

```bash
# CI 환경에서 전체 테스트
npm run test:ci

# CI 환경에서 헬스체크만
npm run test:ci:health

# CI 환경에서 성능 테스트
npm run test:ci:performance

# CI 환경에서 보안 스캔
npm run test:ci:security

# CI 환경에서 전체 파이프라인
npm run test:ci:full
```

### 환경 변수 설정

CI/CD 환경에서는 다음 환경 변수들이 자동으로 설정됩니다:

```bash
NODE_ENV=test
CI=true
DB_HOST=localhost
DB_PORT=3307
REDIS_HOST=localhost
REDIS_PORT=6380
```

## 🗄️ 테스트 데이터 관리

### 테스트 훅 시스템

프로젝트는 유연한 테스트 훅 시스템을 제공합니다:

```javascript
// 완전한 테스트 환경 (모든 데이터 시딩)
import { setupFullTestEnvironment } from '../helpers/testHooks.js';
const testHooks = setupFullTestEnvironment();

// 사용자 데이터만 시딩
import { setupUserOnlyTestEnvironment } from '../helpers/testHooks.js';
const testHooks = setupUserOnlyTestEnvironment();

// 최소한의 환경 (데이터 시딩 없음)
import { setupMinimalTestEnvironment } from '../helpers/testHooks.js';
const testHooks = setupMinimalTestEnvironment();
```

### 시딩된 데이터 사용

```javascript
import { getSeededUser, getSeededExhibition } from '../helpers/testHooks.js';

test('사용자 로그인 테스트', async () => {
    const user = getSeededUser('regularUser');
    // 시딩된 사용자 데이터 사용
});
```

### 데이터 정리

- **자동 정리**: 각 테스트 후 자동으로 데이터 정리
- **빠른 정리**: 트랜잭션 기반 고성능 정리
- **선택적 정리**: 특정 데이터 타입만 정리

## 🔧 설정 옵션

### Playwright 설정

`playwright.config.js`에서 다음 설정을 조정할 수 있습니다:

```javascript
// 테스트 타임아웃
timeout: 30000,

// 재시도 횟수
retries: process.env.CI ? 2 : 0,

// 병렬 실행 워커 수
workers: process.env.CI ? 1 : undefined,

// 리포터 설정
reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }]
]
```

### 테스트 환경 커스터마이징

```javascript
import { setupCustomTestEnvironment } from '../helpers/testHooks.js';

const testHooks = setupCustomTestEnvironment({
    seedData: true,
    cleanupAfter: true,
    quickCleanup: true,
    seedTypes: ['users', 'exhibitions'],
    isolateTests: true,
    retryOnFailure: false
});
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. Docker 컨테이너 연결 실패

```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 재시작
npm run docker:test:down
npm run docker:test

# 로그 확인
npm run docker:logs
```

#### 2. 테스트 데이터베이스 문제

```bash
# 테스트 데이터베이스 초기화
docker-compose exec mysql mysql -u root -p -e "DROP DATABASE IF EXISTS skku_sfa_gallery_test; CREATE DATABASE skku_sfa_gallery_test;"
```

#### 3. 포트 충돌

기본 포트가 사용 중인 경우:
- MySQL 테스트: 3307 → 다른 포트로 변경
- Redis 테스트: 6380 → 다른 포트로 변경

#### 4. Playwright 브라우저 문제

```bash
# 브라우저 재설치
npx playwright install --force

# 시스템 의존성 설치
npx playwright install-deps
```

### 디버깅 팁

1. **상세 로그 활성화**:
   ```bash
   DEBUG=pw:api npx playwright test
   ```

2. **테스트 격리 확인**:
   ```bash
   npx playwright test --workers=1
   ```

3. **특정 테스트만 실행**:
   ```bash
   npx playwright test --grep="특정 테스트 이름"
   ```

## 📊 성능 최적화

### 테스트 실행 시간 단축

1. **병렬 실행**: 여러 워커로 테스트 병렬 실행
2. **빠른 정리**: 트랜잭션 기반 데이터 정리
3. **선택적 시딩**: 필요한 데이터만 시딩
4. **캐시 활용**: Docker 이미지 및 의존성 캐시

### 리소스 사용량 최적화

1. **메모리 사용량**: 테스트 격리 수준 조정
2. **네트워크 사용량**: 로컬 Docker 컨테이너 사용
3. **디스크 사용량**: 임시 파일 자동 정리

## 🔗 관련 문서

- [Playwright 공식 문서](https://playwright.dev/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [프로젝트 메인 README](../../README.md)

## 🤝 기여하기

테스트 시스템 개선에 기여하려면:

1. 새로운 테스트 케이스 추가
2. 테스트 헬퍼 함수 개선
3. CI/CD 파이프라인 최적화
4. 문서 업데이트

---

**마지막 업데이트**: 2025년 6월 4일
**버전**: 1.0.0
**담당자**: SKKU Fine Art Club Gallery 개발팀
