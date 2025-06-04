# Railway 모니터링 시스템 설정 가이드

이 문서는 SKKU Gallery 애플리케이션을 Railway에 배포할 때 모니터링 시스템을 설정하는 방법을 안내합니다.

## 🚀 필수 환경변수 설정

Railway 대시보드에서 다음 환경변수들을 설정하세요:

### 기본 데이터베이스 및 Redis
- `DATABASE_URL`: Railway MySQL 데이터베이스 URL
- `REDIS_URL`: Railway Redis 인스턴스 URL (또는 Upstash Redis)

### 모니터링 시스템
- `SENTRY_DSN`: Sentry 프로젝트 DSN (에러 추적)
- `NODE_ENV=production`

### 성능 최적화 (선택사항)
- `PROMETHEUS_METRICS_ENABLED=true`
- `LOG_LEVEL=info`
- `HEALTH_CHECK_INTERVAL=30000`

## 📊 접근 가능한 모니터링 엔드포인트

배포 완료 후 다음 URL들에 접근할 수 있습니다:

1. **헬스체크**: `https://your-app.railway.app/health`
   - 시스템 상태, 데이터베이스 연결, Redis 연결 상태 확인

2. **Prometheus 메트릭**: `https://your-app.railway.app/metrics`
   - 서버 성능 메트릭 (Prometheus 형식)

3. **모니터링 대시보드**: `https://your-app.railway.app/admin/monitoring`
   - 관리자 전용 실시간 대시보드 (로그인 필요)

## 🔧 Railway 환경 최적화 설정

### 1. railway.json 설정
현재 프로젝트의 `railway.json`이 이미 최적화되어 있습니다:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:no-build",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. 시작 스크립트 추가 필요
`package.json`에 Railway 배포용 스크립트 추가:

```json
{
  "scripts": {
    "build": "echo 'Build completed'",
    "start:no-build": "cross-env NODE_ENV=production node ./src/server.js"
  }
}
```

## 📈 모니터링 기능

### 자동 수집 메트릭
- HTTP 요청 수 및 응답 시간
- 메모리 사용량 (RSS, Heap)
- CPU 사용률
- 활성 연결 수
- 에러 발생 횟수

### 실시간 알림
- Sentry를 통한 에러 자동 추적
- 시스템 상태 변화 모니터링
- 데이터베이스/Redis 연결 상태 감시

### 대시보드 기능
- 실시간 메트릭 표시
- 30초 자동 새로고침
- 시스템 상태 시각화
- 빠른 액션 버튼 (메트릭 초기화, 헬스체크 등)

## 🛠️ 문제 해결

### Sentry 설정 문제
- `SENTRY_DSN`이 설정되지 않으면 로컬 에러 추적만 사용됩니다
- 프로덕션 환경에서는 반드시 Sentry 설정을 권장합니다

### 메모리 부족 시
Railway의 메모리 제한을 초과하면:
1. `/health` 엔드포인트로 메모리 사용량 확인
2. `/admin/monitoring` 대시보드에서 실시간 모니터링
3. 필요시 Railway 플랜 업그레이드

### 연결 문제
- Redis 연결 실패: `REDIS_URL` 환경변수 확인
- 데이터베이스 연결 실패: `DATABASE_URL` 확인
- `/health` 엔드포인트에서 상세 진단 정보 확인

## 🔗 외부 서비스 연동

### Sentry 설정
1. Sentry 계정 생성 및 프로젝트 생성
2. DSN 획득 후 Railway 환경변수에 설정
3. 자동 에러 추적 및 성능 모니터링 활성화

### 추가 모니터링 도구 (선택사항)
- **UptimeRobot**: 웹사이트 가동시간 모니터링
- **LogTail**: 로그 집계 및 검색
- **Datadog**: 종합 APM 솔루션

## 📞 지원

모니터링 시스템 관련 문제가 발생하면:
1. `/health` 엔드포인트 확인
2. Railway 로그 확인
3. Sentry 대시보드 확인
4. 필요시 시스템 관리자에게 문의

---

🎯 **목표**: 안정적이고 성능이 우수한 SKKU Gallery 서비스 운영
📊 **결과**: 실시간 모니터링을 통한 프로액티브 문제 해결
