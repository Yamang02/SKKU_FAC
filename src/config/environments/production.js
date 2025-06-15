/**
 * 프로덕션 환경 전용 설정 (간소화됨)
 */
import { baseConfig, mergeConfig } from './base.js';

const productionOverrides = {
    app: {
        debug: false,
        port: parseInt(process.env.PORT, 10) || 3000
    },

    database: {
        logging: false,
        pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 300000
        }
    },

    logging: {
        level: 'info',
        enableFileLogging: false, // Railway에서는 불필요
        enableConsoleLogging: true
    },

    security: {
        csp: {
            contentSecurityPolicy: {
                directives: {
                    // 프로덕션 추가 제한
                    scriptSrc: [
                        '\'self\'',
                        'https://cdn.jsdelivr.net',
                        'blob:'
                    ],
                    styleSrc: [
                        '\'self\'',
                        '\'unsafe-inline\'',
                        'https://fonts.googleapis.com'
                    ]
                },
                upgradeInsecureRequests: true
            },
            crossOriginEmbedderPolicy: true
        }
    },

    session: {
        cookie: {
            secure: true, // HTTPS 필수
            maxAge: 12 * 60 * 60 * 1000, // 12시간
            sameSite: 'strict'
        },
        name: 'gallery_sid',
        proxy: true
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 200, // 프로덕션은 엄격하게
        message: 'API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    },

    jwt: {
        accessTokenExpiry: '15m',
        refreshTokenExpiry: '7d',
        issuer: 'skku-fac-gallery',
        audience: 'skku-fac-gallery-users'
    }
};

export default mergeConfig(baseConfig, productionOverrides);
