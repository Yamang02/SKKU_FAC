# 프로젝트 구조

## 1. 디렉토리 구조

```
SKKU_FAC_GALLERY/
├── app.js                  # 애플리케이션 진입점
├── config/                 # 설정 파일
│   ├── .env                # 환경 변수
│   ├── .eslintrc.json      # ESLint 설정
│   └── .stylelintrc.json   # Stylelint 설정
├── docs/                   # 문서
└── src/                    # 소스 코드
    ├── domain/             # 도메인 레이어
    │   ├── [도메인]/       # 각 도메인 디렉토리
    │   │   ├── controller/ # 도메인 컨트롤러
    │   │   ├── dto/        # 데이터 전송 객체
    │   │   ├── entity/     # 도메인 엔티티
    │   │   └── service/    # 도메인 서비스
    ├── infrastructure/     # 인프라 레이어
    │   ├── db/             # 데이터베이스 연결
    │   ├── data/           # 정적 데이터
    ├── interface/          # 인터페이스 레이어
    │   └── router/         # 라우터
    │       ├── index.js    # 통합 라우터
    │       └── [도메인]/   # 도메인별 라우터
    └── presentation/       # 프레젠테이션 레이어
        ├── asset/          # 정적 자산
        │   └── image/      # 이미지 파일
        ├── css/            # CSS 파일
        │   ├── common/     # 공통 스타일
        │   └── [도메인]/   # 도메인별 스타일
        ├── js/             # 클라이언트 JavaScript
        │   ├── common/     # 공통 JavaScript
        │   └── [도메인]/   # 도메인별 JavaScript
        └── view/           # EJS 템플릿
            ├── common/     # 공통 템플릿
            └── [도메인]/   # 도메인별 템플릿
```

## 2. 레이어별 Common 폴더 구조

### 2.1. presentation/view/common

공통 템플릿 조각들을 포함합니다.

```
src/presentation/view/common/
├── error.ejs              # 에러 페이지 템플릿
├── footer.ejs             # 푸터 템플릿
├── header.ejs             # 헤더 템플릿
└── pagination.ejs         # 페이지네이션 템플릿
```

### 2.2. presentation/css/common

공통 스타일 파일들을 포함합니다.

```
src/presentation/css/common/
├── base/                  # 기본 스타일
│   ├── media-queries.css  # 미디어 쿼리 정의
│   ├── reset.css          # CSS 리셋
│   ├── typography.css     # 타이포그래피 스타일
│   └── variables.css      # CSS 변수
├── components/            # 컴포넌트 스타일
│   ├── card.css           # 카드 컴포넌트 스타일
│   ├── header.css         # 헤더 컴포넌트 스타일
│   ├── modal.css          # 모달 컴포넌트 스타일
│   └── nav.css            # 네비게이션 컴포넌트 스타일
├── layout/                # 레이아웃 스타일
│   ├── container.css      # 컨테이너 스타일
│   ├── grid.css           # 그리드 시스템 스타일
│   └── main.css           # 메인 레이아웃 스타일
├── util/                  # 유틸리티 스타일
│   ├── animations.css     # 애니메이션 스타일
│   ├── common.css         # 공통 유틸리티 스타일
│   └── helpers.css        # 헬퍼 클래스 스타일
└── error.css              # 에러 페이지 스타일
```

### 2.3. presentation/js/common

공통 JavaScript 파일들을 포함합니다.

```
src/presentation/js/common/
├── components/            # 공통 컴포넌트
│   ├── artwork.js         # 작품 관련 컴포넌트
│   ├── artworkGrid.js     # 작품 그리드 컴포넌트
│   └── layout.js          # 레이아웃 컴포넌트
└── util/                  # 유틸리티 함수
    ├── index.js           # 유틸리티 모듈 진입점
    ├── animation.js       # 애니메이션 관련 유틸리티
    ├── dom.js             # DOM 조작 유틸리티
    ├── modal.js           # 모달 관련 유틸리티
    └── notification.js    # 알림 관련 유틸리티
```

## 4. 도메인별 JavaScript 구조

각 도메인별 JavaScript 파일은 다음과 같은 구조로 관리됩니다:

```
src/presentation/js/[도메인]/
├── list/                   # 목록 페이지 관련 모듈
│   ├── index.js            # 진입점
│   ├── filter.js           # 필터 기능
│   ├── gallery.js          # 갤러리 표시 기능
│   ├── search.js           # 검색 기능
│   └── pagination.js       # 페이지네이션 기능
├── detail/                 # 상세 페이지 관련 모듈
│   ├── index.js            # 진입점
│   ├── viewer.js           # 작품 뷰어 기능
│   ├── comment.js          # 댓글 기능
│   └── related.js          # 관련 작품 기능
├── main/                   # 메인 페이지 관련 모듈 (홈 도메인)
│   ├── index.js            # 진입점
│   ├── hero.js             # 히어로 섹션 기능
│   ├── featured.js         # 추천 작품 기능
│   └── modal.js            # 모달 기능
└── common/                 # 도메인 공통 모듈
    ├── api.js              # API 호출 함수
    ├── util.js             # 유틸리티 함수
    ├── animation.js        # 애니메이션 함수
    └── modal.js            # 모달 관련 함수
```

예를 들어, artwork 도메인의 경우:

```
src/presentation/js/artwork/
├── list/                   # 작품 목록 페이지 관련 모듈
│   ├── index.js            # 진입점
│   ├── filter.js           # 필터 기능
│   ├── gallery.js          # 갤러리 표시 기능
│   ├── search.js           # 검색 기능
│   └── pagination.js       # 페이지네이션 기능
├── detail/                 # 작품 상세 페이지 관련 모듈
│   ├── index.js            # 진입점
│   ├── viewer.js           # 작품 뷰어 기능
│   ├── related.js          # 관련 작품 기능
│   └── comment.js          # 댓글 기능
└── common/                 # 작품 도메인 공통 모듈
    ├── api.js              # API 호출 함수
    ├── util.js             # 유틸리티 함수
    ├── animation.js        # 애니메이션 함수
    └── modal.js            # 모달 관련 함수
```

그리고 home 도메인의 경우:

```
src/presentation/js/home/
├── main/                   # 홈 메인 페이지 관련 모듈
│   ├── index.js            # 진입점
│   ├── hero.js             # 히어로 섹션 기능
│   ├── featured.js         # 추천 작품 기능
│   └── modal.js            # 모달 기능
└── common/                 # 홈 도메인 공통 모듈
    ├── api.js              # API 호출 함수
    └── util.js             # 유틸리티 함수
```

그리고 exhibition 도메인의 경우:

```
src/presentation/js/exhibition/
├── list/                   # 전시 목록 페이지 관련 모듈
│   ├── index.js            # 진입점
│   ├── grid.js             # 그리드 기능
│   └── modal.js            # 모달 기능
├── detail/                 # 전시 상세 페이지 관련 모듈
│   ├── index.js            # 진입점
│   ├── image.js            # 이미지 로더 기능
│   └── filter.js           # 필터 기능
└── common/                 # 전시 도메인 공통 모듈
    ├── api.js              # API 호출 함수
    └── util.js             # 유틸리티 함수
```

## 5. 도메인별 CSS 구조

각 도메인별 CSS 파일은 다음과 같은 구조로 관리됩니다:

```
src/presentation/css/[도메인]/
├── index.css              # 도메인 목록 페이지 스타일
└── detail.css             # 도메인 상세 페이지 스타일
```

예를 들어, artwork 도메인의 경우:

```
src/presentation/css/artwork/
├── index.css              # 작품 목록 페이지 스타일
└── detail.css             # 작품 상세 페이지 스타일
```
