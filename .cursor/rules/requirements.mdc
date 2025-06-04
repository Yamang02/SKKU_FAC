# 📋 SKKU Gallery Project Requirements & Structure

## **프로젝트 개요**
SKKU 미술동아리 갤러리는 성균관대학교 순수 미술 동아리 전시의 예술 작품을 전시하고 관리하는 웹 플랫폼입니다. 이 시스템은 전시회 관리, 작품 업로드, 사용자 인증 등의 기능을 제공합니다.

## **💻 기술 스택 요구사항**

### **Backend Framework**
1. **Node.js (22.13.0)** + **Express.js** 프레임워크
2. **ECMAScript 모듈(ESM)** 시스템 - 모든 `import/export` 구문 사용
3. **MySQL** 데이터베이스 + **Sequelize ORM**
4. **세션 기반 인증** - `express-session` 활용
5. **Cloudinary** 이미지 스토리지
6. **bcrypt** 비밀번호 암호화
7. **helmet** 보안 헤더
8. **express-rate-limit** 요청 제한
9. **EJS** 템플릿 엔진 (서버 사이드 렌더링)
10. **Swagger UI** API 문서화
11. **도메인 중심 설계(DDD)** 아키텍처

### **Frontend Framework**
- **EJS 템플릿** + **Vanilla JavaScript**
- **CSS 모듈화** - 컴포넌트별 분리
- **반응형 디자인** - 모바일 대응

## **🏗️ 프로젝트 구조**

### **실제 디렉토리 구조**
```
SKKU_FAC_GALLERY/
├── src/                              # 소스 코드 루트
│   ├── app.js                        # Express 애플리케이션 설정
│   ├── server.js                     # 서버 시작점
│   ├── routeIndex.js                 # 라우터 인덱스
│   ├── swagger.json                  # API 문서
│   ├── domain/                       # 도메인별 구성요소
│   │   ├── admin/                    # 관리자 도메인
│   │   ├── artwork/                  # 작품 도메인
│   │   ├── auth/                     # 인증 도메인
│   │   ├── common/                   # 공통 도메인
│   │   ├── exhibition/               # 전시회 도메인
│   │   │   ├── controller/           # 컨트롤러 레이어
│   │   │   ├── model/                # 모델 레이어
│   │   │   └── service/              # 서비스 레이어
│   │   ├── home/                     # 홈 도메인
│   │   ├── image/                    # 이미지 도메인
│   │   └── user/                     # 사용자 도메인
│   ├── infrastructure/               # 인프라 계층
│   │   ├── cloudinary/               # Cloudinary 통합
│   │   └── db/                       # 데이터베이스 관련
│   │       ├── adapter/              # DB 어댑터
│   │       ├── repository/           # 레포지토리 패턴 구현
│   │       └── model/                # DB 모델
│   │           ├── entity/           # 엔티티 모델
│   │           └── relationship/     # 모델 간 관계 설정
│   ├── common/                       # 공통 유틸리티
│   ├── config/                       # 설정 파일
│   ├── public/                       # 정적 파일
│   │   ├── css/                      # CSS 파일들
│   │   │   ├── common/               # 공통 스타일
│   │   │   ├── components/           # 컴포넌트 스타일
│   │   │   └── layout/               # 레이아웃 스타일
│   │   └── js/                       # JavaScript 파일들
│   │       ├── common/               # 공통 스크립트
│   │       └── service/              # API 서비스
│   └── views/                        # EJS 뷰 템플릿
│       ├── admin/                    # 관리자 페이지
│       ├── main/                     # 메인 페이지들
│       └── partials/                 # 재사용 가능한 조각들
```

## **🛡️ 아키텍처 규칙**

### **MVC 패턴 준수**
- **Controller**: 요청 처리와 응답 반환만 담당
- **Service**: 비즈니스 로직 구현
- **Model**: 데이터 구조 및 검증
- **Repository**: 데이터 접근 계층

### **도메인 구분**
- **각 도메인 폴더**: `controller/`, `service/`, `model/` 구조
- **관심사 분리**: 각 레이어는 명확한 역할 분담
- **의존성 방향**: Controller → Service → Repository → Model

### **ESM 모듈 시스템**
```javascript
// ✅ DO: ESM import/export 사용
import express from 'express';
import UserService from '../service/UserService.js';
export default UserController;

// ❌ DON'T: CommonJS require 사용 금지
const express = require('express');
module.exports = UserController;
```

### **상대 경로 import 패턴**
```javascript
// ✅ 실제 프로젝트에서 사용되는 패턴
import UserService from '../../user/service/UserService.js';
import { UserNotFoundError } from '../../../common/error/UserError.js';
import logger from '../../../common/utils/Logger.js';
```

## **🎨 Frontend 구조 규칙**

### **Template vs Static File 분리 원칙**
- **EJS 템플릿**: 구조와 콘텐츠만
- **CSS 파일**: 모든 스타일링은 별도 `.css` 파일
- **JavaScript 파일**: 모든 기능은 별도 `.js` 파일
- **❌ 대용량 CSS/JS 블록을 템플릿에 임베드 금지**

### **CSS 구조 규칙**
```css
/* ✅ DO: CSS 변수 사용 */
:root {
  --color-primary: #007bff;
  --color-primary-dark: #0056b3;
}

/* ✅ DO: 기존 CSS 변수 재사용 */
.button-primary {
  background-color: var(--color-primary);
}
```

### **Template 링크 패턴**
```html
<!-- ✅ DO: 외부 CSS 링크 -->
<link rel="stylesheet" href="/css/common/component.css">

<!-- ✅ DO: 외부 JS 링크 (ES 모듈) -->
<script type="module" src="/js/common/component.js"></script>

<!-- ❌ DON'T: 대량 인라인 스타일/스크립트 -->
<style>/* 수백 줄의 CSS */</style>
<script>/* 복잡한 JavaScript 로직 */</script>
```

## **🔒 보안 및 인증 규칙**

### **세션 기반 인증**
```javascript
// 세션 설정 예시
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
```

### **사용자 역할**
- **ADMIN**: 전체 시스템 관리
- **SKKU_MEMBER**: 성균관대 학생
- **EXTERNAL_MEMBER**: 외부 사용자

### **보안 미들웨어**
```javascript
// helmet 보안 헤더
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "https://res.cloudinary.com/"]
        }
    }
}));

// 요청 제한
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 15분당 최대 100개 요청
});
app.use('/api/', limiter);
```

## **📡 API 및 라우팅 규칙**

### **실제 라우트 패턴**
- **홈**: `/`
- **인증**: `/user/login`, `/user/new`, `/user/me`
- **작품**: `/artwork`, `/artwork/new`
- **전시회**: `/exhibition`
- **관리자**: `/admin/management/{domain}`

### **API 문서화**
- **모든 API 엔드포인트**: `swagger.json`에 문서화 필수
- **Swagger UI**: `/api-docs`에서 실시간 확인

### **에러 처리**
- **중앙 집중식** 에러 처리
- **적절한 HTTP 상태 코드** 사용
- **구조화된 응답 형식** 유지

## **🗄️ 데이터베이스 규칙**

### **Sequelize ORM 사용**
- **모든 DB 관련 코드**: `infrastructure/db/` 폴더
- **Entity 모델**: `infrastructure/db/model/entity/`
- **관계 설정**: `infrastructure/db/model/relationship/`
- **Repository 패턴**: 데이터 접근 추상화

### **데이터 모델 정의**
- **각 도메인의 데이터 모델**: entity 및 relationship 폴더에 명확히 정의
- **모델 간 관계**: 별도 relationship 파일로 관리

## **🏢 특수 도메인 규칙**

### **Admin 도메인 (SSR 패턴)**
```javascript
// ✅ DO: Admin은 SSR 패턴 사용
// req.flash + res.redirect 패턴
req.flash('success', '작업이 완료되었습니다.');
res.redirect('/admin/management/artwork');

// ❌ DON'T: Admin에서 JSON API 패턴 사용 금지
res.json({ success: true, message: '완료' });
```

### **Method Override 패턴**
```html
<!-- Admin 페이지에서 DELETE 요청 -->
<form method="POST" action="/admin/artwork/delete/123?_method=DELETE">
```

### **UX 규칙**
- **Delete 버튼**: 상세 페이지에만, 목록 페이지에는 금지
- **Loading 상태**: 페이지 네비게이션용, 토글/정렬용 아님
- **Toggle 동작**: beforeunload 경고 트리거 금지

## **⚠️ 코드 분석 필수 사항**

### **구현 전 필수 분석**
```javascript
// ✅ ALWAYS: 기존 구조 확인
list_dir("src/domain/target-domain")
read_file("src/domain/target-domain/controller/ExistingController.js")
grep_search("import.*from.*target-pattern")

// ✅ ALWAYS: 실제 vs 예상 구조 매핑
// - 실제 파일 경로, 클래스명, 메서드명 검증
// - 의존성 주입 패턴 확인
// - Import 경로 검증
```

### **❌ 피해야 할 가정들**
- 파일 구조를 검증 없이 가정
- 메서드명이나 import 경로 추측
- 기존 CSS 변수나 패턴 무시
- 실제 API 응답 형식과 다른 구현

## **🧹 개발 규칙**

### **코드 스타일**
- **ESLint 규칙** 준수
- **일관된 네이밍 컨벤션**
- **적절한 주석과 문서화**

### **환경 설정**
- **환경 변수**: `config/` 폴더의 설정 파일을 통해 접근
- **민감한 정보**: `.env` 파일로 관리

### **버전 관리**
- **Git 커밋 메시지**: 명확하고 설명적
- **브랜치 전략**: feature/fix 브랜치 활용

---

**💡 핵심 원칙**:
1. **가정하지 말고 확인하라** - 기존 구조 분석 우선
2. **관심사를 분리하라** - MVC 패턴과 도메인 구조 준수
3. **일관성을 유지하라** - 기존 패턴과 컨벤션 따르기
4. **보안을 고려하라** - 인증, 검증, 에러 처리 철저히
