# 프로젝트 구조

```
src/
├── domain/                     # 도메인 계층
│   ├── common/                 # 공통 모듈
│   ├── artwork/                # 작품 도메인
│   │   ├── entity/            # 엔티티
│   │   ├── service/           # 서비스
│   │   └── dto/               # DTO
│   ├── exhibition/            # 전시회 도메인
│   ├── notice/                # 공지사항 도메인
│   ├── user/                  # 사용자 도메인
│   │   ├── entity/           # 엔티티
│   │   ├── service/          # 서비스
│   │   └── dto/              # DTO
│   ├── home/                  # 홈 도메인
│   └── comment/               # 댓글 도메인
│
├── application/               # 애플리케이션 계층
│   ├── common/                # 공통 유스케이스
│   ├── artwork/               # 작품 유스케이스
│   ├── exhibition/            # 전시회 유스케이스
│   ├── notice/                # 공지사항 유스케이스
│   ├── user/                  # 사용자 유스케이스
│   ├── home/                  # 홈 유스케이스
│   ├── admin/                 # 관리자 유스케이스
│   └── comment/               # 댓글 유스케이스
│
├── interface/                # 인터페이스 계층
│   ├── controller/           # 컨트롤러
│   ├── middleware/           # 미들웨어
│   ├── router/              # 라우터
│   │   ├── user/           # 사용자 라우터
│   │   ├── artwork/        # 작품 라우터
│   │   └── notice/         # 공지사항 라우터
│   └── util/                # 유틸리티
│
├── infrastructure/          # 인프라스트럭처 계층
│   ├── config/             # 설정 파일
│   │   └── di/            # 의존성 주입 설정
│   ├── data/              # 데이터 소스
│   ├── repository/        # 리포지토리 구현
│   └── db/                # 데이터베이스 관련
│
└── presentation/           # 프레젠테이션 계층
    ├── view/              # 뷰 템플릿
    │   ├── common/        # 공통 템플릿
    │   ├── user/          # 사용자 관련 템플릿
    │   ├── artwork/       # 작품 관련 템플릿
    │   └── notice/        # 공지사항 관련 템플릿
    ├── components/        # 재사용 가능한 컴포넌트
    │   ├── Button/        # 버튼 컴포넌트
    │   ├── Form/          # 폼 컴포넌트
    │   └── Modal/         # 모달 컴포넌트
    └── public/            # 정적 파일
        ├── css/           # CSS 파일
        │   ├── common/    # 공통 스타일
        │   ├── user/      # 사용자 관련 스타일
        │   └── components/# 컴포넌트 스타일
        ├── js/            # JavaScript 파일
        └── images/        # 이미지 파일
```

## 주요 디렉토리 설명

### domain/
- **common/**: 공통으로 사용되는 모듈
- **[도메인]/**: 각 도메인별 엔티티, 서비스, DTO

### application/
- **common/**: 공통으로 사용되는 유스케이스
- **[도메인]/**: 각 도메인별 유스케이스

### interface/
- **controller/**: HTTP 요청 처리
- **middleware/**: 인증, 로깅 등 미들웨어
- **router/**: 라우트 정의
- **util/**: 유틸리티 함수

### infrastructure/
- **config/**: 설정 파일 (DI 등)
- **data/**: JSON 데이터 파일
- **repository/**: 리포지토리 구현체
- **db/**: 데이터베이스 관련 설정

### presentation/
- **view/**: EJS 템플릿 파일
- **components/**: 재사용 가능한 컴포넌트
- **public/**: 정적 파일 (이미지, CSS, JS 등)
