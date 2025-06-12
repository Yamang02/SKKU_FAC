/**
 * 개발 환경 전용 설정 (간소화됨)
 */
import { baseConfig, mergeConfig } from './base.js';

const developmentOverrides = {
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

    redis: {
        host: process.env.REDIS_HOST || 'redis', // Docker 컨테이너 이름
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || 'devredispass', // 개발용 비밀번호
        db: 0,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        connectTimeout: 10000,
        lazyConnect: true
    },

    logging: {
        level: 'info',
        enableFileLogging: true,
        enableConsoleLogging: true
    },

    security: {
        csp: {
            contentSecurityPolicy: {
                directives: {
                    // 개발 환경 추가 허용
                    scriptSrc: [
                        '\'self\'',
                        '\'unsafe-inline\'',
                        '\'unsafe-eval\'', // 개발 도구용
                        'https://cdn.jsdelivr.net',
                        'blob:'
                    ],
                    connectSrc: [
                        '\'self\'',
                        'https://api.cloudinary.com',
                        'https://res.cloudinary.com',
                        'ws://localhost:*', // 개발 웹소켓
                        'wss://localhost:*'
                    ]
                }
            }
        },
        additionalHeaders: {
            'X-Development-Mode': 'true'
        }
    },

    session: {
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000 // 24시간
        },
        name: 'dev_gallery_sid'
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 500, // 개발환경은 관대하게
        message: 'API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    },

    jwt: {
        accessTokenExpiry: '1h',
        refreshTokenExpiry: '30d',
        issuer: 'skku-fac-gallery-dev',
        audience: 'skku-fac-gallery-dev-users'
    }
};

export default mergeConfig(baseConfig, developmentOverrides);
