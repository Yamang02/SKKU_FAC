import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import methodOverride from 'method-override';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import { staticFileConfig } from '../../config/securityConfig.js';
import { createUploadDirs } from '../utils/createUploadDirs.js';
import logger from '../utils/Logger.js';
import Config from '../../config/Config.js';
import { setupCSRFProtection } from './csrfProtection.js';
import { sanitizeFormInput } from './inputSanitization.js';
import { setupHttpsEnforcement } from './httpsEnforcement.js';
import { setupAdvancedSecurityHeaders } from './securityHeaders.js';
import { securityMonitoring } from './securityMonitoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 미들웨어 성능 통계
const middlewareStats = {
    requests: 0,
    totalTime: 0,
    averageTime: 0,
    slowRequests: 0,
    errors: 0
};

/**
 * 기본 미들웨어 설정
 */
export function setupBasicMiddleware(app, swaggerDocument) {
    const config = Config.getInstance();

    // 업로드 디렉토리 생성
    createUploadDirs();

    // 성능 모니터링 미들웨어 (가장 먼저)
    if (config.get('monitoring.enableMetrics', false)) {
        setupPerformanceMonitoring(app, config);
    }

    // 1. HTTPS Enforcement (가장 먼저 - 보안 필수)
    setupHttpsEnforcement(app);

    // 2. Rate Limiter (조기 차단으로 리소스 절약)
    setupRateLimitingMiddleware(app, config);

    // 3. Compression 미들웨어 (응답 크기 감소)
    setupCompressionMiddleware(app, config);

    // 4. 보안 미들웨어 (보안 헤더 설정)
    setupSecurityMiddleware(app, config);

    // 4-1. 고급 보안 헤더 추가 설정
    setupAdvancedSecurityHeaders(app);

    // 4-2. 보안 모니터링 추가
    app.use(securityMonitoring());

    // 5. 정적 파일 제공 (빠른 응답을 위해 우선 처리)
    setupStaticFiles(app);

    // 6. Body Parser (요청 파싱)
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 7. HTTP 메서드 재정의
    app.use(methodOverride('_method'));

    // 8. Swagger UI (개발/문서화 도구) - 개발 환경에서만
    if (config.isDevelopment() || config.isTest()) {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    // 프로덕션 및 테스트 환경에서 프록시 신뢰 설정
    if (config.isProduction() || config.isTest()) {
        app.set('trust proxy', 1);
    }

    logger.success('기본 미들웨어 설정 완료 (HTTPS Enforcement 포함)');
}

/**
 * 성능 모니터링 미들웨어 설정
 */
function setupPerformanceMonitoring(app, config) {
    app.use((req, res, next) => {
        const startTime = Date.now();
        const startMemory = process.memoryUsage();

        // 요청 시작 로깅
        if (config.get('monitoring.enableDetailedLogging', false)) {
            logger.debug(`Request started: ${req.method} ${req.url}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                memory: startMemory
            });
        }

        // 응답 완료 시 통계 수집
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const endMemory = process.memoryUsage();

            // 통계 업데이트
            middlewareStats.requests++;
            middlewareStats.totalTime += duration;
            middlewareStats.averageTime = middlewareStats.totalTime / middlewareStats.requests;

            // 느린 요청 감지 (500ms 이상)
            if (duration > 500) {
                middlewareStats.slowRequests++;
                logger.warn(`Slow request detected: ${req.method} ${req.url} took ${duration}ms`);
            }

            // 메모리 사용량 모니터링
            const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;

            if (config.get('monitoring.enableDetailedLogging', false)) {
                logger.debug(`Request completed: ${req.method} ${req.url}`, {
                    duration: `${duration}ms`,
                    statusCode: res.statusCode,
                    memoryDiff: `${Math.round(memoryDiff / 1024)}KB`,
                    totalRequests: middlewareStats.requests,
                    averageTime: `${Math.round(middlewareStats.averageTime)}ms`
                });
            }
        });

        // 에러 처리
        res.on('error', error => {
            middlewareStats.errors++;
            logger.error('Response error:', error);
        });

        next();
    });

    // 통계 리포트 주기적 출력 (프로덕션 환경에서는 비활성화)
    if (!config.isProduction()) {
        setInterval(() => {
            if (middlewareStats.requests > 0) {
                logger.info('Middleware Performance Stats:', {
                    totalRequests: middlewareStats.requests,
                    averageResponseTime: `${Math.round(middlewareStats.averageTime)}ms`,
                    slowRequests: middlewareStats.slowRequests,
                    errorRate: `${((middlewareStats.errors / middlewareStats.requests) * 100).toFixed(2)}%`,
                    memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
                });
            }
        }, 60000); // 1분마다
    }

    logger.info('성능 모니터링 미들웨어 활성화');
}

/**
 * 미들웨어 성능 통계 조회
 */
export function getMiddlewareStats() {
    return {
        ...middlewareStats,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
    };
}

/**
 * 미들웨어 성능 통계 초기화
 */
export function resetMiddlewareStats() {
    middlewareStats.requests = 0;
    middlewareStats.totalTime = 0;
    middlewareStats.averageTime = 0;
    middlewareStats.slowRequests = 0;
    middlewareStats.errors = 0;
    logger.info('미들웨어 성능 통계 초기화됨');
}

/**
 * Compression 미들웨어 설정
 */
function setupCompressionMiddleware(app, config) {
    const compressionConfig = {
        // 압축 레벨 (1-9, 6이 기본값)
        level: config.isProduction() ? 6 : 1,

        // 압축 임계값 (바이트 단위, 기본 1024)
        threshold: 1024,

        // 압축할 MIME 타입 필터
        filter: (req, res) => {
            // 이미 압축된 파일은 제외
            if (req.headers['x-no-compression']) {
                return false;
            }

            // 기본 compression 필터 사용
            return compression.filter(req, res);
        },

        // 메모리 레벨 (1-9, 8이 기본값)
        memLevel: config.isProduction() ? 8 : 6,

        // 압축 창 크기 (9-15, 15가 기본값)
        windowBits: config.isProduction() ? 15 : 13,

        // 압축 전략
        strategy: config.isProduction() ? 0 : 1 // 0: Z_DEFAULT_STRATEGY, 1: Z_FILTERED
    };

    // 환경별 압축 설정 적용
    if (config.get('performance.enableCompression', true)) {
        app.use(compression(compressionConfig));
        logger.info(`Compression 미들웨어 활성화 (레벨: ${compressionConfig.level})`);
    } else {
        logger.info('Compression 미들웨어 비활성화');
    }
}

/**
 * 보안 헤더 미들웨어 설정
 */
function setupSecurityMiddleware(app, config) {
    const cspConfig = config.get('security.csp');
    const additionalHeaders = config.get('security.additionalHeaders', {});

    // 환경별 Helmet 설정
    const helmetConfig = {
        // Content Security Policy
        contentSecurityPolicy: cspConfig.contentSecurityPolicy
            ? {
                directives: cspConfig.contentSecurityPolicy.directives,
                reportOnly: config.isDevelopment() // 개발 환경에서는 report-only 모드
            }
            : false,

        // Cross-Origin Embedder Policy
        crossOriginEmbedderPolicy: cspConfig.crossOriginEmbedderPolicy || false,

        // DNS Prefetch Control
        dnsPrefetchControl: {
            allow: false
        },

        // Expect-CT (Certificate Transparency)
        expectCt: config.isProduction()
            ? {
                maxAge: 86400, // 24시간
                enforce: true
            }
            : false,

        // Feature Policy / Permissions Policy
        permissionsPolicy: {
            features: {
                camera: ['self'],
                microphone: ['none'],
                geolocation: ['none'],
                payment: ['none'],
                usb: ['none'],
                bluetooth: ['none'],
                accelerometer: ['none'],
                gyroscope: ['none'],
                magnetometer: ['none'],
                fullscreen: ['self'],
                'picture-in-picture': ['none']
            }
        },

        // Frame Options
        frameguard: {
            action: 'deny'
        },

        // Hide Powered-By
        hidePoweredBy: true,

        // HSTS (HTTP Strict Transport Security)
        hsts: false,

        // IE No Open
        ieNoOpen: true,

        // No Sniff
        noSniff: true,

        // Origin Agent Cluster
        originAgentCluster: true,

        // Referrer Policy
        referrerPolicy: {
            policy: config.isProduction()
                ? ['no-referrer-when-downgrade', 'strict-origin-when-cross-origin']
                : ['no-referrer', 'strict-origin-when-cross-origin']
        },

        // X-XSS-Protection
        xssFilter: true
    };

    // Cross-Origin 정책은 별도로 설정 (helmet이 지원하지 않는 경우 대비)
    if (config.isProduction()) {
        helmetConfig.crossOriginOpenerPolicy = { policy: 'same-origin' };
        helmetConfig.crossOriginResourcePolicy = { policy: 'same-origin' };
    }

    app.use(helmet(helmetConfig));

    // 추가 보안 헤더 설정
    app.use((req, res, next) => {
        // 서버 정보 숨기기
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');

        // 기본 보안 헤더
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // 환경별 추가 헤더 적용
        Object.entries(additionalHeaders).forEach(([header, value]) => {
            res.setHeader(header, value);
        });

        // 프로덕션 환경에서만 적용되는 헤더
        if (config.isProduction()) {
            // HSTS 헤더는 HTTPS Enforcement에서 관리
            res.setHeader('X-Download-Options', 'noopen');
            res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

            // COEP 헤더 (특정 경로에서만)
            if (req.path.startsWith('/secure/') || req.path.startsWith('/admin/')) {
                res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            }
        }

        // 개발 환경에서의 CORS 설정
        if (config.isDevelopment()) {
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        next();
    });

    logger.info('보안 헤더 미들웨어 설정 완료');
}

/**
 * Rate Limiting 미들웨어 설정
 */
async function setupRateLimitingMiddleware(app, _config) {
    // 새로운 고급 Rate Limiting 시스템 사용
    const { setupAdvancedRateLimiting } = await import('./rateLimiting.js');
    setupAdvancedRateLimiting(app);
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

/**
 * 세션 및 인증 관련 미들웨어 설정 (세션 설정 후 호출)
 */
export function setupSessionMiddleware(app) {
    // CSRF 보호 미들웨어 (세션 설정 후에 설정해야 함)
    setupCSRFProtection(app);

    // 입력 sanitization 미들웨어 (CSRF 보호 후)
    app.use(sanitizeFormInput);

    logger.info('세션 관련 미들웨어 설정 완료');
}
