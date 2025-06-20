# Features Directory

이 디렉토리는 도메인별 기능을 담당합니다. 각 도메인은 일반 사용자와 관리자 기능을 모두 포함합니다.

## 📁 구조 개요

```
features/
├── user/              # 사용자 도메인
├── artwork/           # 작품 도메인
├── exhibition/        # 전시 도메인
├── auth/              # 인증 도메인
└── common/            # 공통 기능
```

## 🏗️ 각 도메인 구조

각 도메인은 다음과 같은 구조를 가집니다:

```
domain/
├── api/
│   ├── DomainApi.ts      # 일반 사용자 API
│   └── DomainAdminApi.ts # 관리자 API
├── components/
│   ├── public/           # 일반 사용자용 컴포넌트
│   └── admin/            # 관리자용 컴포넌트
├── hooks/
│   ├── useDomain.ts      # 일반 사용자용 훅
│   └── useDomainAdmin.ts # 관리자용 훅
├── types/
│   └── domain.types.ts   # 도메인별 타입 정의
└── utils/
    └── domain.utils.ts   # 도메인별 유틸리티
```

## 🔄 Admin과 Public 기능 분리

### API 분리
- **Public API**: `/api/users`, `/api/artworks`, `/api/exhibitions`
- **Admin API**: `/api/admin/users`, `/api/admin/artworks`, `/api/admin/exhibitions`

### 컴포넌트 분리
- **Public**: 일반 사용자가 사용하는 UI 컴포넌트
- **Admin**: 관리자 전용 UI 컴포넌트 (테이블, 폼, 통계 등)

### 사용 예시

```typescript
// apps/main에서 public 기능 사용
import { UserApi } from '@/features/user/api/UserApi';
import { UserProfile } from '@/features/user/components/public/UserProfile';

// apps/admin에서 admin 기능 사용
import { UserAdminApi } from '@/features/user/api/UserAdminApi';
import { AdminUserTable } from '@/features/user/components/admin/AdminUserTable';
```

## 📋 구현 우선순위

### Phase 1: 기본 구조 생성
1. [ ] User 도메인 구조 생성
2. [ ] Artwork 도메인 구조 생성
3. [ ] Exhibition 도메인 구조 생성

### Phase 2: 기존 컴포넌트 이관
1. [ ] Admin 컴포넌트들을 features로 이동
2. [ ] Public 컴포넌트들 생성 및 이관
3. [ ] Import 경로 업데이트

### Phase 3: 최적화
1. [ ] 공통 로직 추출
2. [ ] 타입 정의 통합
3. [ ] 테스트 코드 작성

## 🔗 연관 디렉토리

- `apps/admin/`: 관리자 앱에서 features의 admin 기능 사용
- `apps/main/`: 일반 사용자 앱에서 features의 public 기능 사용
- `shared/`: 도메인에 관계없는 공통 기능 (API 클라이언트, 유틸리티 등)
