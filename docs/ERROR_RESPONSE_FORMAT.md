# 에러 응답 형식 가이드

SKKU 미술동아리 갤러리 프로젝트의 표준 에러 응답 형식을 정의합니다.

## 개요

통합 에러 처리 시스템은 클라이언트 요청 타입에 따라 적절한 형식으로 에러 응답을 반환합니다:

- **API 요청**: JSON 형식
- **웹페이지 요청**: HTML 형식 (템플릿 렌더링)

## API 에러 응답 (JSON)

### 기본 구조

```json
{
  "success": false,
  "error": {
    "message": "사용자 친화적 에러 메시지",
    "code": "INTERNAL_ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 개발 환경 추가 필드

개발 환경에서는 디버깅을 위한 추가 정보가 포함됩니다:

```json
{
  "success": false,
  "error": {
    "message": "사용자 친화적 에러 메시지",
    "code": "INTERNAL_ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "name": "ValidationError",
    "details": {
      "field": "email",
      "reason": "invalid_format"
    },
    "stack": "Error: ...\n    at ..."
  }
}
```

### 필드 설명

| 필드 | 타입 | 설명 | 필수 |
|------|------|------|------|
| `success` | boolean | 항상 `false` | ✅ |
| `error.message` | string | 사용자에게 표시될 친화적 메시지 | ✅ |
| `error.code` | string | 내부 에러 코드 (로깅, 디버깅용) | ✅ |
| `error.statusCode` | number | HTTP 상태 코드 | ✅ |
| `error.timestamp` | string | ISO 8601 형식의 에러 발생 시간 | ✅ |
| `error.name` | string | 에러 클래스명 (개발 환경만) | 🔧 |
| `error.details` | object | 추가 에러 상세 정보 (개발 환경만) | 🔧 |
| `error.stack` | string | 스택 트레이스 (개발 환경만) | 🔧 |

## 웹페이지 에러 응답 (HTML)

웹페이지 요청에 대해서는 `common/error.ejs` 템플릿을 사용하여 사용자 친화적인 에러 페이지를 렌더링합니다.

### 템플릿 변수

| 변수 | 타입 | 설명 |
|------|------|------|
| `title` | string | 페이지 제목 |
| `message` | string | 에러 메시지 |
| `error.code` | number | HTTP 상태 코드 |
| `error.stack` | string | 스택 트레이스 (개발 환경만) |
| `returnUrl` | string | 이전 페이지 URL |
| `isAdminPath` | boolean | 관리자 경로 여부 |

### 에러 페이지 기능

1. **시각적 구분**: 에러 타입별 아이콘과 색상
   - 404: 🔍 (빨간색)
   - 500+: ⚠️ (주황색)
   - 기타: ❌ (회색)

2. **사용자 친화적 메시지**
   - 기술적 용어 최소화
   - 해결 방법 제시

3. **내비게이션 버튼**
   - 홈으로 돌아가기 (항상 표시)
   - 이전 페이지로 (가능한 경우)
   - 관리자 메인 (관리자 경로인 경우)

4. **문제 해결 가이드**
   - 에러 타입별 맞춤 안내
   - 연락처 정보 제공

## API 요청 판단 기준

다음 조건 중 하나라도 만족하면 API 요청으로 판단됩니다:

1. `XMLHttpRequest` (XHR) 요청
2. `Accept` 헤더에 `application/json` 포함
3. URL이 `/api`로 시작
4. `Content-Type` 헤더에 `application/json` 포함

## 에러 심각도 분류

### 심각도 레벨

| 레벨 | 설명 | 로깅 레벨 | 예시 |
|------|------|-----------|------|
| `LOW` | 일반적인 클라이언트 에러 | `info`/`debug` | 404, 400, 422 |
| `MEDIUM` | 권한/인증 관련 에러 | `warn` | 401, 403 |
| `HIGH` | 서버 내부 에러 | `error` | 500, 503 |
| `CRITICAL` | 시스템 치명적 에러 | `error` | 데이터베이스 연결 실패 등 |

### 카테고리

| 카테고리 | 설명 | HTTP 상태 코드 범위 |
|----------|------|-------------------|
| `CLIENT` | 클라이언트 요청 오류 | 4xx |
| `SERVER` | 서버 내부 오류 | 5xx |
| `BUSINESS` | 비즈니스 로직 오류 | 4xx, 5xx |
| `SYSTEM` | 시스템 오류 | 5xx |

## 예시

### 사용자 인증 실패 (API)

```json
{
  "success": false,
  "error": {
    "message": "인증이 필요합니다.",
    "code": "UNAUTHORIZED",
    "statusCode": 401,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 페이지 없음 (웹)

HTML 템플릿으로 렌더링되며 다음 정보가 표시됩니다:
- 🔍 아이콘과 "페이지를 찾을 수 없습니다" 제목
- "요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다." 메시지
- 홈으로 돌아가기, 이전 페이지로 버튼
- URL 확인, 메인 페이지에서 콘텐츠 찾기 등의 해결 방법

### 서버 에러 (API)

```json
{
  "success": false,
  "error": {
    "message": "서버 내부 오류가 발생했습니다.",
    "code": "INTERNAL_SERVER_ERROR",
    "statusCode": 500,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## 개발자 가이드

### 새로운 에러 타입 추가

1. `src/common/error/BaseError.js`의 `ErrorMapping`에 매핑 추가
2. 필요시 새로운 에러 클래스 생성
3. 적절한 HTTP 상태 코드, 심각도, 카테고리 할당

### 커스텀 에러 메시지

```javascript
import { BadRequestError } from '../common/error/BaseError.js';

// 기본 메시지 사용
throw new BadRequestError();

// 커스텀 메시지
throw new BadRequestError('이메일 형식이 올바르지 않습니다.');

// 상세 정보 포함
throw new BadRequestError('입력 검증 실패', 'VALIDATION_FAILED', {
  field: 'email',
  value: 'invalid-email'
});
```

### 프론트엔드 처리 예시

```javascript
// API 요청 에러 처리
try {
  const response = await fetch('/api/users');
  const data = await response.json();

  if (!data.success) {
    // 에러 처리
    console.error('Error:', data.error.message);
    alert(data.error.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## 설정

### ErrorHandler 옵션

```javascript
import ErrorHandler from '../middleware/ErrorHandler.js';

const { errorHandler, notFoundHandler } = ErrorHandler.create({
  isDevelopment: process.env.NODE_ENV === 'development',
  includeStackTrace: true,
  enableDetailedLogging: true
});
```

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `isDevelopment` | `process.env.NODE_ENV === 'development'` | 개발 환경 여부 |
| `includeStackTrace` | `isDevelopment` | 스택 트레이스 포함 여부 |
| `enableDetailedLogging` | `true` | 상세 로깅 활성화 여부 |

## 보안 고려사항

1. **민감한 정보 노출 방지**: 스택 트레이스는 개발 환경에서만 노출
2. **에러 메시지 일반화**: 보안상 중요한 내부 구조 정보 숨김
3. **로깅 레벨 적절히 설정**: 운영 환경에서 불필요한 상세 로그 방지

## 모니터링 및 분석

에러 발생 시 다음 정보가 로그에 기록됩니다:

- 요청 URL, HTTP 메서드
- 클라이언트 IP, User-Agent
- 사용자 ID (로그인 상태인 경우)
- 에러 심각도, 카테고리
- 요청 헤더, 바디, 파라미터 (상세 로깅 활성화 시)

이 정보를 활용하여 에러 패턴 분석 및 시스템 개선에 활용할 수 있습니다.
