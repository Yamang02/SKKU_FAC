/**
 * 로컬 테스트 환경 전용 설정 (간소화됨)
 */
import { baseConfig, mergeConfig } from './base.js';

const localTestOverrides = {
    app: {
        debug: false,
        port: 3000
    },

    database: {
        logging: false,
        pool: {
            max: 3,
            min: 1,
            acquire: 15000,
            idle: 5000
        }
    },

    logging: {
        level: 'warn',
        enableFileLogging: false,
        enableConsoleLogging: true
    },

    session: {
        cookie: {
            secure: false,
            maxAge: 30 * 60 * 1000 // 30분
        },
        name: 'local_test_gallery_sid',
        rolling: false
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 1000, // 테스트환경은 관대하게
        message: '테스트 환경에서 요청 제한에 도달했습니다.'
    },

    jwt: {
        accessTokenExpiry: '15m',
        refreshTokenExpiry: '2h',
        issuer: 'skku-fac-gallery-local-test',
        audience: 'skku-fac-gallery-local-test-users'
    }
};

export default mergeConfig(baseConfig, localTestOverrides);
