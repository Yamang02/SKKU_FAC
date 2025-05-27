서비스 URL : [성미회 갤러리 사이트](https://www.skkuartclub.kr/)

# SKKU 성미회 갤러리 기술스펙 정의서

## 1. 프로젝트 개요

SKKU 미술동아리 갤러리는 성균관대학교 순수 미술 동아리 전시의 예술 작품을 전시하고 관리하는 웹 플랫폼입니다. 이 시스템은 전시회 관리, 작품 업로드, 사용자 인증 등의 기능을 제공합니다.

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

### 2.4 보안
- **인증**: 세션 기반 인증
- **암호화**: bcrypt
- **보안 헤더**: helmet
- **요청 제한**: express-rate-limit

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

## 8. 확장성

- **계층화된 아키텍처**: 관심사 분리를 통한 유지보수성 향상
- **모듈식 설계**: 새로운 기능 추가가 용이한 구조
- **환경 변수**: 환경별 구성으로 유연한 배포 가능

## 9. Redis 캐싱 시스템

### 9.1 Redis 구성
- **세션 스토어**: 사용자 세션 데이터를 Redis에 저장하여 확장성 확보
- **캐싱 전략**: 자주 사용되는 데이터의 캐싱을 통한 성능 향상
- **환경별 설정**: 개발/테스트/프로덕션 환경별 Redis 설정 분리

### 9.2 세션 관리
- **Redis 기반 세션**: connect-redis를 사용한 세션 스토어
- **세션 만료**: TTL 설정을 통한 자동 세션 만료 (기본 24시간)
- **폴백 메커니즘**: Redis 연결 실패 시 메모리 기반 세션으로 자동 전환

## 10. CDN 및 외부 리소스

### 10.1 사용 중인 CDN
- **jsDelivr**: QR 코드 생성, html2canvas 라이브러리
- **Google Fonts**: 웹 폰트 제공
- **Cloudflare**: 기타 외부 리소스
- **Kakao CDN**: 카카오 SDK 및 관련 리소스

### 10.2 보안 정책
- **CSP 설정**: Content Security Policy를 통한 허용된 CDN만 접근 가능
- **HTTPS 강제**: 모든 외부 리소스는 HTTPS를 통해서만 로드
- **리소스 무결성**: 중요한 외부 스크립트에 대한 무결성 검증

## 11. 배포 환경

- **개발 환경**: 로컬 개발 환경 (NODE_ENV=development)
- **프로덕션 환경**: Railway 호스팅 (NODE_ENV=production)
- **CI/CD**: 자동화된 배포 파이프라인

## 12. 의존성

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

### 외부 CDN 라이브러리:
- **Kakao SDK**: 카카오 소셜 로그인 및 공유 기능
- **QR Code**: QR 코드 생성 (jsDelivr CDN)
- **html2canvas**: 화면 캡처 기능 (jsDelivr CDN)
- **Google Fonts**: 웹 폰트
- **Cloudflare CDN**: 기타 외부 리소스

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
