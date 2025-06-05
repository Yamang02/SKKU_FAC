서비스 URL : [성미회 갤러리 사이트](https://www.skkuartclub.kr/)

# SKKU 성미회 갤러리 기술스펙 정의서

## 1. 프로젝트 개요

SKKU 미술동아리 갤러리는 성균관대학교 순수 미술 동아리 전시의 예술 작품을
전시하고 관리하는 웹 플랫폼입니다. 이 시스템은 전시회 관리, 작품 업로드, 사용자
인증 등의 기능을 제공합니다.

## 2. 기술 스택

### 2.1 프론트엔드

- **템플릿 엔진**: EJS
- **CSS 프레임워크**: 자체 CSS
- **JavaScript**: 바닐라 자바스크립트

### 2.2 백엔드

- **런타임**: Node.js (22.13.0)
- **프레임워크**: Express.js
- **데이터베이스**: MySQL
- **ORM**: Sequelize

### 2.3 인프라

- **클라우드 스토리지**: Cloudinary (이미지 저장)
- **캐싱**: Redis (세션 스토어 및 캐싱)
- **CDN**: jsDelivr, Google Fonts, Cloudflare (외부 라이브러리 및 폰트)
- **배포 환경**: Railway
- **컨테이너화**: Docker & Docker Compose

### 2.4 보안

- **인증**: 세션 기반 인증
- **암호화**: bcrypt
- **보안 헤더**: helmet
- **요청 제한**: express-rate-limit

### 2.5 로깅 및 모니터링

- **로깅**: Winston 기반 구조화된 로깅
- **로그 로테이션**: winston-daily-rotate-file
- **에러 추적**: 자동 에러 분류 및 심각도 판단
- **성능 모니터링**: 메트릭 수집 및 임계값 체크
- **알림**: 이메일 기반 로그 알림 (Railway 환경)

## 3. 프로젝트 구조도

```
SKKU_FAC_GALLERY/
├── src/                              # 소스 코드 루트
│   ├── app.js                        # Express 애플리케이션 설정
│   ├── server.js                     # 서버 시작점
│   ├── routeIndex.js                 # 라우터 인덱스
│   ├── swagger.json                  # API 문서
│   ├── domain/                       # 도메인별 구성요소
│   │   ├── admin/                    # 관리자 도메인
│   │   ├── artwork/                  # 작품 도메인
│   │   ├── auth/                     # 인증 도메인
│   │   ├── common/                   # 공통 도메인
│   │   ├── exhibition/               # 전시회 도메인
│   │   │   ├── controller/           # 컨트롤러 레이어
│   │   │   ├── model/                # 모델 레이어
│   │   │   └── service/              # 서비스 레이어
│   │   ├── home/                     # 홈 도메인
│   │   ├── image/                    # 이미지 도메인
│   │   └── user/                     # 사용자 도메인
│   ├── infrastructure/               # 인프라 계층
│   │   ├── cloudinary/               # Cloudinary 통합
│   │   ├── redis/                    # Redis 캐싱 시스템
│   │   ├── session/                  # 세션 스토어 관리
│   │   └── db/                       # 데이터베이스 관련
│   │       ├── adapter/              # DB 어댑터
│   │       ├── repository/           # 레포지토리 패턴 구현
│   │       └── model/                # DB 모델
│   │           ├── entity/           # 엔티티 모델
│   │           └── relationship/     # 모델 간 관계 설정
│   ├── common/                       # 공통 유틸리티
│   │   ├── constants/                # 상수 정의
│   │   ├── error/                    # 에러 처리
│   │   ├── middleware/               # 공통 미들웨어
│   │   └── utils/                    # 유틸리티 함수
│   │       ├── Logger.js             # Winston 기반 구조화된 로깅
│   │       └── emailSender.js        # 이메일 전송 (로그 알림 포함)
│   ├── config/                       # 설정 파일
│   │   ├── infrastructure.js         # 인프라 설정
│   │   └── security.js               # 보안 설정
│   ├── public/                       # 정적 파일
│   │   ├── assets/                   # 에셋 파일
│   │   ├── css/                      # 스타일시트
│   │   ├── images/                   # 이미지 파일
│   │   ├── js/                       # 클라이언트 JavaScript
│   │   └── uploads/                  # 업로드 파일
│   └── views/                        # EJS 뷰 템플릿
├── public/                           # 배포용 정적 파일
├── docs/                             # 문서
├── logs/                             # 로그 파일
├── scripts/                          # 스크립트 파일
├── tasks/                            # 작업 관리
├── requirements/                     # 요구사항 문서
├── node_modules/                     # 패키지 종속성
├── package.json                      # 프로젝트 메타데이터 및 종속성
├── package-lock.json                 # 패키지 버전 잠금 파일
├── .taskmasterconfig                 # Task Master 설정
├── .eslintrc.json                    # ESLint 설정
├── .stylelintrc.json                 # Stylelint 설정
└── .gitignore                        # Git 무시 파일
```

## 4. 주요 모듈 설명

### 4.1 도메인 모듈

각 도메인은 MVC 패턴을 따르며 다음 구조로 구성됩니다:

- **Controller**: 요청 처리 및 라우팅
- **Service**: 비즈니스 로직 처리
- **Model**: 데이터 모델 정의

#### 4.1.1 주요 도메인

- **Exhibition**: 전시회 관리 및 조회
- **Artwork**: 작품 등록, 관리, 조회
- **User**: 사용자 관리
- **Auth**: 인증 및 권한 관리
- **Admin**: 관리자 기능

### 4.2 인프라 모듈

- **DB**: Sequelize ORM을 사용한 데이터베이스 연결 및 모델 관리
- **Cloudinary**: 이미지 업로드 및 관리
- **Redis**: 세션 스토어 및 캐싱 시스템
- **Session**: Redis 기반 세션 관리

### 4.3 데이터베이스 모델

주요 엔티티:

- **UserAccount**: 사용자 계정 정보
- **SkkuUserProfile**: 성균관대 사용자 프로필
- **ExternalUserProfile**: 외부 사용자 프로필
- **Exhibition**: 전시회 정보
- **Artwork**: 작품 정보
- **ArtworkExhibitionRelationship**: 작품과 전시회 간 관계

## 5. API 문서화

- Swagger UI를 통한 API 문서 제공 (`/api-docs` 경로)
- RESTful API 구조 준수

## 6. 보안 구현

- **세션 관리**: 사용자 세션 추적 및 관리
- **헬멧 미들웨어**: 보안 헤더 설정으로 일반적인 웹 취약점 방지
- **비율 제한**: 브루트 포스 공격 방지를 위한 요청 제한
- **입력 검증**: 모든 사용자 입력에 대한 검증

## 7. 성능 최적화

- **Redis 캐싱**: 세션 데이터 및 자주 사용되는 데이터 캐싱
- **CDN 활용**: 외부 라이브러리 및 폰트를 CDN을 통해 로드
- **정적 자산 캐싱**: 클라이언트 측 캐싱을 통한 성능 향상
- **이미지 최적화**: Cloudinary를 통한 자동 이미지 최적화
- **요청 로깅**: 요청 처리 시간 모니터링
- **에러 처리**: 중앙 집중식 에러 처리 및 로깅

## 8. 로깅 시스템

### 8.1 Winston 기반 구조화된 로깅

- **Winston 3.8.2**: 강력한 로깅 라이브러리 기반
- **환경별 최적화**: 개발(콘솔+이모지), 프로덕션(파일+JSON), 테스트(최소화)
- **로그 레벨**: debug, info, warn, error 레벨 지원
- **민감정보 보호**: 패스워드, 토큰 등 자동 마스킹 ([REDACTED])

### 8.2 환경별 로그 전략

- **개발환경**: 콘솔 출력, 이모지 포함, debug 레벨
- **테스트환경**: 최소 출력, error 레벨만, TEST_SILENT 지원
- **스테이징환경**: 콘솔 + 파일, warn 레벨
- **프로덕션환경**: 파일 로테이션, error 레벨, JSON 포맷

### 8.3 로그 파일 관리

- **자동 로테이션**: 일별 로그 파일 생성 및 압축
- **크기 제한**: 에러 로그 20MB, 전체 로그 50MB, 액세스 로그 100MB
- **보관 정책**: 에러 로그 30일, 전체 로그 14일, 액세스 로그 7일
- **Railway 환경**: 파일 시스템 제약으로 이메일 기반 로그 전송

### 8.4 에러 로깅 강화

- **자동 분류**: 7가지 카테고리 (DATABASE, NETWORK, AUTH, VALIDATION, BUSINESS,
  SYSTEM, EXTERNAL)
- **심각도 판단**: CRITICAL, HIGH, MEDIUM, LOW 4단계
- **복구 제안**: 에러 카테고리별 자동 복구 제안 생성
- **패턴 감지**: 반복되는 에러 패턴 자동 감지 및 알림

### 8.5 성능 모니터링

- **메트릭 수집**: 메모리, CPU, 응답시간, DB 쿼리 시간 등
- **임계값 체크**: 자동 성능 임계값 모니터링 및 알림
- **트렌드 분석**: 성능 변화 추이 분석 및 회귀 감지
- **리소스 모니터링**: 시스템 리소스 사용량 추적

### 8.6 Railway 환경 특화 기능

- **자동 환경 감지**: RAILWAY_PROJECT_ID 등을 통한 자동 감지
- **이메일 로그 전송**: 일별 로그 요약 이메일 (자정 전송)
- **긴급 알림**: 에러 5개 이상 누적 시 즉시 이메일 알림
- **스마트 버퍼링**: 메모리 효율적인 로그 버퍼 관리

### 8.7 로깅 API

```javascript
import logger from './src/common/utils/Logger.js';

// 기본 로깅
logger.info('정보 메시지', { key: 'value' });
logger.warn('경고 메시지');
logger.error('에러 메시지', error, { context: 'additional info' });

// 컨텍스트 기반 로깅 (사용자 정보 자동 포함)
const contextLogger = logger.withContext(req);
contextLogger.info('사용자 액션 로그');

// 성능 측정
const timer = logger.startTimer('operation');
// ... 작업 수행
timer.end(); // 자동으로 소요 시간 로깅

// 강화된 에러 로깅
logger.logErrorWithAnalysis('에러 발생', error, { context }, userInfo, req);
```

### 8.8 환경변수 설정

```bash
# 로그 레벨 오버라이드 (선택적)
LOG_LEVEL=debug

# 테스트 환경 조용 모드 (선택적)
TEST_SILENT=true

# 커스텀 에러 분류 (선택적)
CUSTOM_ERROR_CATEGORIES='{"PAYMENT":["payment","billing"]}'

# 커스텀 복구 제안 (선택적)
CUSTOM_RECOVERY_SUGGESTIONS='{"PAYMENT":["결제 설정을 확인하세요"]}'
```

## 9. 확장성

- **계층화된 아키텍처**: 관심사 분리를 통한 유지보수성 향상
- **모듈식 설계**: 새로운 기능 추가가 용이한 구조
- **환경 변수**: 환경별 구성으로 유연한 배포 가능

## 10. Redis 캐싱 시스템

### 10.1 Redis 구성

- **세션 스토어**: 사용자 세션 데이터를 Redis에 저장하여 확장성 확보
- **캐싱 전략**: 자주 사용되는 데이터의 캐싱을 통한 성능 향상
- **환경별 설정**: 개발/테스트/프로덕션 환경별 Redis 설정 분리

### 10.2 세션 관리

- **Redis 기반 세션**: connect-redis를 사용한 세션 스토어
- **세션 만료**: TTL 설정을 통한 자동 세션 만료 (기본 24시간)
- **폴백 메커니즘**: Redis 연결 실패 시 메모리 기반 세션으로 자동 전환

## 11. CDN 및 외부 리소스

### 11.1 사용 중인 CDN

- **jsDelivr**: QR 코드 생성, html2canvas 라이브러리
- **Google Fonts**: 웹 폰트 제공
- **Cloudflare**: 기타 외부 리소스
- **Kakao CDN**: 카카오 SDK 및 관련 리소스

### 11.2 보안 정책

- **CSP 설정**: Content Security Policy를 통한 허용된 CDN만 접근 가능
- **HTTPS 강제**: 모든 외부 리소스는 HTTPS를 통해서만 로드
- **리소스 무결성**: 중요한 외부 스크립트에 대한 무결성 검증

## 12. 배포 환경

- **개발 환경**: 로컬 개발 환경 (NODE_ENV=development)
- **프로덕션 환경**: Railway 호스팅 (NODE_ENV=production)
- **CI/CD**: 자동화된 배포 파이프라인

## 13. 의존성

주요 패키지:

- express: 웹 서버 프레임워크
- sequelize: ORM
- redis: Redis 클라이언트
- connect-redis: Redis 세션 스토어
- bcrypt: 비밀번호 해싱
- multer & multer-storage-cloudinary: 파일 업로드
- helmet: 보안 미들웨어
- express-rate-limit: 요청 제한
- ejs: 템플릿 엔진
- dotenv: 환경 변수 관리
- swagger-ui-express: API 문서화
- winston: 구조화된 로깅 라이브러리
- winston-daily-rotate-file: 로그 파일 자동 로테이션
- nodemailer: 이메일 전송 (로그 알림)

### 외부 CDN 라이브러리:

- **Kakao SDK**: 카카오 소셜 로그인 및 공유 기능
- **QR Code**: QR 코드 생성 (jsDelivr CDN)
- **html2canvas**: 화면 캡처 기능 (jsDelivr CDN)
- **Google Fonts**: 웹 폰트
- **Cloudflare CDN**: 기타 외부 리소스

## Docker 환경 설정

이 프로젝트는 Railway 배포와 로컬 개발을 위한 다중 Docker 환경을 지원합니다.

### Docker 설정 구조

- **Railway 배포**: MySQL 내부 인스턴스, Redis/Cloudinary 외부 서비스
- **로컬 개발**: MySQL Docker 컨테이너, Redis/Cloudinary 외부 서비스 연결
- **테스트 환경**: 별도의 MySQL/Redis 포트 사용

### Railway 배포용 Docker

Railway에서는 MySQL은 내부 인스턴스를, Redis와 Cloudinary는 외부 서비스를 사용합니다.

```bash
# Railway 배포용 (앱만 컨테이너로 실행)
npm run docker:railway

# 환경 변수 설정 필요 (.env 파일)
NODE_ENV=production
DB_HOST=mysql.railway.internal
DB_PORT=3306
REDIS_URL=redis://external-redis-service
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 로컬 개발용 Docker

```bash
# 로컬 개발 환경 시작 (MySQL 컨테이너 + App, 외부 Redis/Cloudinary 연결)
npm run docker:dev

# 빌드와 함께 시작
npm run docker:dev:build

# MySQL만 시작 (앱은 로컬에서 직접 실행 시)
npm run docker:mysql

# 개발 환경용 로그 확인
npm run docker:logs

# 개발 환경 중지
npm run docker:down
```

### 테스트용 Docker

```bash
# 로컬 전체 테스트 (MySQL + Redis)
npm run docker:test:local

# Railway 테스트 (MySQL만, 외부 Redis 사용)
npm run docker:test:railway

# 테스트 환경 중지
npm run docker:test:down
```

### 환경 변수 설정

#### 로컬 개발용 (.env)
```bash
NODE_ENV=development
# MySQL (Docker 컨테이너)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=devpassword
DB_NAME=skku_sfa_gallery

# Redis (외부 서비스 - Redis Labs, Upstash 등)
REDIS_URL=redis://your-redis-host:port
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Cloudinary (외부 서비스)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT & Session
JWT_SECRET=local_development_secret
SESSION_SECRET=local_session_secret
```

#### Railway 배포용 (Railway Variables)
```bash
NODE_ENV=production
PORT=3000
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_USER=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}
DB_NAME=${MYSQL_DATABASE}
REDIS_URL=${REDIS_URL}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
```

## 코드 품질 관리

이 프로젝트는 코드 품질을 유지하기 위해 다음과 같은 도구를 사용합니다:

### 코드 분석 도구

- **ESLint**: JavaScript 코드 품질 검사
- **Stylelint**: CSS 코드 품질 및 중복 검사

### 사용 방법

```bash
# 코드 분석 실행
npm run analyze

# JavaScript 코드만 분석
npm run lint

# JavaScript 코드 분석 및 자동 수정
npm run lint:fix

# CSS 코드만 분석
npm run lint:css

# CSS 코드 분석 및 자동 수정
npm run lint:css:fix
```
