---
description:
globs:
alwaysApply: false
---
# SKKU 갤러리 프로젝트 구조 가이드

## 📁 **프로젝트 구조 개요**

이 프로젝트는 **완전 분리된 백엔드/프론트엔드 구조**를 사용합니다:

```
SKKU_FAC_GALLERY/
├── backend/                    # Express.js API 서버 (Railway)
│   ├── src/                   # 백엔드 소스 코드
│   ├── config/                # Redis, MySQL 설정
│   ├── tests/                 # 테스트 및 Playwright
│   ├── scripts/               # SQL 스크립트
│   ├── docs/                  # 백엔드 문서
│   ├── package.json           # 백엔드 의존성
│   └── railway.json           # Railway 배포 설정
│
├── frontend/                   # React Native Web (Vercel)
│   ├── src/                   # React 컴포넌트
│   ├── config/                # Webpack, Babel 설정
│   ├── public/                # 정적 파일
│   ├── docs/                  # 프론트엔드 문서
│   ├── package.json           # 프론트엔드 의존성
│   └── vercel.json            # Vercel 배포 설정
│
├── legacy-frontend/            # 참고용 바닐라 JS 코드
├── legacy-docs/               # 참고용 문서들
└── package.json               # 워크스페이스 설정
```

## 🎯 **개발 작업 가이드**

### **백엔드 작업 시:**
- **작업 디렉토리**: `backend/` 내에서만 작업
- **실행 명령어**: `npm run dev:backend` (루트에서)
- **테스트**: `npm run test:backend` (루트에서)
- **배포**: Railway에 `backend/` 디렉토리만 배포

### **프론트엔드 작업 시:**
- **작업 디렉토리**: `frontend/` 내에서만 작업
- **실행 명령어**: `npm run dev:frontend` (루트에서)
- **빌드**: `npm run build:frontend` (루트에서)
- **배포**: Vercel에 `frontend/` 디렉토리만 배포

### **API 통신:**
- **개발 환경**: `http://localhost:3000` (백엔드)
- **프로덕션**: `REACT_APP_API_URL` 환경 변수 사용
- **프록시 설정**: [frontend/vercel.json](mdc:frontend/vercel.json) 참조

## 📋 **파일 생성/수정 규칙**

### **✅ DO:**
- 백엔드 파일은 `backend/` 내에만 생성
- 프론트엔드 파일은 `frontend/` 내에만 생성
- 공통 설정은 루트 `package.json`에서 워크스페이스로 관리
- API 설정은 [frontend/src/config/api.js](mdc:frontend/src/config/api.js) 사용

### **❌ DON'T:**
- 루트에 백엔드/프론트엔드 파일 생성 금지
- `src/` 디렉토리 사용 금지 (이미 정리됨)
- 중복된 설정 파일 생성 금지

## 🔧 **TaskMaster AI 작업 가이드**

### **백엔드 태스크 생성 시:**
```markdown
**구현 위치**: backend/src/domain/[도메인]/
**테스트 위치**: backend/tests/
**설정 파일**: backend/config/
**실행 방법**: npm run dev:backend
```

### **프론트엔드 태스크 생성 시:**
```markdown
**구현 위치**: frontend/src/
**컴포넌트**: React Native Web 컴포넌트 사용
**스타일링**: StyleSheet API 사용 (CSS 파일 금지)
**API 호출**: frontend/src/config/api.js 사용
**실행 방법**: npm run dev:frontend
```

### **풀스택 태스크 생성 시:**
```markdown
**백엔드**: backend/src/domain/[도메인]/
**프론트엔드**: frontend/src/components/[컴포넌트]/
**API 연동**: 백엔드 API → 프론트엔드 API 클라이언트
**테스트**: 각각 독립적으로 테스트
```

## 📚 **참고 자료**

### **기존 코드 참조:**
- **바닐라 JS 로직**: [legacy-frontend/original/](mdc:legacy-frontend/original) 참조
- **API 문서**: [legacy-docs/original-swagger.json](mdc:legacy-docs/original-swagger.json) 참조
- **백엔드 가이드**: [backend/docs/requirements/](mdc:backend/docs/requirements) 참조

### **배포 가이드:**
- **백엔드 배포**: [backend/railway.json](mdc:backend/railway.json)
- **프론트엔드 배포**: [frontend/docs/deployment.md](mdc:frontend/docs/deployment.md)

## 🚀 **워크스페이스 명령어**

```bash
# 전체 의존성 설치
npm install

# 개발 서버 실행
npm run dev:backend    # 백엔드만
npm run dev:frontend   # 프론트엔드만
npm run dev           # 둘 다 동시에

# 빌드
npm run build:backend
npm run build:frontend

# 테스트
npm run test:backend
npm run test:frontend
```

이 구조를 따라 작업하면 **완전히 분리된 개발/배포 환경**에서 효율적으로 개발할 수 있습니다.
