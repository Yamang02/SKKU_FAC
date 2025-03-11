# 프로젝트 구조

## 1. 디렉토리 구조

```
SKKU_FAC_GALLERY/
├── app.js                  # 애플리케이션 진입점
├── config/                 # 설정 파일
│   ├── .env                # 환경 변수
│   ├── .eslintrc.json      # ESLint 설정
│   └── .stylelintrc.json   # Stylelint 설정
├── doc/                    # 문서
├── node_modules/           # 노드 모듈
├── .vscode/                # VS Code 설정
├── .git/                   # Git 저장소
├── .gitignore              # Git 무시 파일 목록
├── LICENSE                 # 라이센스 파일
├── package.json            # 패키지 정보
├── package-lock.json       # 패키지 의존성 잠금 파일
├── README.md               # 프로젝트 설명서
└── src/                    # 소스 코드
    ├── application/        # 애플리케이션 레이어
    ├── domain/             # 도메인 레이어
    │   └── [도메인]/       # 각 도메인 디렉토리
    │       ├── controller/ # 도메인 컨트롤러
    │       ├── dto/        # 데이터 전송 객체
    │       ├── entity/     # 도메인 엔티티
    │       └── service/    # 도메인 서비스
    ├── infrastructure/     # 인프라 레이어
    │   ├── db/             # 데이터베이스 연결
    │   └── data/           # 정적 데이터
    ├── interface/          # 인터페이스 레이어
    │   └── router/         # 라우터
    │       ├── index.js    # 통합 라우터
    │       └── [도메인]/   # 도메인별 라우터
    └── presentation/       # 프레젠테이션 레이어
        ├── asset/          # 정적 자산
        │   └── image/      # 이미지 파일
        ├── css/            # CSS 파일
        │   ├── style.css   # 메인 스타일 파일
        │   ├── common/     # 공통 스타일
        │   └── [도메인]/   # 도메인별 스타일
        ├── js/             # 클라이언트 JavaScript
        │   ├── index.js    # 메인 JavaScript 파일
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
├── head.ejs               # 헤드 템플릿
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
├── util/                  # 유틸리티 함수
    ├── index.js           # 유틸리티 모듈 진입점
    ├── animation.js       # 애니메이션 관련 유틸리티
    ├── dom.js             # DOM 조작 유틸리티
    ├── modal.js           # 모달 관련 유틸리티
    └── notification.js    # 알림 관련 유틸리티
```

## 3. 도메인별 JavaScript 구조

각 도메인별 JavaScript 파일은 다음과 같은 구조로 관리됩니다:

```
src/presentation/js/[도메인]/
├── [페이지]/              # 페이지별 모듈
│   ├── index.js           # 진입점
│   └── [모듈].js          # 기능별 모듈
└── common/                # 도메인 공통 모듈
    ├── api.js             # API 호출 함수
    └── util.js            # 유틸리티 함수
```

## 4. 도메인별 CSS 구조

각 도메인별 CSS 파일은 다음과 같은 구조로 관리됩니다:

```
src/presentation/css/[도메인]/
├── [페이지].css           # 페이지별 스타일 (간단한 경우)
└── [페이지]/              # 페이지별 스타일 디렉토리 (복잡한 경우)
    ├── index.css          # 페이지 스타일 진입점
    ├── layout.css         # 페이지 레이아웃 스타일
    ├── components.css     # 페이지 컴포넌트 스타일
    └── [모듈].css         # 특정 모듈 스타일
```

일반적으로는 `[페이지].css` 파일만 있지만, CSS 내용이 많아지면 `[페이지].css`는 진입점으로 사용되고 `[페이지]` 디렉토리 아래에 세부 스타일 파일들이 생성됩니다.

## 5. 도메인 구조

각 도메인은 다음과 같은 구조로 관리됩니다:

```
src/domain/[도메인]/
├── controller/            # 도메인 컨트롤러
├── dto/                   # 데이터 전송 객체
├── entity/                # 도메인 엔티티
└── service/               # 도메인 서비스
```

현재 프로젝트에는 다음과 같은 도메인이 있습니다:
- artwork: 작품 관련 도메인
- comment: 댓글 관련 도메인
- exhibition: 전시 관련 도메인
- home: 홈 관련 도메인
- image: 이미지 관련 도메인
- notice: 공지사항 관련 도메인
- user: 사용자 관련 도메인
