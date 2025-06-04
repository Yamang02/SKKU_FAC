/**
 * 개발 환경 전용 설정 (로컬 환경, Cloudinary/Redis는 테스트와 공유)
 */
export default {
    app: {
        debug: true,
        port: 3000
    },

    database: {
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },

    // Cloudinary 설정 (테스트 환경과 동일)
    storage: {
        // 테스트 환경과 동일한 Cloudinary 설정 사용
        environment: 'test', // 테스트 환경 폴더 사용
        uploadDir: 'test' // 테스트와 동일한 업로드 디렉토리
    },

    // Redis 설정 (테스트 환경과 동일)
    redis: {
        // 테스트 환경과 동일한 Redis 인스턴스 사용
        useTestInstance: true,
        keyPrefix: 'test:', // 테스트와 동일한 키 프리픽스
        database: 1 // 테스트와 동일한 DB 번호
    },

    logging: {
        level: 'debug',
        enableFileLogging: true,
        enableConsoleLogging: true,
        logDir: 'logs'
    },

    security: {
        csp: {
            contentSecurityPolicy: {
                directives: {
                    // 개발 환경에서는 더 관대한 CSP 정책
                    defaultSrc: ['\'self\''],
                    scriptSrc: [
                        '\'self\'',
                        '\'unsafe-inline\'',
                        '\'unsafe-eval\'', // 개발 도구를 위해 허용
                        'https://developers.kakao.com',
                        'https://t1.kakaocdn.net',
                        'https://k.kakaocdn.net',
                        'https://cdn.jsdelivr.net',
                        'blob:'
                    ],
                    styleSrc: [
                        '\'self\'',
                        '\'unsafe-inline\'', // 개발 환경에서 인라인 스타일 허용
                        'https://cdnjs.cloudflare.com',
                        'https://fonts.googleapis.com'
                    ],
                    fontSrc: [
                        '\'self\'',
                        'https://fonts.googleapis.com',
                        'https://fonts.gstatic.com',
                        'https://cdnjs.cloudflare.com'
                    ],
                    imgSrc: [
                        '\'self\'',
                        'data:', // Base64 이미지 허용
                        'blob:', // Blob URL 허용
                        'https://res.cloudinary.com', // Cloudinary 이미지
                        'https://*.cloudinary.com'
                    ],
                    connectSrc: [
                        '\'self\'',
                        'https://api.cloudinary.com',
                        'https://res.cloudinary.com',
                        'ws://localhost:*', // 개발 서버 웹소켓
                        'wss://localhost:*'
                    ],
                    frameSrc: ['\'none\''], // iframe 금지
                    objectSrc: ['\'none\''], // object 요소 금지
                    baseUri: ['\'self\''], // base 태그 제한
                    formAction: ['\'self\''], // form action 제한
                    frameAncestors: ['\'none\''], // 외부 사이트에서 iframe 금지
                    manifestSrc: ['\'self\''],
                    mediaSrc: ['\'self\'', 'https://res.cloudinary.com'],
                    workerSrc: ['\'self\'', 'blob:'],
                    childSrc: ['\'self\'']
                }
            },
            crossOriginEmbedderPolicy: false // 개발 환경에서는 비활성화
        },
        additionalHeaders: {
            'X-Development-Mode': 'true',
            'X-Debug-Info': 'enabled'
        },
        staticFiles: {
            setHeaders: (res, filePath) => {
                // 개발 환경에서는 캐시 비활성화
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');

                // 정적 파일별 보안 헤더
                if (filePath.includes('.js')) {
                    res.setHeader('X-Content-Type-Options', 'nosniff');
                }
            }
        }
    },

    session: {
        cookie: {
            secure: false, // HTTP에서도 작동
            maxAge: 24 * 60 * 60 * 1000, // 24시간
            httpOnly: true,
            sameSite: 'lax', // 개발 환경에서는 lax 모드
            path: '/'
        },
        name: 'dev_gallery_sid', // 개발 환경 세션명
        rolling: true,
        unset: 'destroy',
        proxy: false // 개발 환경에서는 프록시 없음
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15분
        max: 1000, // 개발 환경에서는 더 관대한 제한
        skipPaths: ['/health', '/favicon.ico', '/api/dev']
    },

    // JWT 설정 (개발 환경 - 편의성 우선)
    jwt: {
        accessTokenExpiry: '1h',      // 1시간 (개발 시 자주 만료되면 불편)
        refreshTokenExpiry: '30d',    // 30일 (개발 편의성)
        issuer: 'skku-fac-gallery-dev',
        audience: 'skku-fac-gallery-dev-users'
    },

    // 개발 환경 전용 설정
    devTools: {
        enableHotReload: true,
        enableSourceMaps: true,
        enableDebugRoutes: true
    },

    // 외부 서비스 공유 설정
    externalServices: {
        cloudinary: {
            shareWithTest: true, // 테스트 환경과 Cloudinary 공유
            useTestFolder: true
        },
        redis: {
            shareWithTest: true, // 테스트 환경과 Redis 공유
            useTestDatabase: true
        }
    }
};
