/**
 * 스테이징 환경 전용 설정 (현재 미사용, 추후 도입 예정)
 * 프로덕션과 유사하지만 테스트 및 검증을 위한 추가 기능 포함
 */
export default {
    app: {
        debug: false,
        port: parseInt(process.env.PORT, 10) || 3000
    },

    database: {
        logging: false, // Railway에서는 로깅 비활성화
        pool: {
            max: 15, // 프로덕션보다 작지만 충분한 크기
            min: 3,
            acquire: 45000,
            idle: 200000
        }
    },

    logging: {
        level: 'info',
        enableFileLogging: false, // Railway에서는 파일 로깅 비활성화
        enableConsoleLogging: true,
        logDir: 'logs'
    },

    security: {
        csp: {
            contentSecurityPolicy: {
                directives: {
                    // 프로덕션과 동일한 보안 정책
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
            secure: true, // HTTPS 필수
            maxAge: 24 * 60 * 60 * 1000, // 24시간 (프로덕션보다 길게)
            httpOnly: true,
            sameSite: 'strict'
        }
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15분
        max: 200, // 스테이징에서는 프로덕션보다 약간 관대
        skipPaths: ['/health', '/favicon.ico', '/api/staging']
    },

    // JWT 설정 (스테이징 환경 - 프로덕션 준비)
    jwt: {
        accessTokenExpiry: '30m',     // 30분 (프로덕션보다 약간 여유)
        refreshTokenExpiry: '14d',    // 14일 (프로덕션보다 길게)
        issuer: 'skku-fac-gallery-staging',
        audience: 'skku-fac-gallery-staging-users'
    },

    // 스테이징 환경 전용 설정
    staging: {
        enableTestData: true, // 테스트 데이터 활성화
        enableDebugRoutes: false, // 보안상 비활성화
        enablePerformanceMonitoring: true,
        enableErrorSimulation: false // 실제 서비스 테스트를 위해 비활성화
    },

    // 성능 최적화 (프로덕션과 동일)
    performance: {
        enableCompression: true,
        enableCaching: true,
        cacheMaxAge: 43200, // 12시간 (프로덕션보다 짧게)
        enableMinification: true
    },

    // 모니터링 (프로덕션보다 상세)
    monitoring: {
        enableHealthCheck: true,
        enableMetrics: true,
        enableErrorReporting: true,
        enableDetailedLogging: true
    },

    // 기능 플래그 (새 기능 테스트용)
    features: {
        enableBetaFeatures: true,
        enableA11yTesting: true,
        enablePerformanceTesting: true
    },

    // 알림 설정 (스테이징 전용)
    notifications: {
        enableSlackAlerts: true,
        enableEmailAlerts: false, // 스팸 방지
        alertThreshold: 'warning'
    }
};
