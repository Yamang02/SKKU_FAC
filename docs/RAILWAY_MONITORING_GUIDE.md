# Railway 에러 모니터링 가이드

SKKU 미술동아리 갤러리 프로젝트의 Railway 배포 환경에 최적화된 에러 모니터링 시스템입니다.

## 📋 목차

1. [개요](#개요)
2. [설정](#설정)
3. [Railway 로그 필터링](#railway-로그-필터링)
4. [에러 추적](#에러-추적)
5. [이메일 알림 설정](#이메일-알림-설정)
6. [메트릭 모니터링](#메트릭-모니터링)
7. [실사용 예시](#실사용-예시)

## 개요

이 시스템은 Railway 환경에서 효과적인 에러 모니터링을 위해 다음 기능을 제공합니다:

- **Railway 로그 최적화**: 구조화된 로그 출력과 필터링 지원
- **스마트한 에러 추적**: 고유 에러 ID를 통한 중복 제거 및 추적
- **선택적 이메일 알림**: 중요한 에러에 대한 즉시 알림
- **가벼운 메트릭 수집**: 외부 서비스 없이 기본 통계 제공

## 설정

### 환경 변수

Railway에서 다음 환경 변수를 설정하여 기능을 활성화할 수 있습니다:

```bash
# 기본 설정
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
RAILWAY_SERVICE_NAME=skku-gallery

# 이메일 알림 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@skkugallery.com
ADMIN_EMAIL=admin@skkugallery.com
```

### 자동 설정

`src/config/railwayMonitoringConfig.js`에서 환경에 따라 자동으로 설정됩니다:

- **개발 환경**: 상세한 스택 트레이스, 디버그 로깅
- **프로덕션 환경**: 보안 강화, 이메일 알림 활성화

## Railway 로그 필터링

Railway 대시보드에서 다음 필터를 사용하여 에러를 추적할 수 있습니다:

### 기본 필터

```bash
# 모든 에러 로그
🚨 ERROR_REPORT

# 심각도별 필터
🚨 ERROR_REPORT | CRITICAL
🚨 ERROR_REPORT | HIGH
🚨 ERROR_REPORT | MEDIUM
🚨 ERROR_REPORT | LOW
```

### 특정 에러 추적

```bash
# 특정 에러 ID로 관련 로그 찾기
🚨 ERROR_REPORT | ERR_A1B2C3D4

# 서비스 식별
X-Service: SKKU-Gallery

# 환경별 필터
railway_environment: production
railway_environment: development
```

## 에러 추적

### 에러 ID 시스템

각 에러에는 고유한 8자리 ID가 부여됩니다:

- **형식**: `ERR_A1B2C3D4`
- **생성 방식**: 에러 이름, 메시지, 코드의 해시값
- **중복 제거**: 동일한 에러는 같은 ID를 가지므로 빈도 추적 가능

### 구조화된 로그

```json
{
  "errorId": "ERR_A1B2C3D4",
  "severity": "HIGH",
  "project": "SKKU Gallery",
  "environment": "production",
  "error": {
    "name": "DatabaseConnectionError",
    "message": "Failed to connect to MySQL",
    "code": "ECONNREFUSED",
    "statusCode": 500
  },
  "context": {
    "url": "/api/artworks",
    "method": "POST",
    "userId": "user123",
    "ip": "192.168.1.1"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 이메일 알림 설정

### Gmail 설정 예시

1. Gmail 앱 비밀번호 생성
2. Railway에서 환경 변수 설정:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
ADMIN_EMAIL=admin@example.com
```

### 알림 정책

- **CRITICAL/HIGH 에러만**: 중요한 에러에만 알림 발송
- **중복 방지**: 같은 에러는 10분 간격으로 제한
- **스팸 방지**: 이메일 발송 실패 시 자동 재시도 없음

### 이메일 내용

이메일에는 다음 정보가 포함됩니다:

- 에러 기본 정보 (이름, 메시지, 코드)
- 요청 컨텍스트 (URL, 메서드, 사용자 정보)
- 스택 트레이스
- Railway 로그 필터 명령어

## 메트릭 모니터링

### 실시간 통계

시스템이 자동으로 수집하는 메트릭:

```javascript
{
  "errors": {
    "total": 42,
    "byHour": { "14": 5, "15": 8 },
    "byEndpoint": { "/api/artworks": 15, "/auth/login": 10 },
    "byUser": { "user123": 3, "anonymous": 20 }
  },
  "performance": {
    "avgMemoryUsage": 128, // MB
    "avgResponseTime": 245, // ms
    "uptime": 3600 // seconds
  }
}
```

### 통계 조회

관리자 엔드포인트를 통해 통계 조회:

```javascript
// ErrorHandler 인스턴스에서
const stats = errorHandler.getErrorStats();
const reporterStats = errorHandler.errorReporter.getErrorStats();
```

## 실사용 예시

### 1. Railway 대시보드에서 에러 추적

1. Railway 로그 페이지 접속
2. 필터에 `🚨 ERROR_REPORT` 입력
3. 특정 에러 ID 클릭하여 상세 조회

### 2. 반복 에러 패턴 확인

```bash
# 특정 시간대 에러 확인
🚨 ERROR_REPORT | 2024-01-15T14:

# 특정 엔드포인트 에러 확인
🚨 ERROR_REPORT | /api/artworks

# 특정 사용자 관련 에러
🚨 ERROR_REPORT | user123
```

### 3. 에러 알림 메일 활용

- 이메일에서 에러 ID 확인
- Railway 로그에서 해당 ID로 검색
- 관련 요청들의 패턴 분석

### 4. 성능 모니터링

```javascript
// 정기적으로 메트릭 확인
setInterval(() => {
    const metrics = app.get('errorHandler').errorReporter.getErrorStats();
    console.log('Error metrics:', metrics);
}, 60000); // 1분마다
```

## 트러블슈팅

### 이메일 알림이 오지 않는 경우

1. 환경 변수 확인
2. SMTP 설정 검증
3. Railway 로그에서 이메일 발송 에러 확인

### 로그가 너무 많은 경우

1. `filterRules`에서 무시할 패턴 추가
2. 봇/크롤러 트래픽 필터링 강화
3. 로그 레벨 조정

### 성능 이슈

1. 메트릭 수집 간격 조정
2. 에러 버퍼 크기 제한
3. 로그 출력 최적화

## 주의사항

- **민감한 정보**: 비밀번호, 토큰 등은 자동으로 마스킹됨
- **로그 크기**: Railway 로그 크기 제한을 고려하여 최적화됨
- **메모리 사용**: 메트릭 데이터는 메모리에 저장되므로 재시작 시 초기화됨
- **이메일 제한**: Gmail 등의 일일 발송 제한을 고려하여 사용

---

**참고**: 이 시스템은 Railway 환경에 최적화되어 있지만, 다른 클라우드 환경에서도 사용 가능합니다. 환경 변수만 적절히 설정하면 됩니다.
