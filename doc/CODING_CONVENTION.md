# SKKU 교수 아트 갤러리 코드 컨벤션

이 문서는 SKKU SFA 프로젝트의 코드 작성 규칙을 정의합니다.

## 1. JavaScript 코드 컨벤션

### 1.1. 기본 규칙
- **들여쓰기**: 4칸 공백
- **줄바꿈 스타일**: LF (Unix 스타일)
- **문자열**: 작은따옴표(`'`) 사용
- **세미콜론**: 항상 사용
- **변수 선언**: `const`, `let` 사용 (`var` 사용 금지)
- **최대 줄 길이**: 200자
- **객체 중괄호 안에 공백 필수**: `{ prop: value }`
- **함수 괄호 앞에 공백 없음**: `function name()`
- **최대 중첩 깊이**: 3
- **콘솔 로그**: `console.warn`, `console.error`만 허용
- **언더스코어**: 특정 경우(`_id`, `__dirname`, `__filename`)를 제외하고 사용 금지

### 1.2. 네이밍 규칙
- **변수, 함수**: camelCase
- **클래스**: PascalCase
- **상수**: UPPER_SNAKE_CASE
- **파일명**: 역할에 따라 다름
  - 클래스: PascalCase (예: `UserService.js`)
  - 일반 모듈: camelCase (예: `utils.js`)
  - DTO 클래스: PascalCase + Dto (예: `UserDto.js`)
- **폴더명**: 항상 단수형 사용 (예: `route`, `controller`, `model`)
  - 복수형 사용 금지 (예: `routes`, `controllers`, `models` 대신 `route`, `controller`, `model` 사용)

### 1.3. 파일 구조 규칙
- **도메인 디렉토리 구조**:
  - 도메인별 디렉토리: `domain/[도메인명]/`
  - 컨트롤러: `domain/[도메인명]/controller/`
  - 서비스: `domain/[도메인명]/service/`
  - DTO: `domain/[도메인명]/dto/`
  - 엔티티: `domain/[도메인명]/entity/`

- **인터페이스 디렉토리 구조**:
  - 라우터 디렉토리: `interface/router/`
  - 도메인별 라우터: `interface/router/[도메인명]/`
  - 라우터 파일: `interface/router/[도메인명]/router.js`

- **프레젠테이션 디렉토리 구조**:
  - CSS 파일: `presentation/css/[도메인명]/[페이지명].css`
  - JS 파일: `presentation/js/[도메인명]/[페이지명].js`
  - 뷰 파일: `presentation/view/[도메인명]/[페이지명].ejs`
  - 공통 컴포넌트: `presentation/[css|js|view]/common/`

## 2. CSS 코드 컨벤션

### 2.1. 기본 규칙
- **들여쓰기**: 4칸 공백
- **문자열**: 작은따옴표(`'`) 사용
- **선택자 클래스 패턴**: BEM 방식 권장 (`block__element--modifier`)
- **색상 코드**: 소문자 사용, 가능한 짧게 표현
- **색상 이름**: 직접 사용 금지 (예: `white` 대신 `#fff` 사용)
- **최대 중첩 깊이**: 3

### 2.2. CSS 변수 네이밍 규칙
- **색상 변수**: `--color-` 접두사 사용
  - 예: `--color-primary`, `--color-secondary`, `--color-background`
  - 색상 변형: `-light`, `-dark` 접미사 사용 (예: `--color-primary-light`)
- **간격 변수**: `--spacing-` 접두사 사용
  - 예: `--spacing-xs`, `--spacing-sm`, `--spacing-md`
- **테두리 반경 변수**: `--border-radius-` 접두사 사용
  - 예: `--border-radius-sm`, `--border-radius-md`
- **그림자 변수**: `--shadow-` 접두사 사용
  - 예: `--shadow-sm`, `--shadow-md`
- **전환 변수**: `--transition-` 접두사 사용
  - 예: `--transition-fast`, `--transition-normal`
- **z-index 변수**: `--z-index-` 접두사 사용
  - 예: `--z-index-modal`, `--z-index-dropdown`

### 2.3. 파일 네이밍 규칙
- **메인 CSS 파일**: 페이지 또는 컴포넌트 이름 사용 (예: `detail.css`, `header.css`)
- **언더스코어 사용 금지**: 파일명에 언더스코어(`_`) 사용 금지
- **파일명 패턴**:
  - 페이지 진입점: `[페이지명].css` (예: `detail.css`, `index.css`)
  - 모듈 파일: `[모듈명].css` (예: `layout.css`, `info.css`)
  - 공통 컴포넌트: `[컴포넌트명].css` (예: `modal.css`)
- **디렉토리 구조**:
  - 도메인별 디렉토리: `css/[도메인명]/` (예: `css/artwork/`)
  - 공통 스타일: `css/common/`
  - 기본 스타일: `css/common/base/`
  - 컴포넌트 스타일: `css/common/components/`
  - 레이아웃 스타일: `css/common/layout/`
  - 유틸리티 스타일: `css/common/util/`

### 2.4. 속성 선언 순서
1. 위치 (position, top, right, bottom, left, z-index)
2. 표시 (display, visibility, overflow)
3. 박스 모델 (width, height, margin, padding, border)
4. 배경 (background)
5. 글꼴 (font, line-height, letter-spacing, text-align, text-decoration)
6. 기타 (opacity, cursor)

## 3. HTML 코드 컨벤션

### 3.1. 기본 규칙
- **들여쓰기**: 4칸 공백
- **태그와 속성**: 소문자로 작성
- **속성값**: 큰따옴표(`"`)로 묶기
- **빈 요소**: 닫는 태그 사용 (`<br>` 대신 `<br />`)
- **DOCTYPE 선언**: HTML5 사용
- **인코딩 선언**: UTF-8 사용

### 3.2. 구조화 규칙
- 시맨틱 태그 적극 활용 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` 등)
- 접근성을 고려한 마크업 (적절한 ARIA 속성 사용)
- 중첩은 가능한 최소화

## 4. 코드 검사 및 자동 수정

### 4.1. 명령어
- JavaScript 코드 검사: `npm run lint`
- JavaScript 코드 자동 수정: `npm run lint:fix`
- CSS 코드 검사: `npm run lint:css`
- CSS 코드 자동 수정: `npm run lint:css:fix`
- 전체 코드 검사: `npm run analyze`

### 4.2. 에디터 설정
VS Code에서 작업할 경우 다음 확장 프로그램을 설치하세요:
- ESLint
- Stylelint

## 5. 참고 자료
- [NHN 코딩 컨벤션](NHN_Coding_Conventions_for_Markup.txt)
- [ESLint 설정 파일](.eslintrc.json)
- [Stylelint 설정 파일](.stylelintrc.json)
