# SKKU 순수미술동아리 갤러리 - React Native Web Frontend

성균관대학교 순수미술동아리 갤러리의 React Native Web 크로스플랫폼 애플리케이션입니다.
하나의 코드베이스로 웹과 모바일 앱을 모두 지원합니다.

## 개발 환경 설정

### 필수 요구사항
- Node.js 14.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run start:react
   # 또는
   npm run dev:react
   ```
   - 개발 서버는 `http://localhost:3002`에서 실행됩니다
   - 백엔드 API는 `http://localhost:3000`에서 실행되어야 합니다

3. **프로덕션 빌드**
   ```bash
   npm run build:react
   ```
   - 빌드된 파일은 `dist/` 폴더에 생성됩니다

## 프로젝트 구조

```
src/frontend/react/
├── components/     # 재사용 가능한 React 컴포넌트
├── pages/         # 페이지 컴포넌트
├── hooks/         # 커스텀 React 훅
├── services/      # API 서비스 함수들
├── utils/         # 유틸리티 함수들
├── styles/        # CSS 스타일 파일들
├── public/        # 정적 파일들
├── App.js         # 메인 App 컴포넌트
└── index.js       # 애플리케이션 엔트리 포인트
```

## 개발 가이드

### API 통신
- 백엔드 API는 개발 환경에서 자동으로 프록시됩니다
- API 엔드포인트: `/api/*`, `/auth/*`, `/admin/*`

### 스타일링
- React Native StyleSheet API 사용
- 크로스플랫폼 스타일링으로 웹과 모바일에서 일관된 UI
- Flexbox 레이아웃 시스템

### 빌드 설정
- Webpack을 사용한 웹 번들링 (React Native Web)
- Metro를 사용한 모바일 번들링 (향후 추가 예정)
- Babel을 통한 React Native 코드 변환
- TypeScript 지원 (선택사항)

## 사용 가능한 스크립트

- `npm run start:react` - 개발 서버 실행
- `npm run dev:react` - 개발 서버 실행 (별칭)
- `npm run build:react` - 프로덕션 빌드
- `npm run build:react:dev` - 개발 빌드

## 환경 설정

개발 환경에서는 백엔드 서버가 `http://localhost:3000`에서 실행되어야 합니다.
다른 포트를 사용하는 경우 `webpack.dev.js`의 프록시 설정을 수정하세요.
