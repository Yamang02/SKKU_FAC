# 🏗️ SKKU Gallery Frontend-New 프로젝트 구조 설계 V2

## 📋 개요

SKKU Gallery의 새로운 프론트엔드는 **Admin과 Main을 완전히 분리**한 구조로 설계됩니다. 각각 독립적인 디자인 시스템과 컴포넌트를 가지며, 라우팅부터 스타일링까지 모든 것이 분리됩니다.

## 🎯 설계 원칙

### 1. **앱 레벨 완전 분리**
- Admin과 Main은 별도의 애플리케이션처럼 동작
- 공통 요소 최소화, 각각의 독립적인 디자인 시스템
- 별도의 라우팅, 레이아웃, 컴포넌트 시스템

### 2. **단계적 마이그레이션**
- **Phase 1**: Admin 먼저 완전 구축
- **Phase 2**: Main 추후 추가 (기존 백엔드 EJS 템플릿과 병행)

### 3. **독립적 확장성**
- Admin과 Main이 서로 영향 없이 독립적으로 발전
- 추후 별도 앱으로 분리 가능

## 📁 새로운 프로젝트 구조

```
frontend-new/
├── public/                          # 정적 파일
│   ├── index.html                   # HTML 템플릿
│   └── assets/                      # 공통 정적 자산
│
├── src/                             # 소스 코드 루트
│   ├── main.tsx                     # 애플리케이션 진입점
│   ├── App.tsx                      # 루트 라우터 (Admin/Main 분기)
│   ├── vite-env.d.ts               # Vite 타입 정의
│   │
│   ├── apps/                        # 앱별 분리된 구조
│   │   ├── admin/                   # 🔐 관리자 앱 (우선 구현)
│   │   │   ├── App.tsx              # Admin 앱 루트
│   │   │   ├── routes/              # Admin 라우팅
│   │   │   │   ├── index.tsx        # 라우트 설정
│   │   │   │   └── routes.config.ts # 라우트 상수
│   │   │   ├── components/          # Admin 전용 컴포넌트
│   │   │   │   ├── layout/          # Admin 레이아웃
│   │   │   │   │   ├── AdminLayout/
│   │   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Header/
│   │   │   │   │   └── Breadcrumb/
│   │   │   │   ├── ui/              # Admin UI 컴포넌트
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Table/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   ├── Form/
│   │   │   │   │   └── Charts/
│   │   │   │   └── domain/          # Admin 도메인 컴포넌트
│   │   │   │       ├── UserManagement/
│   │   │   │       ├── ArtworkManagement/
│   │   │   │       ├── ExhibitionManagement/
│   │   │   │       └── Dashboard/
│   │   │   ├── pages/               # Admin 페이지
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Users/
│   │   │   │   │   ├── UserList/
│   │   │   │   │   ├── UserDetail/
│   │   │   │   │   └── UserCreate/
│   │   │   │   ├── Artworks/
│   │   │   │   │   ├── ArtworkList/
│   │   │   │   │   ├── ArtworkDetail/
│   │   │   │   │   └── ArtworkCreate/
│   │   │   │   ├── Exhibitions/
│   │   │   │   │   ├── ExhibitionList/
│   │   │   │   │   ├── ExhibitionDetail/
│   │   │   │   │   └── ExhibitionCreate/
│   │   │   │   └── Settings/
│   │   │   ├── hooks/               # Admin 전용 훅
│   │   │   │   ├── api/             # Admin API 훅
│   │   │   │   ├── form/            # Admin 폼 훅
│   │   │   │   └── ui/              # Admin UI 훅
│   │   │   ├── services/            # Admin 서비스
│   │   │   │   └── api/             # Admin API 서비스
│   │   │   ├── stores/              # Admin 상태 관리
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── userStore.ts
│   │   │   │   ├── artworkStore.ts
│   │   │   │   └── uiStore.ts
│   │   │   ├── types/               # Admin 타입 정의
│   │   │   │   ├── api.types.ts
│   │   │   │   ├── components.types.ts
│   │   │   │   └── store.types.ts
│   │   │   ├── utils/               # Admin 유틸리티
│   │   │   │   ├── validation/
│   │   │   │   ├── formatting/
│   │   │   │   └── constants.ts
│   │   │   └── styles/              # Admin 스타일
│   │   │       ├── globals.css
│   │   │       ├── components/
│   │   │       ├── themes/
│   │   │       │   ├── admin-theme.ts
│   │   │       │   └── admin-colors.ts
│   │   │       └── variables.css
│   │   │
│   │   └── main/                    # 🌐 메인 앱 (추후 구현)
│   │       ├── App.tsx              # Main 앱 루트
│   │       ├── routes/              # Main 라우팅
│   │       ├── components/          # Main 전용 컴포넌트
│   │       │   ├── layout/          # Main 레이아웃
│   │       │   │   ├── MainLayout/
│   │       │   │   ├── Header/
│   │       │   │   ├── Footer/
│   │       │   │   └── Navigation/
│   │       │   ├── ui/              # Main UI 컴포넌트
│   │       │   │   ├── Button/      # Admin과 다른 디자인
│   │       │   │   ├── Card/
│   │       │   │   ├── Gallery/
│   │       │   │   └── Exhibition/
│   │       │   └── domain/          # Main 도메인 컴포넌트
│   │       │       ├── Gallery/
│   │       │       ├── Exhibition/
│   │       │       ├── About/
│   │       │       └── Auth/
│   │       ├── pages/               # Main 페이지
│   │       │   ├── Home/
│   │       │   ├── Gallery/
│   │       │   ├── Exhibition/
│   │       │   ├── About/
│   │       │   └── Auth/
│   │       ├── hooks/               # Main 전용 훅
│   │       ├── services/            # Main 서비스
│   │       ├── stores/              # Main 상태 관리
│   │       ├── types/               # Main 타입 정의
│   │       ├── utils/               # Main 유틸리티
│   │       └── styles/              # Main 스타일
│   │           ├── globals.css
│   │           ├── themes/
│   │           │   ├── main-theme.ts
│   │           │   └── main-colors.ts
│   │           └── gallery.css      # 갤러리 전용 스타일
│   │
│   ├── shared/                      # 공통 모듈 (최소한으로 유지)
│   │   ├── components/              # 정말 공통적인 컴포넌트만
│   │   │   ├── Loading/             # 로딩 스피너
│   │   │   ├── ErrorBoundary/       # 에러 바운더리
│   │   │   └── NotFound/            # 404 페이지
│   │   ├── services/                # 공통 서비스
│   │   │   ├── httpClient.ts        # HTTP 클라이언트
│   │   │   └── storage.ts           # 스토리지 유틸
│   │   ├── types/                   # 공통 타입
│   │   │   ├── api.types.ts         # 공통 API 타입
│   │   │   └── global.types.ts      # 전역 타입
│   │   ├── utils/                   # 공통 유틸리티
│   │   │   ├── auth/                # 인증 관련
│   │   │   │   ├── tokenManager.ts
│   │   │   │   └── csrfManager.ts
│   │   │   ├── format/              # 포맷팅
│   │   │   └── helpers.ts           # 공통 헬퍼
│   │   └── config/                  # 공통 설정
│   │       ├── env.ts               # 환경변수
│   │       ├── api.config.ts        # API 설정
│   │       └── constants.ts         # 공통 상수
│   │
│   └── assets/                      # 정적 자산
│       ├── images/
│       │   ├── admin/               # Admin 전용 이미지
│       │   └── main/                # Main 전용 이미지
│       ├── icons/
│       │   ├── admin/               # Admin 전용 아이콘
│       │   └── main/                # Main 전용 아이콘
│       └── fonts/                   # 공통 폰트
│
├── .env.development                 # 개발 환경변수
├── .env.production                  # 프로덕션 환경변수
├── package.json                     # 패키지 정보
├── vite.config.ts                   # Vite 설정
├── tsconfig.json                    # TypeScript 설정
└── README.md                        # 프로젝트 문서
```

## 🚀 앱 분기 로직

### **루트 App.tsx**
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './apps/admin/App';
import MainApp from './apps/main/App';
import { NotFound } from './shared/components/NotFound';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin 앱 - 완전 분리된 라우팅 */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Main 앱 - 추후 구현 */}
        <Route path="/main/*" element={<MainApp />} />
        <Route path="/*" element={<MainApp />} /> {/* 기본 경로 */}

        {/* 404 처리 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

### **Admin App.tsx**
```typescript
// src/apps/admin/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AdminLayout } from './components/layout/AdminLayout';
import { adminTheme } from './styles/themes/admin-theme';
import { AdminRoutes } from './routes';
import './styles/globals.css';

const AdminApp: React.FC = () => {
  return (
    <ConfigProvider theme={adminTheme}>
      <AdminLayout>
        <AdminRoutes />
      </AdminLayout>
    </ConfigProvider>
  );
};

export default AdminApp;
```

## 🎨 디자인 시스템 분리

### **Admin 테마**
```typescript
// src/apps/admin/styles/themes/admin-theme.ts
export const adminTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorBgLayout: '#f5f5f5',
    borderRadius: 6,
    // Admin 전용 디자인 토큰
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#fff',
    },
    // Admin 전용 컴포넌트 스타일
  },
};
```

### **Main 테마 (추후)**
```typescript
// src/apps/main/styles/themes/main-theme.ts
export const mainTheme = {
  token: {
    colorPrimary: '#722ed1', // 다른 브랜드 컬러
    colorBgLayout: '#ffffff',
    borderRadius: 12,
    // Main 전용 디자인 토큰
  },
  components: {
    // Main 전용 컴포넌트 스타일
  },
};
```

## 🔄 마이그레이션 전략

### **Phase 1: Admin 우선 구축** (현재)
1. Admin 앱 구조 구축
2. Admin 레이아웃 및 컴포넌트 개발
3. Admin API 연동
4. Admin 페이지 완성

### **Phase 2: Main 추가** (추후)
1. Main 앱 구조 추가
2. Main 레이아웃 및 컴포넌트 개발
3. 기존 EJS 템플릿과 점진적 교체
4. Main API 연동 및 페이지 완성

## 🛠️ 개발 워크플로우

### **Admin 개발 시**
```bash
# Admin 컴포넌트 개발
src/apps/admin/components/ui/Button/

# Admin 페이지 개발
src/apps/admin/pages/Users/UserList/

# Admin API 훅 개발
src/apps/admin/hooks/api/useUsers.ts
```

### **라우팅 접근**
```typescript
// Admin 접근
http://localhost:3003/admin/dashboard
http://localhost:3003/admin/users
http://localhost:3003/admin/artworks

// Main 접근 (추후)
http://localhost:3003/
http://localhost:3003/gallery
http://localhost:3003/exhibitions
```

## 💡 장점

1. **완전한 분리**: Admin과 Main이 서로 영향 없음
2. **독립적 개발**: 각각의 팀이 독립적으로 개발 가능
3. **유연한 확장**: 추후 별도 앱으로 분리 가능
4. **명확한 책임**: 각 앱의 역할과 범위가 명확
5. **점진적 마이그레이션**: Admin 먼저, Main은 나중에

이 구조로 진행하시겠어요? Admin 앱부터 구체적으로 구현해보겠습니다!
