# 프로젝트 구조

## 1. 소스 코드 구조

```
src/
├── application/        # 애플리케이션 레이어
├── domain/            # 도메인 레이어
│   └── [도메인]/      # 각 도메인 디렉토리
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       └── service/
├── infrastructure/    # 인프라 레이어
│   ├── db/           # 데이터베이스 연결
│   └── data/         # 정적 데이터
├── interface/        # 인터페이스 레이어
│   └── router/       # 라우터
│       ├── index.js
│       └── [도메인]/
└── presentation/     # 프레젠테이션 레이어
    ├── public/       # 정적 파일
    │   ├── css/
    │   ├── js/
    │   └── images/
    └── view/         # EJS 템플릿
        ├── common/   # 공통 템플릿
        └── [도메인]/ # 도메인별 템플릿
```

## 2. 도메인 구조

현재 프로젝트는 다음과 같은 도메인들로 구성되어 있습니다:

### 2.1. 주요 도메인
- `home`: 메인 페이지 및 기본 네비게이션
- `artwork`: 작품 관리 및 전시
- `exhibition`: 전시회 관리 및 일정

### 2.2. 지원 도메인
- `user`: 사용자 관리
- `notice`: 공지사항
- `comment`: 댓글 시스템
- `image`: 이미지 처리

## 3. 레이어별 주요 기능

### 3.1. Domain Layer
- 비즈니스 로직 및 규칙 정의
- 도메인 모델 및 서비스 구현
- DTO와 엔티티 관리

### 3.2. Infrastructure Layer
- 데이터베이스 연결 및 관리
- 외부 서비스 통합
- 공통 유틸리티 제공

### 3.3. Interface Layer
- API 라우팅 처리
- 요청/응답 처리
- 미들웨어 관리

### 3.4. Presentation Layer
- 사용자 인터페이스 구현 (EJS)
- 정적 자원 관리
- 클라이언트 사이드 로직
