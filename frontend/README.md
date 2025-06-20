# 🎨 SKKU Gallery Frontend-New

SKKU 순수미술동아리 갤러리의 새로운 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **React 19.1.0** - 최신 React 기능 활용
- **TypeScript 5.8.3** - 타입 안정성
- **Vite 6.3.5** - 빠른 개발 서버 및 빌드
- **Ant Design 5.26.1** - 엔터프라이즈급 UI 컴포넌트
- **Tailwind CSS 4.1.10** - 유틸리티 우선 CSS 프레임워크
- **Zustand 5.0.5** - 경량 상태 관리
- **React Query 5.80.7** - 서버 상태 관리
- **Axios 1.10.0** - HTTP 클라이언트
- **React Router DOM 7.6.2** - 클라이언트 사이드 라우팅

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── domain/         # 도메인별 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── admin/          # 관리자 페이지
│   ├── public/         # 일반 사용자 페이지
│   └── auth/           # 인증 페이지
├── hooks/              # 커스텀 훅
├── services/           # 외부 서비스 연동
├── stores/             # Zustand 상태 관리
├── contexts/           # React Context
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── config/             # 설정 파일
└── assets/             # 정적 자산
```

## 🛠️ 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
# .env.development 파일 생성
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=SKKU Gallery (Dev)
```

### 3. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 `http://localhost:3003`에서 실행됩니다.

## 📝 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run lint` - ESLint 검사
- `npm run preview` - 빌드 결과 미리보기

## 🔧 개발 가이드

### Path Alias 사용
```typescript
// ✅ 절대 경로 사용 (권장)
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/api/useAuth';
import { userApi } from '@/services/api/user.api';

// ❌ 상대 경로 사용 (비권장)
import { Button } from '../../../components/common/Button';
```

### 컴포넌트 작성 규칙
```typescript
// 1. Imports
import React from 'react';
import { Button } from 'antd';

// 2. Types
interface ComponentProps {
  title: string;
  onClick: () => void;
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ title, onClick }) => {
  return (
    <Button onClick={onClick}>
      {title}
    </Button>
  );
};
```

### API 호출 패턴
```typescript
// 1. API 함수 정의 (services/api/)
export const userApi = {
  getUsers: (): Promise<ApiResponse<User[]>> =>
    httpClient.get('/api/users'),
};

// 2. 커스텀 훅 사용 (hooks/api/)
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });
};

// 3. 컴포넌트에서 사용
const { data: users, isLoading, error } = useUsers();
```

## 🎯 마이그레이션 진행 상황

- [x] **프로젝트 구조 설계** - 완료
- [x] **기본 설정 파일** - 완료
- [ ] **인증 시스템** - 진행 예정
- [ ] **API 클라이언트** - 진행 예정
- [ ] **공통 컴포넌트** - 진행 예정
- [ ] **관리자 페이지** - 진행 예정
- [ ] **일반 사용자 페이지** - 진행 예정

## 📚 추가 문서

- [프로젝트 구조 설계](./PROJECT_STRUCTURE.md) - 상세한 설계 문서
- [개발 가이드라인](../frontend/FRONTEND_GUIDELINES.md) - 기존 가이드라인 참고

## 🔗 관련 링크

- [기존 Frontend](../frontend/) - 마이그레이션 소스
- [Backend API](../backend/) - API 서버
