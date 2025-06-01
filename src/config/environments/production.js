/**
 * 프로덕션 환경 전용 설정
 */
export default {
    app: {
        debug: false,
        port: parseInt(process.env.PORT, 10) || 3000
    },

    database: {
        logging: false, // 프로덕션에서는 로깅 비활성화
        pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 300000
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
                    // 프로덕션에서는 엄격한 CSP 정책
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
            maxAge: 12 * 60 * 60 * 1000, // 12시간 (보안 강화)
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

            // 정적파일 여부 확인
            const staticPaths = ['/css/', '/js/', '/images/', '/assets/', '/uploads/'];
            const isStatic = staticPaths.some(path => req.path.startsWith(path));

            if (isStatic) {
                return 800;
            } else {
                // 일반 요청: 피크 시간 고려
                return 200;
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

    // 프로덕션 환경 전용 설정
    performance: {
        enableCompression: true,
        enableCaching: true,
        cacheMaxAge: 86400, // 24시간
        enableMinification: true
    },

    monitoring: {
        enableHealthCheck: true,
        enableMetrics: true,
        enableErrorReporting: true
    }
};
