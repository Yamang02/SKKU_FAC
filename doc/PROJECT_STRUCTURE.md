# 프로젝트 구조

## 1. 소스 코드 구조

```
src/
├── presentation/     # 프레젠테이션 레이어
│   ├── public/       # 정적 파일
│   │   ├── css/      # 스타일시트
│   │   │   ├── common/   # 공통 스타일
│   │   │   ├── artwork/  # 작품 관련 스타일
│   │   │   ├── exhibition/ # 전시회 관련 스타일
│   │   │   └── user/     # 사용자 관련 스타일
│   │   ├── js/       # 자바스크립트
│   │   │   ├── common/   # 공통 스크립트
│   │   │   └── page/     # 페이지별 스크립트
│   │   │       ├── artwork/
│   │   │       └── exhibition/
│   │   └── images/   # 이미지 리소스
│   └── view/         # EJS 템플릿
│       ├── common/   # 공통 컴포넌트 (헤더, 푸터 등)
│       ├── artwork/  # 작품 관련 페이지
│       ├── exhibition/ # 전시회 관련 페이지
│       └── user/     # 사용자 관련 페이지
└── domain/          # 도메인 레이어
    ├── artwork/     # 작품 도메인
    │   ├── controller/ # 컨트롤러
    │   ├── service/    # 서비스 로직
    │   └── model/      # 데이터 모델
    ├── exhibition/   # 전시회 도메인
    │   ├── controller/
    │   ├── service/
    │   └── model/
    └── user/        # 사용자 도메인
        ├── controller/
        ├── service/
        └── model/
```

## 2. 주요 도메인 구조

### 2.1. 작품 도메인 (Artwork)
- 작품 목록 조회/검색
- 작품 상세 정보
- 작품 필터링 및 정렬
- 작품 카드/테이블 뷰

### 2.2. 전시회 도메인 (Exhibition)
- 전시회 목록 조회/검색
- 전시회 상세 정보
- 전시회 캘린더
- 전시회 캐러셀

### 2.3. 사용자 도메인 (User)
- 사용자 인증/인가
- 프로필 관리
- 권한 관리

## 3. 레이어별 주요 기능

### 3.1. 프레젠테이션 레이어 (Presentation)
- 사용자 인터페이스 구현
  - EJS 템플릿 렌더링
  - 반응형 레이아웃
  - 인터랙티브 UI 컴포넌트
- 클라이언트 사이드 기능
  - 동적 검색/필터링
  - 뷰 전환 애니메이션
  - 캐러셀/슬라이더
- 스타일 관리
  - 모듈화된 CSS
  - 공통 스타일 변수
  - 반응형 스타일링

### 3.2. 도메인 레이어 (Domain)
- 비즈니스 로직 구현
- 데이터 모델 정의
- 서비스 로직 처리
- 컨트롤러 라우팅

## 4. 주요 기술 스택

- Frontend:
  - EJS (템플릿 엔진)
  - Vanilla JavaScript
  - CSS3
  - FontAwesome (아이콘)
- Backend:
  - Node.js
  - Express.js
- 개발 도구:
  - Git (버전 관리)
  - npm (패키지 관리)
