import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import methodOverride from 'method-override';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import { cspConfig, rateLimitConfig, staticFileConfig } from '../../config/security.js';
import { createUploadDirs } from '../utils/createUploadDirs.js';
import logger from '../utils/Logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 기본 미들웨어 설정
 */
export function setupBasicMiddleware(app, swaggerDocument) {
    // 업로드 디렉토리 생성
    createUploadDirs();

    // 보안 미들웨어
    app.use(helmet(cspConfig));

    // HTTPS 리디렉션 (프로덕션 환경)
    app.use((req, res, next) => {
        if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    });

    // Rate Limiter
    app.use(rateLimit(rateLimitConfig));

    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Body Parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // HTTP 메서드 재정의
    app.use(methodOverride('_method'));

    // 정적 파일 제공
    setupStaticFiles(app);

    // 프로덕션 환경에서 프록시 신뢰 설정
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }

    logger.success('기본 미들웨어 설정 완료');
}

/**
 * 정적 파일 설정
 */
function setupStaticFiles(app) {
    const publicPath = path.resolve(__dirname, '../../public');

    app.use(express.static(publicPath, staticFileConfig));
    app.use('/assets', express.static(path.join(publicPath, 'assets'), staticFileConfig));
    app.use('/css', express.static(path.join(publicPath, 'css'), staticFileConfig));
    app.use('/js', express.static(path.join(publicPath, 'js'), staticFileConfig));
    app.use('/images', express.static(path.join(publicPath, 'images'), staticFileConfig));
    app.use('/uploads', express.static(path.join(publicPath, 'uploads'), staticFileConfig));
}
