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
        max: (req) => {
            // 헬스체크와 파비콘은 제외
            const alwaysSkip = ['/health', '/favicon.ico'];
            if (alwaysSkip.some(path => req.path === path)) {
                return 0; // 무제한
            }

            // 스테이징 API 경로 확인
            if (req.path.startsWith('/staging')) {
                return 0; // 스테이징 API는 무제한
            }

            // 정적파일 여부 확인
            const staticPaths = ['/css/', '/js/', '/images/', '/assets/', '/uploads/'];
            const isStatic = staticPaths.some(path => req.path.startsWith(path));

            if (isStatic) {
                // 정적파일: 스테이징에서는 적당히 관대하게
                return 300;
            } else {
                // 일반 요청: 스테이징에서는 프로덕션과 개발 사이
                return 100;
            }
        },
        message: (req) => {
            const staticPaths = ['/css/', '/js/', '/images/', '/assets/', '/uploads/'];
            const isStatic = staticPaths.some(path => req.path.startsWith(path));

            if (isStatic) {
                return '정적파일 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            } else {
                return 'API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            }
        }
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
