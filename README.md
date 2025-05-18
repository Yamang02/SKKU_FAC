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
│   │   └── db/                       # 데이터베이스 관련
│   │       ├── adapter/              # DB 어댑터
│   │       ├── repository/           # 레포지토리 패턴 구현
│   │       └── model/                # DB 모델
│   │           ├── entity/           # 엔티티 모델
│   │           └── relationship/     # 모델 간 관계 설정
│   ├── common/                       # 공통 유틸리티
│   ├── config/                       # 설정 파일
│   ├── public/                       # 정적 파일
│   └── views/                        # EJS 뷰 템플릿
├── public/                           # 배포용 정적 파일
├── node_modules/                     # 패키지 종속성
├── .env.local                        # 로컬 환경 변수
├── .env.remote                       # 원격 환경 변수
├── package.json                      # 프로젝트 메타데이터 및 종속성
└── package-lock.json                 # 패키지 버전 잠금 파일
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

- **정적 자산 캐싱**: 클라이언트 측 캐싱을 통한 성능 향상
- **요청 로깅**: 요청 처리 시간 모니터링
- **에러 처리**: 중앙 집중식 에러 처리 및 로깅

## 8. 확장성

- **계층화된 아키텍처**: 관심사 분리를 통한 유지보수성 향상
- **모듈식 설계**: 새로운 기능 추가가 용이한 구조
- **환경 변수**: 환경별 구성으로 유연한 배포 가능

## 9. 배포 환경

- **개발 환경**: 로컬 개발 환경 (NODE_ENV=development)
- **프로덕션 환경**: Railway 호스팅 (NODE_ENV=production)
- **CI/CD**: 자동화된 배포 파이프라인

## 10. 의존성

주요 패키지:
- express: 웹 서버 프레임워크
- sequelize: ORM
- bcrypt: 비밀번호 해싱
- multer & multer-storage-cloudinary: 파일 업로드
- helmet: 보안 미들웨어
- express-rate-limit: 요청 제한
- ejs: 템플릿 엔진
- dotenv: 환경 변수 관리
- swagger-ui-express: API 문서화

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
# 기타
[예상 면접 질문 정리](docs/예상 면접 질문 정리.md)

## 예상 면접 질문

1. 이 프로젝트를 기획하게 된 계기와 목적은 무엇인가요?
2. 실제 사용자(회원/비회원)의 주요 사용 흐름은 어떻게 되나요?
3. 프로젝트 진행 과정에서 기획이나 요구사항이 변경된 부분이 있다면?
4. 바닐라 JS와 EJS를 사용한 이유는 무엇인가요? SPA 프레임워크는 고려하지 않았나요?
5. Express와 Sequelize를 선택한 이유는 무엇인가요?
6. ORM 사용 중 Query 최적화나 N+1 문제를 마주친 적이 있나요?
7. Cloudinary를 선택한 이유는 무엇인가요? S3 등의 대안은 고려했나요?
8. Railway 배포에서 겪은 한계나 장점은 어떤 것이었나요?
9. 세션 기반 인증을 선택한 이유는? JWT는 고려하지 않았나요?
10. 도메인 폴더 구조를 나눈 기준은 무엇인가요?
11. DDD 스타일 구조에서 실제 유지보수에 도움이 된 예시가 있나요?
12. infrastructure와 domain을 명확히 나눈 이유와 장점은 무엇인가요?
13. 도메인 구조에서 Controller, Service, Model을 어떻게 구분하고 연결했나요?
14. `ArtworkExhibitionRelationship` 같은 관계 모델은 어떤 기준으로 설계했나요?
