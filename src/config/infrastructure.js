import dotenv from 'dotenv';
import fs from 'fs';

// .env.local 파일이 있으면 로드, 없으면 무시
try {
    if (fs.existsSync('.env.local')) {
        dotenv.config({ path: '.env.local' });
    } else {
        // 기본 .env 파일 로드 시도
        dotenv.config();
    }
} catch (error) {
    console.warn('환경 변수 파일 로드 중 오류 발생:', error.message);
    // 에러가 발생해도 계속 진행
}

// 환경 변수 설정 - 'development', 'test', 'production' 중 하나
const NODE_ENV = process.env.NODE_ENV || 'development';

// Railway 환경에서는 로그 출력
if (NODE_ENV === 'production') {
    console.log('프로덕션 환경에서 실행 중...');
    console.log(`DB 연결 정보 확인:
    - 호스트: ${process.env.MYSQLHOST}
    - 데이터베이스: ${process.env.MYSQL_DATABASE}
    - 포트: ${process.env.MYSQLPORT}`);
}

// 환경에 따른 구성 설정
export const infrastructureConfig = {
    environment: NODE_ENV,
    database: {
        type: NODE_ENV === 'production' ? 'remote' : 'local',
        config: (() => {
            switch (NODE_ENV) {
                case 'production':
                    return {
                        host: process.env.MYSQLHOST,
                        user: process.env.MYSQLUSER,
                        password: process.MYSQLPASSWORD || process.env.DB_PASSWORD,
                        database: process.env.MYSQL_DATABASE,
                        port: process.env.MYSQLPORT,
                        connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 100,
                        queueLimit: process.env.DB_POOL_QUEUE || 0
                    };
                case 'test':
                    return {
                        host: process.env.TEST_DB_HOST || process.env.DB_HOST,
                        user: process.env.TEST_DB_USER || process.env.DB_USER,
                        password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD,
                        database: process.env.TEST_DB_NAME || process.env.DB_NAME,
                        port: process.env.TEST_DB_PORT || process.env.DB_PORT,
                        connectionLimit: parseInt(process.env.TEST_DB_POOL_MAX, 10) || 5,
                        queueLimit: process.env.TEST_DB_POOL_QUEUE || 0
                    };
                case 'development':
                    return {
                        host: process.env.DEV_DB_HOST || process.env.DB_HOST,
                        user: process.env.DEV_DB_USER || process.env.DB_USER,
                        password: process.env.DEV_DB_PASSWORD || process.env.DB_PASSWORD,
                        database: process.env.DEV_DB_NAME || process.env.DB_NAME,
                        port: process.env.DEV_DB_PORT || process.env.DB_PORT,
                        connectionLimit: parseInt(process.env.DEV_DB_POOL_MAX, 10) || 10,
                        queueLimit: process.env.DEV_DB_POOL_QUEUE || 0
                    };
                case 'local':
                default:
                    return {
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME,
                        port: process.env.DB_PORT,
                        connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 10,
                        queueLimit: process.env.DB_POOL_QUEUE || 0
                    };
            }
        })()
    },
    storage: {
        config: (() => {
            const baseConfig = {
                cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY,
                apiSecret: process.env.CLOUDINARY_API_SECRET
            };

            switch (NODE_ENV) {
                case 'production':
                    return {
                        ...baseConfig,
                        environment: 'production',
                        uploadDir: process.env.PROD_UPLOAD_DIR || 'production'
                    };
                case 'test':
                    return {
                        ...baseConfig,
                        environment: 'test',
                        uploadDir: process.env.TEST_UPLOAD_DIR || 'test'
                    };
                case 'development':
                    return {
                        ...baseConfig,
                        environment: 'development',
                        uploadDir: process.env.DEV_UPLOAD_DIR || 'development'
                    };
                case 'local':
                default:
                    return {
                        ...baseConfig,
                        environment: 'local',
                        uploadDir: process.env.LOCAL_UPLOAD_DIR || 'local'
                    };
            }
        })()
    }
};
