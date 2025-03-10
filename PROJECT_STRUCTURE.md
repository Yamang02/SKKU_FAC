# 프로젝트 구조

## 디렉토리 구조

```
SKKU_FAC_GALLERY/
├── src/
│   ├── domain/             # 도메인 계층
│   │   ├── artwork/        # 작품 관련 도메인
│   │   ├── exhibition/     # 전시회 관련 도메인
│   │   ├── notice/         # 공지사항 관련 도메인
│   │   ├── user/           # 사용자 관련 도메인
│   │   ├── comment/        # 댓글 관련 도메인
│   │   ├── image/          # 이미지 관련 도메인
│   │   └── home/           # 홈 관련 도메인
│   ├── application/        # 애플리케이션 계층
│   ├── infrastructure/     # 인프라 계층
│   ├── interface/          # 인터페이스 계층
│   └── presentation/       # 프레젠테이션 계층
│       ├── views/          # EJS 템플릿
│       │   ├── partials/   # 공통 템플릿 조각
│       │   ├── exhibitions/# 전시회 관련 뷰
│       │   └── notices/    # 공지사항 관련 뷰
│       ├── css/            # CSS 파일
│       ├── js/             # 클라이언트 JavaScript
│       └── assets/         # 이미지, 폰트 등 정적 자산
├── app.js                  # 애플리케이션 진입점
├── package.json            # 프로젝트 의존성 관리
└── .env                    # 환경 변수
```

## 도메인별 구조

각 도메인 폴더는 다음과 같은 구조를 가집니다:

```
domain/artwork/
├── entity/                 # 엔티티 정의
├── repository/             # 리포지토리 인터페이스
├── service/                # 도메인 서비스
└── index.js                # 도메인 모듈 진입점
```

## 뷰 구조

각 도메인별 뷰 폴더는 다음과 같은 구조를 가집니다:

```
views/exhibitions/
├── index.ejs               # 전시회 목록 페이지
├── detail.ejs              # 전시회 상세 페이지
└── create.ejs              # 전시회 생성 페이지
```
