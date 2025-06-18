/**
 * 로컬 테스트 환경 전용 설정
 */
import { baseConfig, mergeConfig } from './base.js';

const localTestOverrides = {
    app: {
        debug: true,
        port: 3001
    },

    database: {
        logging: false, // 테스트에서는 DB 로그 비활성화
        pool: {
            max: 3,
            min: 0,
            acquire: 15000,
            idle: 5000
        }
    },

    redis: {
        host: process.env.REDIS_HOST || 'redis-test', // 테스트용 Docker 컨테이너 이름
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || 'testredispass', // 테스트용 비밀번호
        db: 0,
        maxRetriesPerRequest: 2,
        retryDelayOnFailover: 50,
        connectTimeout: 5000,
        lazyConnect: true
    },

    logging: {
        level: 'warn', // 테스트에서는 경고 이상만 로그
        enableFileLogging: false,
        enableConsoleLogging: true
    },

    security: {
        csp: {
            contentSecurityPolicy: {
                directives: {
                    scriptSrc: [
                        '\'self\'',
                        '\'unsafe-inline\'',
                        '\'unsafe-eval\'',
                        'https://cdn.jsdelivr.net',
                        'blob:'
                    ],
                    connectSrc: [
                        '\'self\'',
                        'https://api.cloudinary.com',
                        'https://res.cloudinary.com',
                        'ws://localhost:*',
                        'wss://localhost:*'
                    ]
                }
            }
        },
        additionalHeaders: {
            'X-Test-Mode': 'true'
        }
    },

    session: {
        cookie: {
            secure: false,
            maxAge: 60 * 60 * 1000 // 1시간 (테스트용 짧게)
        },
        name: 'test_gallery_sid'
    },

    rateLimit: {
        windowMs: 5 * 60 * 1000, // 5분
        max: 1000, // 테스트에서는 더 관대하게
        message: 'API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    },

    jwt: {
        accessTokenExpiry: '30m',
        refreshTokenExpiry: '7d',
        issuer: 'skku-fac-gallery-test',
        audience: 'skku-fac-gallery-test-users'
    }
};

export default mergeConfig(baseConfig, localTestOverrides);
