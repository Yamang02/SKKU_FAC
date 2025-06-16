/**
 * Railway 테스트 환경 전용 설정 (간소화됨)
 */
import { baseConfig, mergeConfig } from './base.js';

const testOverrides = {
    app: {
        debug: false,
        port: parseInt(process.env.PORT, 10) || 3000
    },

    database: {
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 30000
        }
    },

    logging: {
        level: 'info',
        enableFileLogging: false, // Railway에서는 불필요
        enableConsoleLogging: true
    },

    session: {
        cookie: {
            secure: true, // Railway HTTPS 환경
            maxAge: 24 * 60 * 60 * 1000 // 24시간
        }
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 10000, // 테스트는 매우 관대하게
        message: '테스트 환경에서 요청 제한에 도달했습니다.'
    },

    jwt: {
        accessTokenExpiry: '10m',
        refreshTokenExpiry: '1h',
        issuer: 'skku-fac-gallery',
        audience: 'skku-fac-gallery-users'
    }
};

export default mergeConfig(baseConfig, testOverrides);
