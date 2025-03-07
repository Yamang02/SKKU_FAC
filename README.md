# SKKU Faculty Art Gallery

성균관대학교 교수진 작품 갤러리 웹사이트입니다.

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

### 사용되지 않는 코드 확인 방법

1. ESLint를 사용하여 사용되지 않는 변수 및 함수 확인
2. Stylelint를 사용하여 중복된 CSS 규칙 확인
3. 브라우저 개발자 도구의 Coverage 탭을 사용하여 실행 시 사용되지 않는 코드 확인

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
``` 