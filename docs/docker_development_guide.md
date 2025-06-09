# Docker 기반 개발 가이드

## 개발 환경 설정

### 1. 브랜치 전략
```
feature/* → dev → test → main
```

- **feature 브랜치**: 개별 기능 개발 (현재: `feature_TaskmasterAI활용리팩토링`)
- **dev**: 개발 통합 브랜치 (로컬 Docker 환경)
- **test**: Railway 테스트 환경 브랜치
- **main**: Railway 운영 환경 브랜치

### 2. Docker 환경 시작
```bash
# Feature 브랜치에서 개발 시작
git checkout feature_TaskmasterAI활용리팩토링

# Docker 개발 환경 실행
npm run dev
# 또는
docker-compose up --build
```

### 3. 개발 서버 접속
- **애플리케이션**: http://localhost:3000
- **MySQL**: localhost:3306 (root/password)
- **Redis**: localhost:6379

## 개발 워크플로우

### 1. Feature 브랜치에서 개발
```bash
# 코드 수정 후 로컬 테스트
npm run dev

# E2E 테스트 실행
npm run test:e2e:local

# 코드 품질 검사
npm run lint
npm run type-check
```

### 2. Dev 브랜치로 통합
```bash
# 개발 완료 후 dev 브랜치로 병합
git checkout dev
git pull origin dev
git merge feature_TaskmasterAI활용리팩토링

# Docker 환경에서 통합 테스트
npm run dev
npm run test:e2e:local

# 문제없으면 dev 브랜치 푸시
git push origin dev
```

### 3. Test 환경으로 승격
```bash
# dev → test 브랜치 병합
git checkout test
git pull origin test
git merge dev

# Railway test 환경 자동 배포
git push origin test

# Railway test 환경 E2E 테스트
npm run test:e2e:railway
```

## Docker 명령어

### 기본 명령어
```bash
# 개발 환경 시작 (백그라운드)
npm run dev

# 개발 환경 시작 (로그 보기)
npm run dev:logs

# 개발 환경 중지
npm run dev:stop

# 컨테이너 재빌드
npm run dev:rebuild

# 전체 환경 정리
npm run dev:clean
```

### 개별 서비스 관리
```bash
# 특정 서비스만 재시작
docker-compose restart app

# 서비스 로그 확인
docker-compose logs -f app
docker-compose logs -f mysql
docker-compose logs -f redis
```

## 테스트 실행

### E2E 테스트
```bash
# 로컬 Docker 환경 테스트
npm run test:e2e:local

# Railway test 환경 테스트
npm run test:e2e:railway

# 특정 테스트 파일 실행
npx playwright test tests/e2e/auth/signup.spec.js

# 디버그 모드로 테스트
npx playwright test --debug
```

### 코드 품질 검사
```bash
# ESLint 검사
npm run lint

# TypeScript 타입 검사
npm run type-check

# 모든 검사 실행
npm run quality:check
```

## 데이터베이스 관리

### MySQL 접속
```bash
# Docker 컨테이너 내부 접속
docker-compose exec mysql mysql -u root -p

# 또는 외부 클라이언트로 접속
# Host: localhost, Port: 3306, User: root, Password: password
```

### 마이그레이션
```bash
# 컨테이너 내부에서 마이그레이션 실행
docker-compose exec app npm run migrate

# 새로운 마이그레이션 생성
docker-compose exec app npm run migrate:create
```

## 환경 변수 관리

### 로컬 개발용 .env
```bash
# .env.local 파일 사용 (Docker 환경)
NODE_ENV=development
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=skku_gallery_dev
DB_USER=root
DB_PASS=password
REDIS_HOST=redis
REDIS_PORT=6379
```

### Railway 환경과의 차이점
- **Database**: 로컬 MySQL vs Railway MySQL
- **Redis**: 로컬 Redis vs Redis Cloud
- **BASE_URL**: http://localhost:3000 vs https://skkufacapp-test.up.railway.app

## 문제 해결

### 일반적인 문제들

#### 1. localhost:3000에서 응답이 없는 경우
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs app

# 애플리케이션 컨테이너가 실행 중인지 확인
docker ps | grep skku_gallery_app
```

**가능한 원인과 해결방법:**

- **MySQL 연결 대기**: MySQL이 완전히 시작되기 전에 앱이 시작하려고 시도
  ```bash
  # MySQL 상태 확인
  docker-compose logs mysql

  # MySQL이 완전히 시작된 후 앱 재시작
  docker-compose restart app
  ```

- **포트 충돌**: 다른 프로세스가 3000 포트 사용 중
  ```bash
  # Windows에서 포트 확인
  netstat -an | findstr :3000

  # 컨테이너 완전 중지 후 재시작
  docker-compose down
  docker-compose up -d
  ```

- **환경변수 누락**: 필수 환경변수가 설정되지 않음
  ```bash
  # 컨테이너 내부에서 환경변수 확인
  docker-compose exec app env | grep -E "NODE_ENV|DB_"
  ```

#### 2. 컨테이너가 시작되지 않는 경우
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs

# 컨테이너 재빌드
npm run dev:rebuild
```

#### 3. 데이터베이스 연결 오류
```bash
# MySQL 컨테이너 상태 확인
docker-compose logs mysql

# 데이터베이스 재시작
docker-compose restart mysql

# 전체 환경 재시작
npm run dev:restart
```

#### 4. 캐시 문제
```bash
# Docker 빌드 캐시 정리
docker system prune -f

# npm 캐시 정리
npm cache clean --force

# 전체 환경 정리 후 재시작
npm run dev:clean
npm run dev
```

## 성능 최적화

### 개발 중 핫 리로드
- 코드 변경 시 자동으로 서버 재시작
- `nodemon`으로 TypeScript 파일 감시
- Docker volume mount로 실시간 반영

### 빌드 시간 단축
- Docker layer 캐싱 활용
- multi-stage build 사용
- `.dockerignore`로 불필요한 파일 제외

## 팀 개발 가이드

### 브랜치 병합 전 체크리스트
- [ ] `npm run dev`로 로컬 Docker 환경에서 정상 동작 확인
- [ ] `npm run test:e2e:local` 모든 테스트 통과
- [ ] `npm run lint` 코드 스타일 검사 통과
- [ ] `npm run type-check` 타입 검사 통과
- [ ] 새로운 환경 변수가 있다면 README 업데이트

### Dev 브랜치 통합 규칙
1. Feature 브랜치에서 충분한 로컬 테스트 완료
2. Dev 브랜치로 병합 전 최신 상태로 업데이트
3. 병합 후 Docker 환경에서 다시 한 번 전체 테스트
4. 문제 발견 시 즉시 수정하거나 revert

이제 올바른 **feature → dev → test → main** 브랜치 워크플로우가 반영되었습니다. 현재 `feature_TaskmasterAI활용리팩토링` 브랜치에서 작업하신 내용을 `dev` 브랜치로 병합하고, 이후 `test` → `main` 순서로 진행하시면 됩니다.
