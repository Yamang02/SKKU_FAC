# Auth Domain 테스트 실행 가이드

## 🚀 빠른 시작

### 1. 환경 변수 설정
```bash
# .env 파일에 다음 변수들 추가 (최소 32자 이상)
JWT_ACCESS_SECRET="your-super-secure-access-secret-key-32-chars-minimum-length"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-32-chars-minimum-length"
SESSION_SECRET="your-super-secure-session-secret-key-32-chars-minimum-length"
CONFIG_MASTER_KEY="your-super-secure-master-key-32-chars-minimum-length-required"
```

### 2. 테스트 실행

#### Auth 단위 테스트만 실행
```bash
npm run test:auth-unit
```

#### Auth 기능 종합 검증 (환경, 의존성, 보안 포함)
```bash
npm run test:auth-features
```

#### Auth 전체 테스트 (단위 + 통합 + 역할)
```bash
npm run test:auth-full
```

#### 개별 테스트 파일 실행
```bash
# JWT 인증 서비스
npx playwright test tests/unit/auth/AuthService.spec.js

# RBAC 권한 시스템
npx playwright test tests/unit/auth/RBACService.spec.js

# Passport.js 통합
npx playwright test tests/unit/auth/PassportService.spec.js

# JWT 미들웨어
npx playwright test tests/unit/auth/jwtAuth.spec.js
```

## 📋 테스트 결과 확인

테스트 실행 후 결과는 다음 위치에 저장됩니다:
- `test-results/auth-test-report.json`

## 🔧 구현 완료된 기능

✅ **JWT 인증**: Access/Refresh Token 생성, 검증, 갱신
✅ **RBAC 시스템**: ADMIN, SKKU_MEMBER, EXTERNAL_MEMBER 역할 기반 권한
✅ **Passport.js**: 로컬 인증 + Google OAuth
✅ **하이브리드 인증**: 세션 + JWT 동시 지원
✅ **보안 강화**: 암호화, 환경별 설정, 시크릿 검증

## 📞 문제 해결

테스트 실패 시:
1. 환경 변수 길이 확인 (최소 32자)
2. 의존성 설치 확인: `npm install`
3. 개별 테스트로 디버깅: `--debug` 플래그 사용

상세한 기능 명세는 `docs/auth-domain-status.md` 참조
