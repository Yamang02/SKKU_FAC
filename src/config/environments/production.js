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
                    ],
                    imgSrc: [
                        '\'self\'',
                        'data:', // Base64 이미지 허용
                        'https://res.cloudinary.com', // Cloudinary 이미지
                        'https://*.cloudinary.com'
                    ],
                    connectSrc: ['\'self\'', 'https://api.cloudinary.com', 'https://res.cloudinary.com'],
                    frameSrc: ['\'none\''], // iframe 완전 금지
                    objectSrc: ['\'none\''], // object 요소 금지
                    baseUri: ['\'self\''], // base 태그 제한
                    formAction: ['\'self\''], // form action 제한
                    frameAncestors: ['\'none\''], // 외부 사이트에서 iframe 금지
                    manifestSrc: ['\'self\''],
                    mediaSrc: ['\'self\'', 'https://res.cloudinary.com'],
                    workerSrc: ['\'self\''],
                    childSrc: ['\'none\'']
                },
                upgradeInsecureRequests: true // 프로덕션에서는 HTTPS 강제
            },
            crossOriginEmbedderPolicy: true
        },
        // 추가 보안 헤더
        additionalHeaders: {
            'X-Download-Options': 'noopen',
            'X-Permitted-Cross-Domain-Policies': 'none',
            'Clear-Site-Data': '"cache", "cookies", "storage"', // 로그아웃 시 사용
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Resource-Policy': 'same-origin'
        }
    },

    session: {
        cookie: {
            secure: true, // HTTPS 필수
            maxAge: 12 * 60 * 60 * 1000, // 12시간 (보안 강화)
            httpOnly: true,
            sameSite: 'strict',
            // 추가 보안 설정
            domain: process.env.SESSION_DOMAIN || undefined, // 도메인 제한
            path: '/' // 경로 제한
        },
        // 세션 보안 강화
        name: process.env.SESSION_NAME || 'gallery_sid', // 기본 세션명 변경
        genid: () => {
            // 더 안전한 세션 ID 생성
            return require('crypto').randomBytes(32).toString('hex');
        },
        // 세션 재생성 정책
        rolling: true, // 활동 시 세션 갱신
        unset: 'destroy', // 세션 속성 삭제 시 세션 파괴
        // 보안 옵션
        proxy: true // 프록시 환경에서 secure 쿠키 활성화
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15분
        max: 100, // 프로덕션에서는 엄격한 제한
        skipPaths: ['/health', '/favicon.ico']
    },

    // JWT 설정 (프로덕션 환경 - 보안 우선)
    jwt: {
        accessTokenExpiry: '15m', // 15분 (보안 강화)
        refreshTokenExpiry: '7d', // 7일 (적절한 보안 수준)
        issuer: 'skku-fac-gallery',
        audience: 'skku-fac-gallery-users'
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
