import dotenv from 'dotenv';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

const isLocal = process.env.NODE_ENV === 'local';

export const infrastructureConfig = {
    database: {
        type: isLocal ? 'local' : 'remote',
        config: isLocal ? {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 10,
            queueLimit: process.env.DB_POOL_QUEUE || 0
        } : {
            host: process.env.REMOTE_DB_HOST,
            user: process.env.REMOTE_DB_USER,
            password: process.env.REMOTE_DB_PASSWORD,
            database: process.env.REMOTE_DB_NAME,
            port: process.env.REMOTE_DB_PORT,
            connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 10,
            queueLimit: process.env.DB_POOL_QUEUE || 0
        }
    },
    storage: {
        type: isLocal ? 'local' : 'cloudinary',
        config: isLocal ? {
            uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
            maxFileSize: process.env.MAX_FILE_SIZE || 5242880
        } : {
            cloudName: process.env.CLOUD_NAME,
            apiKey: process.env.CLOUD_API_KEY,
            apiSecret: process.env.CLOUD_API_SECRET
        }
    }
};
