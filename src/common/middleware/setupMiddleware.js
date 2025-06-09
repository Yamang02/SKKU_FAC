import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupCSRFProtection } from './csrfProtection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 극도로 최소화된 미들웨어 설정
 * Railway가 제공하는 기능들과 중복 제거
 */
export function setupBasicMiddleware(app) {
    // 1. Body Parser (필수)
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 2. 정적 파일 서빙 (필수)
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
