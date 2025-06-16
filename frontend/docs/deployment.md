# SKKU 갤러리 Vercel 배포 가이드

## 🏗️ 아키텍처 개요

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Vercel)      │◄──►│   (Railway)     │
│                 │    │                 │
│ React Native    │    │ Express.js      │
│ Web App         │    │ + MySQL         │
│                 │    │ + Redis         │
└─────────────────┘    └─────────────────┘
```

## 🚀 Vercel 배포 설정

### 장점
- React Native Web 최적화
- 자동 빌드 및 배포
- 글로벌 CDN
- 무료 플랜 제공
- GitHub 연동 자동화

### 배포 단계
1. **프로젝트 연결 (이미 완료)**
   - GitHub 저장소와 Vercel 연동 완료

2. **환경 변수 설정**
   - Vercel 대시보드 → Settings → Environment Variables
   - `REACT_APP_API_URL`: Railway 백엔드 URL 입력

3. **빌드 설정 확인**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🔧 환경 설정

### 개발 환경
```bash
# 프론트엔드 개발 서버
npm run dev

# 백엔드 개발 서버 (별도 터미널)
cd backend
npm run dev
```

### 프로덕션 환경
```bash
# 프론트엔드 빌드
npm run build

# 프리뷰 (로컬)
npm run preview
```

## 🌐 도메인 설정

### 도메인 구조
- Frontend: `your-project.vercel.app` (자동 생성) 또는 커스텀 도메인
- Backend API: Railway에서 제공하는 도메인

### CORS 설정
백엔드에서 Vercel 도메인 허용:
```javascript
// backend/src/infrastructure/web/middleware/cors.js
const corsOptions = {
  origin: [
    'http://localhost:3002',
    'https://your-project.vercel.app',
    // 커스텀 도메인이 있다면 추가
  ],
  credentials: true
};
```

## 📊 모니터링 및 분석

### 성능 모니터링
- Vercel Analytics
- Google Analytics
- Web Vitals 추적

### 에러 추적
- Sentry 통합
- 로그 수집 및 분석

## 🔒 보안 설정

### 환경 변수 관리
```bash
# .env.production
REACT_APP_API_URL=https://your-railway-backend.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### 보안 헤더
`vercel.json`에 이미 기본 보안 헤더가 설정되어 있습니다:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

## 🚨 트러블슈팅

### 일반적인 문제들

1. **API 연결 실패**
   - CORS 설정 확인
   - 환경 변수 확인
   - 네트워크 연결 상태 확인

2. **빌드 실패**
   - Node.js 버전 확인 (18+)
   - 의존성 설치 확인
   - TypeScript 오류 해결

3. **라우팅 문제**
   - SPA 라우팅 설정 확인
   - 404 페이지 설정

## 📈 성능 최적화

### Vercel 최적화
- 자동 이미지 최적화 (Vercel Image Optimization)
- 자동 번들 분할 및 압축
- 글로벌 CDN 캐싱
- 자동 성능 모니터링

## 📝 Vercel 배포 체크리스트

- [ ] GitHub 연동 확인 (이미 완료)
- [ ] Vercel 환경 변수 설정 (`REACT_APP_API_URL`)
- [ ] Railway 백엔드 URL 확인
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] API 연결 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 반응형 테스트
- [ ] Vercel Analytics 설정 (선택사항)
- [ ] 커스텀 도메인 설정 (선택사항)

## 🔄 배포 프로세스

1. **코드 푸시**: `main` 브랜치에 푸시
2. **자동 빌드**: Vercel이 자동으로 빌드 시작
3. **배포 완료**: 빌드 성공 시 자동 배포
4. **URL 확인**: `your-project.vercel.app`에서 확인
