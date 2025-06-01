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
                    ]
                }
            }
        }
    },

    session: {
        cookie: {
            secure: false, // HTTP에서도 작동
            maxAge: 24 * 60 * 60 * 1000 // 24시간
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

            // 개발 API 경로 확인
            if (req.path.startsWith('/api/dev')) {
                return 0; // 개발 API는 무제한
            }

            // 정적파일 여부 확인
            const staticPaths = ['/css/', '/js/', '/images/', '/assets/', '/uploads/'];
            const isStatic = staticPaths.some(path => req.path.startsWith(path));

            if (isStatic) {
                // 정적파일: 개발환경에서는 매우 관대하게
                return 2000;
            } else {
                // 일반 요청: 개발환경에서는 관대하게
                return 500;
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
