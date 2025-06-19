# 🏗️ SKKU Gallery Frontend-New 프로젝트 구조 설계

## 📋 개요

SKKU Gallery의 새로운 프론트엔드는 **React + TypeScript + Vite + Ant Design + Tailwind CSS**를 기반으로 하는 현대적인 웹 애플리케이션입니다. 기존 frontend의 API 로직과 인증 시스템을 TypeScript로 완전히 재작성하면서, 더 나은 개발자 경험과 유지보수성을 제공합니다.

## 🎯 설계 원칙

### 1. **모듈화와 관심사 분리**
- 각 도메인별로 독립적인 구조
- 재사용 가능한 컴포넌트 중심 설계
- 비즈니스 로직과 UI 로직 분리

### 2. **타입 안정성**
- 모든 API 응답과 데이터 구조에 대한 TypeScript 타입 정의
- 컴파일 타임 에러 방지
- IDE 자동완성 및 리팩토링 지원

### 3. **성능 최적화**
- 코드 스플리팅 및 레이지 로딩
- React Query를 통한 효율적인 데이터 페칭
- 메모이제이션을 통한 불필요한 리렌더링 방지

### 4. **개발자 경험**
- 일관된 코딩 스타일 (ESLint + Prettier)
- 개발 도구 통합 (Vite Dev Tools)
- 핫 리로드 및 빠른 빌드

## 📁 프로젝트 구조

```
frontend-new/
├── public/                          # 정적 파일
│   ├── index.html                   # HTML 템플릿
│   ├── favicon.ico                  # 파비콘
│   └── assets/                      # 정적 이미지, 아이콘
│
├── src/                             # 소스 코드 루트
│   ├── main.tsx                     # 애플리케이션 진입점
│   ├── App.tsx                      # 루트 컴포넌트
│   ├── vite-env.d.ts               # Vite 타입 정의
│   │
│   ├── components/                  # 재사용 가능한 컴포넌트
│   │   ├── common/                  # 공통 컴포넌트
│   │   │   ├── Button/              # 버튼 컴포넌트
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── Button.styles.ts
│   │   │   ├── Modal/               # 모달 컴포넌트
│   │   │   ├── Table/               # 테이블 컴포넌트
│   │   │   ├── Form/                # 폼 컴포넌트
│   │   │   ├── Loading/             # 로딩 컴포넌트
│   │   │   └── ErrorBoundary/       # 에러 바운더리
│   │   ├── layout/                  # 레이아웃 컴포넌트
│   │   │   ├── AdminLayout/         # 관리자 레이아웃
│   │   │   ├── PublicLayout/        # 일반 사용자 레이아웃
│   │   │   ├── Header/              # 헤더
│   │   │   ├── Sidebar/             # 사이드바
│   │   │   └── Footer/              # 푸터
│   │   └── domain/                  # 도메인별 컴포넌트
│   │       ├── auth/                # 인증 관련
│   │       ├── user/                # 사용자 관련
│   │       ├── artwork/             # 작품 관련
│   │       └── exhibition/          # 전시 관련
│   │
│   ├── pages/                       # 페이지 컴포넌트
│   │   ├── admin/                   # 관리자 페이지
│   │   │   ├── Dashboard/           # 대시보드
│   │   │   ├── UserManagement/      # 사용자 관리
│   │   │   ├── ArtworkManagement/   # 작품 관리
│   │   │   └── ExhibitionManagement/ # 전시 관리
│   │   ├── public/                  # 일반 사용자 페이지
│   │   │   ├── Home/                # 홈
│   │   │   ├── Gallery/             # 갤러리
│   │   │   ├── Exhibition/          # 전시 상세
│   │   │   └── About/               # 소개
│   │   └── auth/                    # 인증 페이지
│   │       ├── Login/               # 로그인
│   │       ├── Register/            # 회원가입
│   │       └── ForgotPassword/      # 비밀번호 찾기
│   │
│   ├── hooks/                       # 커스텀 훅
│   │   ├── common/                  # 공통 훅
│   │   │   ├── useLocalStorage.ts   # 로컬스토리지 훅
│   │   │   ├── useDebounce.ts       # 디바운스 훅
│   │   │   └── useIntersectionObserver.ts # 무한스크롤 등
│   │   ├── api/                     # API 관련 훅
│   │   │   ├── useAuth.ts           # 인증 훅
│   │   │   ├── useUsers.ts          # 사용자 API 훅
│   │   │   ├── useArtworks.ts       # 작품 API 훅
│   │   │   └── useExhibitions.ts    # 전시 API 훅
│   │   └── form/                    # 폼 관련 훅
│   │       ├── useForm.ts           # 폼 상태 관리
│   │       └── useValidation.ts     # 유효성 검사
│   │
│   ├── services/                    # 외부 서비스 연동
│   │   ├── api/                     # API 서비스
│   │   │   ├── httpClient.ts        # HTTP 클라이언트 (axios)
│   │   │   ├── endpoints.ts         # API 엔드포인트 정의
│   │   │   ├── auth.api.ts          # 인증 API
│   │   │   ├── user.api.ts          # 사용자 API
│   │   │   ├── artwork.api.ts       # 작품 API
│   │   │   └── exhibition.api.ts    # 전시 API
│   │   ├── storage/                 # 스토리지 서비스
│   │   │   ├── localStorage.ts      # 로컬스토리지 래퍼
│   │   │   └── sessionStorage.ts    # 세션스토리지 래퍼
│   │   └── notification/            # 알림 서비스
│   │       └── toast.ts             # 토스트 알림
│   │
│   ├── stores/                      # 상태 관리 (Zustand)
│   │   ├── authStore.ts             # 인증 상태
│   │   ├── userStore.ts             # 사용자 상태
│   │   ├── uiStore.ts               # UI 상태 (모달, 로딩 등)
│   │   └── index.ts                 # 스토어 통합
│   │
│   ├── contexts/                    # React Context
│   │   ├── AuthContext.tsx          # 인증 컨텍스트
│   │   ├── ThemeContext.tsx         # 테마 컨텍스트
│   │   └── index.ts                 # 컨텍스트 통합
│   │
│   ├── utils/                       # 유틸리티 함수
│   │   ├── auth/                    # 인증 관련 유틸
│   │   │   ├── tokenManager.ts      # JWT 토큰 관리
│   │   │   ├── csrfManager.ts       # CSRF 토큰 관리
│   │   │   └── permissions.ts       # 권한 체크
│   │   ├── format/                  # 포맷팅 유틸
│   │   │   ├── date.ts              # 날짜 포맷팅
│   │   │   ├── currency.ts          # 통화 포맷팅
│   │   │   └── text.ts              # 텍스트 처리
│   │   ├── validation/              # 유효성 검사
│   │   │   ├── schemas.ts           # Zod 스키마
│   │   │   └── rules.ts             # 검증 규칙
│   │   ├── constants.ts             # 상수 정의
│   │   ├── helpers.ts               # 헬퍼 함수
│   │   └── index.ts                 # 유틸 통합
│   │
│   ├── types/                       # TypeScript 타입 정의
│   │   ├── api/                     # API 응답 타입
│   │   │   ├── auth.types.ts        # 인증 API 타입
│   │   │   ├── user.types.ts        # 사용자 API 타입
│   │   │   ├── artwork.types.ts     # 작품 API 타입
│   │   │   ├── exhibition.types.ts  # 전시 API 타입
│   │   │   └── common.types.ts      # 공통 API 타입
│   │   ├── components/              # 컴포넌트 Props 타입
│   │   │   └── common.types.ts      # 공통 컴포넌트 타입
│   │   ├── stores/                  # 스토어 타입
│   │   │   └── index.ts             # 스토어 타입 통합
│   │   ├── global.types.ts          # 전역 타입
│   │   └── index.ts                 # 타입 통합
│   │
│   ├── styles/                      # 스타일 파일
│   │   ├── globals.css              # 전역 스타일
│   │   ├── components/              # 컴포넌트별 스타일
│   │   ├── pages/                   # 페이지별 스타일
│   │   ├── themes/                  # 테마 관련
│   │   │   ├── light.ts             # 라이트 테마
│   │   │   ├── dark.ts              # 다크 테마
│   │   │   └── index.ts             # 테마 통합
│   │   └── variables.css            # CSS 변수
│   │
│   ├── assets/                      # 정적 자산
│   │   ├── images/                  # 이미지
│   │   ├── icons/                   # 아이콘
│   │   └── fonts/                   # 폰트
│   │
│   └── config/                      # 설정 파일
│       ├── env.ts                   # 환경변수 설정
│       ├── routes.ts                # 라우트 설정
│       ├── api.config.ts            # API 설정
│       └── app.config.ts            # 앱 설정
│
├── .env.development                 # 개발 환경변수
├── .env.production                  # 프로덕션 환경변수
├── .env.local                       # 로컬 환경변수
├── .gitignore                       # Git 무시 파일
├── .eslintrc.json                   # ESLint 설정
├── .prettierrc                      # Prettier 설정
├── tsconfig.json                    # TypeScript 설정
├── tsconfig.app.json                # 앱용 TypeScript 설정
├── tsconfig.node.json               # Node용 TypeScript 설정
├── vite.config.ts                   # Vite 설정
├── tailwind.config.js               # Tailwind CSS 설정
├── postcss.config.js                # PostCSS 설정
├── package.json                     # 패키지 정보
└── README.md                        # 프로젝트 문서
```

## 🔧 기술 스택 상세

### **Core**
- **React 19.1.0**: 최신 React 기능 활용
- **TypeScript 5.8.3**: 타입 안정성
- **Vite 6.3.5**: 빠른 개발 서버 및 빌드

### **UI Framework**
- **Ant Design 5.26.1**: 엔터프라이즈급 UI 컴포넌트
- **Tailwind CSS 4.1.10**: 유틸리티 우선 CSS 프레임워크
- **@ant-design/icons**: 아이콘 라이브러리

### **State Management**
- **Zustand**: 경량 상태 관리 (추가 예정)
- **React Query**: 서버 상태 관리 (추가 예정)
- **React Context**: 전역 컨텍스트

### **HTTP Client & API**
- **Axios 1.10.0**: HTTP 클라이언트
- **React Router DOM 7.6.2**: 클라이언트 사이드 라우팅

### **Development Tools**
- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅
- **TypeScript ESLint**: TypeScript 린팅

### **Build & Deployment**
- **Vite**: 번들러
- **PostCSS**: CSS 후처리
- **Autoprefixer**: CSS 벤더 프리픽스

## 🚀 개발 워크플로우

### **1. 컴포넌트 개발**
```typescript
// 1. 타입 정의
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
  children: React.ReactNode;
}

// 2. 컴포넌트 구현
export const Button: React.FC<ButtonProps> = ({ variant, size, onClick, children }) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// 3. 스타일링 (Tailwind + Ant Design)
// 4. 스토리북 작성 (추후)
// 5. 테스트 작성 (추후)
```

### **2. API 통합**
```typescript
// 1. 타입 정의
interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

// 2. API 함수 작성
export const userApi = {
  getUsers: (): Promise<ApiResponse<User[]>> =>
    httpClient.get('/api/users'),

  getUser: (id: number): Promise<ApiResponse<User>> =>
    httpClient.get(`/api/users/${id}`),
};

// 3. 커스텀 훅 작성
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });
};
```

### **3. 페이지 개발**
```typescript
// 1. 페이지 컴포넌트 작성
export const UserManagementPage: React.FC = () => {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <AdminLayout>
      <UserManagementTable users={users} />
    </AdminLayout>
  );
};

// 2. 라우팅 설정
// 3. 권한 체크 추가
// 4. SEO 최적화
```

## 📝 코딩 규칙

### **파일 명명 규칙**
- **컴포넌트**: PascalCase (Button.tsx, UserManagement.tsx)
- **훅**: camelCase with 'use' prefix (useAuth.ts, useUsers.ts)
- **유틸리티**: camelCase (tokenManager.ts, formatDate.ts)
- **타입**: PascalCase with .types.ts suffix (User.types.ts)
- **스토어**: camelCase with Store suffix (authStore.ts)

### **Import 순서**
```typescript
// 1. React 관련
import React from 'react';
import { useState, useEffect } from 'react';

// 2. 외부 라이브러리
import { Button } from 'antd';
import axios from 'axios';

// 3. 내부 모듈 (절대 경로)
import { useAuth } from '@/hooks/api/useAuth';
import { userApi } from '@/services/api/user.api';

// 4. 상대 경로
import './Component.styles.css';
```

### **컴포넌트 구조**
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component Definition
// 4. Styled Components (if any)
// 5. Default Export

interface ComponentProps {
  // props 정의
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Handlers
  // 5. Render

  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

## 🔒 보안 고려사항

### **인증 & 권한**
- JWT 토큰 자동 갱신
- CSRF 토큰 관리
- 라우트별 권한 체크
- XSS 방지

### **데이터 보호**
- 민감한 데이터 암호화
- 안전한 로컬스토리지 사용
- API 요청 검증

## 🎯 다음 단계

1. **환경 설정 완료** ✅
2. **기본 구조 생성** (현재)
3. **인증 시스템 구축**
4. **API 클라이언트 설정**
5. **공통 컴포넌트 개발**
6. **관리자 페이지 개발**
7. **일반 사용자 페이지 개발**
8. **테스트 및 최적화**

이 구조는 확장 가능하고 유지보수하기 쉬운 현대적인 React 애플리케이션의 기반을 제공합니다.
