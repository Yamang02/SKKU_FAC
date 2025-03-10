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

## 2. CSS 코드 컨벤션

### 2.1. 기본 규칙
- **들여쓰기**: 4칸 공백
- **문자열**: 작은따옴표(`'`) 사용
- **선택자 클래스 패턴**: BEM 방식 권장 (`block__element--modifier`)
- **색상 코드**: 소문자 사용, 가능한 짧게 표현
- **색상 이름**: 직접 사용 금지 (예: `white` 대신 `#fff` 사용)
- **최대 중첩 깊이**: 3

### 2.2. 속성 선언 순서
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
