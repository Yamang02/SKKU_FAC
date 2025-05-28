# ErrorHandler 고급 커스터마이징 가이드

SKKU 미술동아리 갤러리 프로젝트의 ErrorHandler는 고도로 커스터마이징이 가능한 중앙집중식 에러 처리 시스템입니다. 이 문서는 ErrorHandler의 고급 설정 및 커스터마이징 방법을 설명합니다.

## 목차

1. [기본 설정](#기본-설정)
2. [환경별 설정](#환경별-설정)
3. [로깅 커스터마이징](#로깅-커스터마이징)
4. [응답 형식 커스터마이징](#응답-형식-커스터마이징)
5. [에러 필터링](#에러-필터링)
6. [에러 변환](#에러-변환)
7. [커스텀 핸들러](#커스텀-핸들러)
8. [에러 통계](#에러-통계)
9. [동적 설정 변경](#동적-설정-변경)
10. [실사용 예시](#실사용-예시)

## 기본 설정

```javascript
import ErrorHandler from '../common/middleware/ErrorHandler.js';

// 기본 설정으로 ErrorHandler 생성
const { errorHandler, notFoundHandler, handler } = ErrorHandler.create();

// 기본 옵션 지정
const { errorHandler, notFoundHandler, handler } = ErrorHandler.create({
    isDevelopment: process.env.NODE_ENV === 'development',
    includeStackTrace: true,
    enableDetailedLogging: true
});
```

## 환경별 설정

환경별로 다른 에러 처리 전략을 적용할 수 있습니다:

```javascript
const environmentConfig = {
    development: {
        includeStackTrace: true,
        enableDetailedLogging: true,
        logLevel: 'debug',
        showInternalErrors: true
    },
    testing: {
        includeStackTrace: false,
        enableDetailedLogging: false,
        logLevel: 'error',
        showInternalErrors: false
    },
    staging: {
        includeStackTrace: false,
        enableDetailedLogging: true,
        logLevel: 'warn',
        showInternalErrors: false
    },
    production: {
        includeStackTrace: false,
        enableDetailedLogging: false,
        logLevel: 'error',
        showInternalErrors: false
    }
};

const errorHandler = new ErrorHandler({
    environmentConfig
});
```

### 환경별 설정 옵션

- **includeStackTrace**: 스택 트레이스 포함 여부
- **enableDetailedLogging**: 상세 로깅 활성화
- **logLevel**: 로그 레벨 ('debug', 'info', 'warn', 'error')
- **showInternalErrors**: 내부 에러 정보 노출 여부

## 로깅 커스터마이징

로깅 동작을 세밀하게 제어할 수 있습니다:

```javascript
const loggingConfig = {
    enableMetrics: true,           // 에러 통계 수집
    enableRequestId: true,         // 요청 ID 추가
    excludeFields: [               // 로그에서 제외할 민감한 필드
        'password', 'token', 'authorization', 'cookie',
        'x-auth-token', 'x-api-key', 'access_token', 'refresh_token'
    ],
    maxBodySize: 2048,            // 요청 본문 최대 크기 (bytes)
    customFields: {               // 모든 로그에 추가할 커스텀 필드
        service: 'skku-gallery',
        version: process.env.APP_VERSION || '1.0.0'
    }
};

const errorHandler = new ErrorHandler({
    loggingConfig
});
```

### 민감한 정보 보호

로깅 시스템은 자동으로 민감한 정보를 제거합니다:

- **요청 헤더**: Authorization, Cookie 등
- **요청 본문**: password, token 등
- **크기 제한**: 설정된 크기를 초과하는 본문은 자동으로 잘림

## 응답 형식 커스터마이징

API 응답과 HTML 응답의 형식을 커스터마이징할 수 있습니다:

```javascript
const responseConfig = {
    // 커스텀 API 응답 템플릿
    apiResponseTemplate: (errorInfo, showInternalErrors) => ({
        success: false,
        error: {
            message: errorInfo.message,
            code: errorInfo.code,
            statusCode: errorInfo.statusCode,
            timestamp: new Date().toISOString(),
            requestId: errorInfo.requestId,
            ...(showInternalErrors && {
                name: errorInfo.name,
                details: errorInfo.details,
                stack: errorInfo.stack,
                category: errorInfo.category,
                severity: errorInfo.severity
            })
        },
        meta: {
            service: 'skku-gallery',
            version: process.env.APP_VERSION || '1.0.0'
        }
    }),

    htmlErrorTemplate: 'common/error',    // EJS 템플릿 경로
    enableCors: true,                     // CORS 설정 활성화
    customHeaders: {                      // 커스텀 헤더 추가
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    }
};

const errorHandler = new ErrorHandler({
    responseConfig
});
```

## 에러 필터링

특정 에러들을 무시하거나 다르게 처리할 수 있습니다:

```javascript
const filterRules = {
    // 무시할 상태 코드
    ignoreStatusCodes: [404],

    // 무시할 URL 패턴 (정규식)
    ignorePatterns: [
        '/favicon\\.ico',
        '/robots\\.txt',
        '/sitemap\\.xml',
        '\\.map$',        // source map 파일
        '/health',        // 헬스체크 엔드포인트
        '/metrics'        // 메트릭 엔드포인트
    ],

    // 무시할 User-Agent (봇, 크롤러 등)
    ignoreUserAgents: [
        'Googlebot', 'bingbot', 'Slurp', 'DuckDuckBot',
        'Baiduspider', 'YandexBot', 'facebookexternalhit',
        'Twitterbot', 'LinkedInBot', 'WhatsApp', 'Telegram'
    ]
};

const errorHandler = new ErrorHandler({
    filterRules
});
```

### 필터링 규칙 활용 사례

- **봇 트래픽 무시**: 검색엔진 봇이나 소셜미디어 크롤러의 404 에러 무시
- **헬스체크 무시**: 로드밸런서나 모니터링 시스템의 요청 무시
- **정적 파일 무시**: favicon, robots.txt 등의 404 에러 무시

## 에러 변환

내부 에러를 사용자 친화적인 메시지로 변환할 수 있습니다:

```javascript
const transformRules = {
    // 메시지 변환 (정규식 패턴 -> 대체값)
    messageTransforms: {
        // 데이터베이스 관련 에러
        'SequelizeConnectionError': '데이터베이스 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        'SequelizeValidationError': '입력하신 정보에 오류가 있습니다. 다시 확인해주세요.',
        'SequelizeUniqueConstraintError': '이미 존재하는 정보입니다.',

        // Cloudinary 관련 에러
        'CloudinaryError': '이미지 처리 중 문제가 발생했습니다.',

        // 일반적인 에러 패턴
        'ECONNREFUSED': '외부 서비스 연결에 실패했습니다.',
        'ENOTFOUND': '요청하신 리소스를 찾을 수 없습니다.',
        'TIMEOUT': '요청 처리 시간이 초과되었습니다.',

        // 함수형 변환 (동적 변환)
        'Invalid.*token': (message, error, req) => {
            return '인증이 만료되었습니다. 다시 로그인해주세요.';
        }
    },

    // 에러 코드 변환
    codeTransforms: {
        'INTERNAL_ERROR': 'SERVICE_TEMPORARILY_UNAVAILABLE',
        'DB_CONNECTION_ERROR': 'SERVICE_TEMPORARILY_UNAVAILABLE'
    }
};

const errorHandler = new ErrorHandler({
    transformRules
});
```

## 커스텀 핸들러

특정 에러 타입에 대한 맞춤형 처리 로직을 정의할 수 있습니다:

```javascript
const customHandlers = {
    // 에러 타입별 핸들러
    byType: {
        'UnauthorizedError': (err, req, res, next) => {
            // 인증 실패 로깅
            logger.warn('인증 실패 시도', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl
            });

            // API 요청인 경우 JSON 응답
            if (req.originalUrl.startsWith('/api')) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: '인증이 필요합니다.',
                        code: 'AUTHENTICATION_REQUIRED',
                        statusCode: 401
                    }
                });
            }

            // 웹 요청인 경우 로그인 페이지로 리다이렉트
            req.session.returnUrl = req.originalUrl;
            return res.redirect('/auth/login');
        },

        'ImageUploadError': (err, req, res, next) => {
            // 이미지 업로드 실패 처리
            return res.status(400).json({
                success: false,
                error: {
                    message: '이미지 업로드에 실패했습니다.',
                    code: 'IMAGE_UPLOAD_FAILED',
                    statusCode: 400
                }
            });
        }
    },

    // 상태 코드별 핸들러
    byStatusCode: {
        429: (err, req, res, next) => {
            const retryAfter = 60;
            res.set('Retry-After', retryAfter);

            if (req.originalUrl.startsWith('/api')) {
                return res.status(429).json({
                    success: false,
                    error: {
                        message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
                        code: 'RATE_LIMIT_EXCEEDED',
                        statusCode: 429,
                        retryAfter: retryAfter
                    }
                });
            }

            return res.status(429).render('common/error', {
                title: '요청 제한',
                message: '요청이 너무 많습니다.',
                error: { code: 429 }
            });
        }
    },

    // 에러 코드별 핸들러
    byCode: {
        'FILE_TOO_LARGE': (err, req, res, next) => {
            return res.status(413).json({
                success: false,
                error: {
                    message: '파일 크기가 너무 큽니다.',
                    code: 'FILE_TOO_LARGE',
                    statusCode: 413,
                    maxSize: '10MB'
                }
            });
        }
    }
};

const errorHandler = new ErrorHandler({
    customHandlers
});
```

## 에러 통계

실시간으로 에러 통계를 수집하고 조회할 수 있습니다:

```javascript
// 에러 통계 조회
const stats = handler.getErrorStats();
console.log(stats);
// {
//   total: 42,
//   byType: {
//     'BadRequestError': 15,
//     'UnauthorizedError': 8,
//     'NotFoundError': 19
//   },
//   byStatus: {
//     400: 15,
//     401: 8,
//     404: 19
//   },
//   bySeverity: {
//     low: 19,
//     medium: 15,
//     high: 8
//   },
//   uptime: 3600.25,
//   timestamp: '2024-01-15T10:30:00.000Z'
// }

// 에러 통계 초기화
handler.resetErrorStats();
```

## 동적 설정 변경

런타임에 설정을 변경할 수 있습니다:

```javascript
// 설정 업데이트
handler.updateConfig({
    filterRules: {
        ignoreStatusCodes: [404, 403]
    },
    loggingConfig: {
        enableMetrics: false
    }
});

// 커스텀 핸들러 등록
handler.registerCustomHandler('byType', 'MyCustomError', (err, req, res, next) => {
    // 커스텀 처리 로직
});

// 에러 변환 규칙 추가
handler.addTransformRule('messageTransforms', 'timeout', 'Request timed out');
```

## 실사용 예시

### 1. 프로덕션 환경 설정

```javascript
// src/config/errorHandlerConfig.js
import errorHandlerConfig from '../config/errorHandlerConfig.js';

// AppInitializer에서 사용
const { errorHandler, notFoundHandler, handler } = ErrorHandler.create(errorHandlerConfig);
app.use(notFoundHandler);
app.use(errorHandler);

// 런타임 설정 변경을 위해 핸들러 인스턴스 저장
app.set('errorHandler', handler);
```

### 2. 에러 모니터링 통합

```javascript
// 에러 통계를 주기적으로 모니터링 시스템에 전송
setInterval(() => {
    const errorHandler = app.get('errorHandler');
    const stats = errorHandler.getErrorStats();

    // 외부 모니터링 시스템에 전송
    monitoringService.sendMetrics('error_stats', stats);
}, 60000); // 1분마다
```

### 3. A/B 테스트를 위한 동적 설정

```javascript
// 특정 조건에서 에러 처리 방식 변경
app.get('/admin/error-config', (req, res) => {
    const errorHandler = req.app.get('errorHandler');

    if (req.query.mode === 'verbose') {
        errorHandler.updateConfig({
            environmentConfig: {
                [process.env.NODE_ENV]: {
                    enableDetailedLogging: true,
                    showInternalErrors: true
                }
            }
        });
    }

    res.json({ message: 'Error configuration updated' });
});
```

## 보안 고려사항

1. **민감한 정보 보호**: `excludeFields` 설정을 통해 패스워드, 토큰 등 제거
2. **프로덕션 환경**: `showInternalErrors: false`로 설정하여 내부 정보 노출 방지
3. **로그 크기 제한**: `maxBodySize` 설정으로 로그 크기 제한
4. **헤더 보안**: `customHeaders`를 통해 보안 헤더 추가

## 성능 고려사항

1. **필터링 규칙**: 불필요한 에러 로깅을 줄여 성능 향상
2. **통계 수집**: `enableMetrics: false`로 설정하여 통계 수집 비활성화 가능
3. **로그 레벨**: 프로덕션에서는 'error' 레벨만 로깅하여 성능 최적화

---

이 문서는 ErrorHandler의 모든 커스터마이징 옵션을 다룹니다. 프로젝트의 요구사항에 맞게 적절히 조합하여 사용하시기 바랍니다.
