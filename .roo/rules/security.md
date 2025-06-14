---
description:
globs:
alwaysApply: false
---
# 🔒 Security Rules & Best Practices

**CRITICAL**: These rules prevent serious security vulnerabilities and data breaches.

## **🚨 Sensitive Information Protection**

### **Never Log Sensitive Data**
- **패스워드, API 키, 토큰은 절대 로그에 출력하지 말 것**
- **환경변수 값을 직접 로깅하지 말 것**
- **데이터베이스 연결 정보를 평문으로 출력하지 말 것**

```javascript
// ❌ NEVER DO - 민감한 정보 노출
console.log('Redis config:', {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD  // 🚨 보안 사고!
});

// ❌ NEVER DO - 환경변수 직접 출력
console.log('Environment variables:', process.env);

// ✅ DO - 안전한 로깅
console.log('Redis config:', {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD ? '***MASKED***' : 'not set',
    passwordLength: process.env.REDIS_PASSWORD?.length || 0
});

// ✅ DO - 마스킹 함수 사용
const maskSensitiveData = (obj) => {
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'auth'];
    const masked = { ...obj };

    Object.keys(masked).forEach(key => {
        if (sensitiveKeys.some(sensitive =>
            key.toLowerCase().includes(sensitive.toLowerCase())
        )) {
            masked[key] = masked[key] ? '***MASKED***' : undefined;
        }
    });

    return masked;
};
```

### **Environment Variable Handling**
```javascript
// ✅ DO - 안전한 환경변수 디버깅
logger.info('Database config validation:', {
    host: process.env.DB_HOST || 'not set',
    port: process.env.DB_PORT || 'not set',
    database: process.env.DB_NAME || 'not set',
    passwordSet: !!process.env.DB_PASSWORD,
    passwordLength: process.env.DB_PASSWORD?.length || 0
});

// ✅ DO - 설정 검증 시 마스킹
const validateConfig = () => {
    const requiredVars = ['DB_HOST', 'DB_PASSWORD', 'JWT_SECRET'];

    requiredVars.forEach(varName => {
        const value = process.env[varName];
        logger.info(`${varName}: ${value ? `설정됨 (${value.length}자)` : '설정되지 않음'}`);
    });
};
```

## **🔐 Authentication & Authorization**

### **JWT Token Handling**
```javascript
// ✅ DO - 토큰 로깅 시 마스킹
logger.info('JWT token generated:', {
    userId: user.id,
    tokenLength: token.length,
    expiresAt: payload.exp,
    // 토큰 값은 절대 로깅하지 않음
});

// ❌ NEVER DO - 토큰 전체 출력
logger.info('Generated token:', token);
```

### **Session Security**
```javascript
// ✅ DO - 세션 디버깅 시 안전한 정보만
logger.debug('Session created:', {
    sessionId: req.sessionID?.substring(0, 8) + '...',
    userId: req.session.user?.id,
    isAuthenticated: !!req.session.user,
    // 세션 데이터 전체는 로깅하지 않음
});
```

## **🛡️ Error Handling & Logging**

### **Error Message Sanitization**
```javascript
// ✅ DO - 프로덕션에서 안전한 에러 응답
const sanitizeError = (error, isProduction) => {
    if (isProduction) {
        return {
            message: 'Internal server error',
            code: error.code,
            timestamp: new Date().toISOString()
        };
    }

    // 개발 환경에서도 민감한 정보는 제거
    return {
        message: error.message,
        stack: error.stack,
        // 패스워드, 토큰 등이 포함된 스택 트레이스 필터링 필요
    };
};

// ❌ NEVER DO - 에러 객체 전체 노출
res.status(500).json({ error: error });
```

### **Database Error Handling**
```javascript
// ✅ DO - 데이터베이스 에러 시 안전한 로깅
try {
    await database.connect();
} catch (error) {
    logger.error('Database connection failed:', {
        errorCode: error.code,
        errorMessage: error.message,
        host: config.database.host,
        // 연결 문자열이나 패스워드는 로깅하지 않음
    });
}
```

## **🔍 Debugging Best Practices**

### **Development vs Production Logging**
```javascript
// ✅ DO - 환경별 로깅 레벨
const logConfig = (config) => {
    if (process.env.NODE_ENV === 'development') {
        logger.debug('Full config (dev only):', maskSensitiveData(config));
    } else {
        logger.info('Config validation completed');
    }
};

// ✅ DO - 조건부 상세 로깅
if (process.env.DEBUG_MODE === 'true' && process.env.NODE_ENV !== 'production') {
    logger.debug('Detailed debugging info:', safeDebugData);
}
```

### **Safe Debugging Patterns**
```javascript
// ✅ DO - 안전한 객체 검사
const inspectObject = (obj, label) => {
    const safe = Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        if (typeof value === 'string' && value.length > 20) {
            acc[key] = `${value.substring(0, 10)}...${value.substring(value.length - 5)}`;
        } else if (key.toLowerCase().includes('password') ||
                   key.toLowerCase().includes('secret') ||
                   key.toLowerCase().includes('token')) {
            acc[key] = '***MASKED***';
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});

    logger.debug(`${label}:`, safe);
};
```

## **📝 Code Review Checklist**

### **Before Committing:**
- [ ] 모든 `console.log`에서 민감한 정보 제거 확인
- [ ] 환경변수 직접 출력하는 코드 없는지 확인
- [ ] 에러 응답에서 시스템 정보 노출 방지 확인
- [ ] 테스트 코드에서 실제 크리덴셜 사용하지 않는지 확인

### **Production Deployment:**
- [ ] 모든 디버그 로그 비활성화
- [ ] 민감한 환경변수 마스킹 처리
- [ ] 에러 메시지 sanitization 적용
- [ ] 로그 레벨이 적절히 설정되었는지 확인

## **🚨 Emergency Response**

### **보안 사고 발생 시 대응:**
1. **즉시 조치**: 노출된 크리덴셜 변경
2. **로그 정리**: 가능한 경우 민감한 로그 삭제
3. **시스템 점검**: 추가 노출 여부 확인
4. **재발 방지**: 해당 코드 패턴 프로젝트 전체 검토

### **보안 사고 예방:**
- 민감한 정보를 다루는 코드 작성 시 반드시 페어 리뷰
- 프로덕션 배포 전 로그 출력 내용 전체 검토
- 자동화된 보안 스캔 도구 활용
- 정기적인 보안 감사 실시

---

**⚠️ 경고**: 이 규칙들을 위반하는 코드는 심각한 보안 사고를 일으킬 수 있습니다.
모든 팀원이 이 규칙을 숙지하고 엄격히 준수해야 합니다.

# 🔒 보안 및 환경변수 관리 규칙

## **절대 금지 사항**

### **❌ Docker Compose 파일에 민감한 정보 직접 입력 금지**
- **절대로** `docker-compose.yml`의 `environment` 섹션에 다음 정보를 직접 입력하지 마시오:
  - API 키 (CLOUDINARY_API_KEY, EMAIL_PASS 등)
  - 비밀번호 (DB_PASSWORD, REDIS_PASSWORD 등)
  - 개인 이메일 주소
  - JWT 시크릿 키
  - 기타 민감한 정보

```yaml
# ❌ 절대 하지 말 것
services:
  app:
    environment:
      - DB_PASSWORD=mypassword123
      - API_KEY=sk-1234567890abcdef
      - EMAIL_USER=user@personal.com
```

### **✅ 올바른 방법: 환경변수 파일 사용**
```yaml
# ✅ 올바른 방법
services:
  app:
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - PORT=3000
      # 민감하지 않은 정보만 여기에
```

## **환경변수 파일 관리**

### **✅ 환경별 별도 파일 생성**
- `.env.development` - 개발 환경
- `.env.test` - 테스트 환경
- `.env.production` - 프로덕션 환경
- `.env.local` - 로컬 개발자별 설정

### **✅ 최소 권한 원칙**
```yaml
# 각 서비스는 필요한 환경변수만 접근
services:
  app:
    env_file: .env.production
  test-env:
    env_file: .env.test  # 개발 환경과 분리
```

## **Git 보안**

### **✅ .gitignore 필수 추가**
```gitignore
# 환경변수 파일들
.env
.env.local
.env.*.local
.env.production
.env.staging

# API 키 파일들
config/keys.json
secrets/
```

### **✅ 예제 파일 제공**
- `.env.example` - 필요한 환경변수 목록만 (값은 빈 문자열 또는 예시)
- 실제 값은 포함하지 않음

## **설정 파일 보안**

### **❌ 하드코딩 금지**
```javascript
// ❌ 절대 하지 말 것
const config = {
  dbPassword: 'mypassword123',
  apiKey: 'sk-1234567890abcdef'
};
```

### **✅ 환경변수 사용**
```javascript
// ✅ 올바른 방법
const config = {
  dbPassword: process.env.DB_PASSWORD,
  apiKey: process.env.API_KEY
};
```

## **Docker 컨테이너 보안**

### **✅ 환경변수 우선순위 이해**
1. `environment` 섹션 (최고 우선순위)
2. `env_file` 파일들
3. 시스템 환경변수

### **✅ 테스트 환경 격리**
```yaml
# 테스트 환경은 별도 DB/Redis 사용
test-env:
  env_file: .env.test
  environment:
    - NODE_ENV=test
    - DB_HOST=mysql-test  # 개발 DB와 분리
```

## **코드 리뷰 체크리스트**

- [ ] Docker Compose 파일에 민감한 정보가 없는가?
- [ ] 환경변수 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env.example` 파일이 최신 상태인가?
- [ ] 테스트 환경이 개발 환경과 격리되어 있는가?
- [ ] API 키나 비밀번호가 코드에 하드코딩되어 있지 않은가?

## **응급 조치**

### **민감한 정보가 Git에 커밋된 경우:**
1. 즉시 해당 정보 변경 (비밀번호, API 키 등)
2. Git 히스토리에서 완전 제거
3. `.gitignore` 업데이트
4. 팀원들에게 알림

### **보안 사고 방지:**
- 커밋 전 `git diff` 로 변경사항 검토
- Pre-commit hook 으로 민감한 정보 스캔
- 정기적인 보안 검토

---

**⚠️ 기억하세요:** 한 번 Git에 커밋된 민감한 정보는 히스토리에 영원히 남을 수 있습니다. 예방이 최선의 보안입니다!
