import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import config from '../../config/Config.js';
import { setupCSRFProtection } from './csrfProtection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 기본 미들웨어 설정 (보안 및 CORS 포함)
 */
export function setupBasicMiddleware(app) {
    // 1. CORS 설정 (가장 먼저)
    const corsConfig = config.get('cors');
    if (corsConfig) {
        app.use(cors(corsConfig));
    }

    // 2. Helmet 보안 헤더
    const securityConfig = config.get('security');
    if (securityConfig) {
        app.use(helmet({
            contentSecurityPolicy: securityConfig.csp?.contentSecurityPolicy || false,
            crossOriginEmbedderPolicy: securityConfig.csp?.crossOriginEmbedderPolicy || false,
            ...securityConfig.additionalHeaders && {
                customHeaders: securityConfig.additionalHeaders
            }
        }));
    }

    // 3. Body Parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 4. 정적 파일 서빙
    const publicPath = path.resolve(__dirname, '../../public');
    app.use(express.static(publicPath));
    app.use('/uploads', express.static(path.join(publicPath, 'uploads')));
}

/**
 * 세션 관련 미들웨어 (필수)
 */
export function setupSessionMiddleware(app) {
    // CSRF 보호 미들웨어 설정 (세션 설정 후에 실행되어야 함)
    setupCSRFProtection(app);
}
