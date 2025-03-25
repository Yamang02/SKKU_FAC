# 프로젝트 구조

```
src/
├── domain/                     # 도메인 계층
│   ├── common/                 # 공통 모듈
│   │   └── pagination/        # 페이지네이션 관련
│   │
│   ├── artwork/               # 작품 도메인
│   │   ├── entity/           # 엔티티
│   │   ├── service/          # 서비스
│   │   ├── repository/       # 리포지토리
│   │   ├── dto/              # DTO
│   │   └── Artwork.js        # 작품 도메인 모델
│   │
│   ├── exhibition/           # 전시회 도메인
│   ├── notice/               # 공지사항 도메인
│   ├── user/                 # 사용자 도메인
│   ├── home/                 # 홈 도메인
│   └── comment/              # 댓글 도메인
│
├── application/              # 애플리케이션 계층
│   ├── service/              # 공통 서비스
│   ├── artwork/              # 작품 유스케이스
│   ├── exhibition/           # 전시회 유스케이스
│   ├── notice/               # 공지사항 유스케이스
│   ├── user/                 # 사용자 유스케이스
│   ├── home/                 # 홈 유스케이스
│   └── comment/              # 댓글 유스케이스
│
├── interface/               # 인터페이스 계층
│   ├── controller/          # 컨트롤러
│   │   ├── AdminController.js    # 관리자 컨트롤러
│   │   ├── ArtworkController.js  # 작품 컨트롤러
│   │   ├── CommentController.js  # 댓글 컨트롤러
│   │   ├── ExhibitionController.js # 전시회 컨트롤러
│   │   ├── HomeController.js     # 홈 컨트롤러
│   │   ├── NoticeController.js   # 공지사항 컨트롤러
│   │   └── UserController.js     # 사용자 컨트롤러
│   │
│   ├── middleware/          # 미들웨어
│   │   ├── error/          # 에러 처리
│   │   ├── auth.js         # 인증
│   │   └── PageTracker.js  # 페이지 추적
│   │
│   ├── router/             # 라우터
│   │   ├── RouterIndex.js  # 라우터 인덱스
│   │   ├── artwork/        # 작품 라우터
│   │   ├── exhibition/     # 전시회 라우터
│   │   ├── home/          # 홈 라우터
│   │   ├── notice/        # 공지사항 라우터
│   │   └── user/          # 사용자 라우터
│   │
│   └── util/               # 유틸리티
│
├── infrastructure/         # 인프라스트럭처 계층
│   ├── config/            # 설정 파일
│   │   └── DependencyInjection.js # 의존성 주입 설정
│   ├── di/                # 의존성 주입
│   ├── db/                # 데이터베이스
│   ├── data/              # 데이터 소스
│   └── repository/        # 리포지토리
│
└── presentation/          # 프레젠테이션 계층
    ├── view/             # 뷰 템플릿
    │   ├── admin/       # 관리자 뷰
    │   ├── artwork/     # 작품 뷰
    │   ├── common/      # 공통 뷰
    │   ├── exhibition/  # 전시회 뷰
    │   ├── home/        # 홈 뷰
    │   ├── notice/      # 공지사항 뷰
    │   └── user/        # 사용자 뷰
    │
    ├── util/            # 유틸리티
    ├── constant/        # 상수
    └── public/          # 정적 파일
        ├── asset/       # 에셋 파일
        ├── css/         # CSS 파일
        └── js/          # JavaScript 파일
```

## 주요 디렉토리 설명

### domain/
- **common/**: 공통으로 사용되는 모듈
  - **pagination/**: 페이지네이션 관련 모듈
- **[도메인]/**: 각 도메인별 핵심 모듈
  - **entity/**: 도메인 엔티티
  - **service/**: 도메인 서비스
  - **repository/**: 리포지토리 인터페이스
  - **dto/**: DTO 클래스

### application/
- **service/**: 공통 서비스
- **[도메인]/**: 각 도메인별 유스케이스

### interface/
- **controller/**: HTTP 요청 처리
  - 각 도메인별 컨트롤러 구현
- **middleware/**: 미들웨어
  - **error/**: 에러 처리
  - **auth.js**: 인증
  - **PageTracker.js**: 페이지 추적
- **router/**: 라우트 정의
  - **RouterIndex.js**: 라우터 통합
  - 각 도메인별 라우터
- **util/**: 유틸리티 함수

### infrastructure/
- **config/**: 설정 파일
  - **DependencyInjection.js**: 의존성 주입 설정
- **di/**: 의존성 주입
- **db/**: 데이터베이스 관련
- **data/**: 데이터 소스
- **repository/**: 리포지토리 구현

### presentation/
- **view/**: EJS 템플릿 파일
  - 각 도메인별 뷰 템플릿
  - **common/**: 공통 템플릿
- **util/**: 유틸리티
- **constant/**: 상수 정의
- **public/**: 정적 파일
  - **asset/**: 에셋 파일
  - **css/**: CSS 파일
  - **js/**: JavaScript 파일

### presentation/view/admin 상세 구조
```
src/presentation/view/admin/
├── AdminDashboard.ejs     # 관리자 대시보드 메인 페이지
├── layout/               # 관리자 페이지 레이아웃 관련
│   ├── header.ejs       # 관리자 헤더
│   ├── footer.ejs       # 관리자 푸터
│   ├── sidebar.ejs      # 관리자 사이드바
│   └── nav.ejs          # 관리자 네비게이션
│
└── management/          # 각종 관리 페이지
    ├── artwork/         # 작품 관리
    │   ├── list.ejs    # 작품 목록
    │   ├── create.ejs  # 작품 등록
    │   └── edit.ejs    # 작품 수정
    │
    ├── exhibition/     # 전시회 관리
    │   ├── list.ejs   # 전시회 목록
    │   └── edit.ejs   # 전시회 수정
    │
    ├── notice/        # 공지사항 관리
    │   ├── list.ejs   # 공지사항 목록
    │   └── edit.ejs   # 공지사항 수정
    │
    └── user/          # 사용자 관리
        └── list.ejs   # 사용자 목록
```
