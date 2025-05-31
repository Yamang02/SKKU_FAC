/**
 * 테스트 환경 전용 설정 (Railway 배포 환경)
 */
export default {
    app: {
        debug: false,
        port: parseInt(process.env.PORT, 10) || 3000 // Railway 포트 사용
    },

    database: {
        logging: false, // Railway에서는 로깅 비활성화
        pool: {
            max: 10, // Railway 환경에 맞는 풀 크기
            min: 2,
            acquire: 30000,
            idle: 10000
        }
    },

    logging: {
        level: 'info', // Railway 로그에서 확인 가능한 레벨
        enableFileLogging: false, // Railway에서는 파일 로깅 비활성화
        enableConsoleLogging: true, // Railway 콘솔 로그 활성화
        logDir: 'logs'
    },

    security: {
        csp: {
            contentSecurityPolicy: {
                directives: {
                    // 테스트 환경에서도 적절한 보안 정책
                    defaultSrc: ['\'self\''],
                    scriptSrc: [
                        '\'self\'',
                        'https://developers.kakao.com',
                        'https://t1.kakaocdn.net',
                        'https://k.kakaocdn.net',
                        'https://cdn.jsdelivr.net',
                        'blob:'
                    ],
                    styleSrc: [
                        '\'self\'',
                        'https://cdnjs.cloudflare.com',
                        'https://fonts.googleapis.com',
                        '\'unsafe-inline\''
                    ],
                    fontSrc: [
                        '\'self\'',
                        'https://fonts.googleapis.com',
                        'https://cdnjs.cloudflare.com',
                        'https://fonts.gstatic.com'
                    ]
                }
            }
        }
    },

    session: {
        cookie: {
            secure: true, // Railway HTTPS 환경
            maxAge: 24 * 60 * 60 * 1000, // 24시간
            httpOnly: true,
            sameSite: 'strict'
        }
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15분
        max: 500, // 테스트 환경에서는 프로덕션보다 관대
        skipPaths: ['/health', '/favicon.ico', '/test']
    },

    // 테스트 환경 전용 설정
    testing: {
        enableMocking: false, // Railway 환경에서는 실제 서비스 테스트
        enableTestRoutes: true,
        enableTestDatabase: false, // 실제 DB 사용
        resetDatabaseOnStart: false
    },

    // 테스트용 기능들
    features: {
        enableBetaFeatures: true, // 베타 기능 테스트
        enableA11yTesting: true,
        enablePerformanceTesting: true
    },

    // 모니터링 (프로덕션보다 상세)
    monitoring: {
        enableHealthCheck: true,
        enableMetrics: true,
        enableErrorReporting: true,
        enableDetailedLogging: true
    },

    // Redis 설정 (Railway 환경)
    redis: {
        keyPrefix: 'test:',
        database: 1 // 테스트 전용 DB
    }
};
