/**
 * ErrorHandler 고급 커스터마이징 설정
 * 프로젝트의 요구사항에 맞게 에러 처리를 세밀하게 제어할 수 있습니다.
 */

import logger from '../common/utils/Logger.js';
import Config from './Config.js';

// Config 인스턴스 가져오기
const config = Config.getInstance();
const environment = config.getEnvironment();
const appConfig = config.getAppConfig();

/**
 * 환경별 설정
 * 각 환경에 맞는 에러 처리 전략을 정의합니다.
 */
export const environmentConfig = {
    development: {
        includeStackTrace: true,
        enableDetailedLogging: true,
        logLevel: 'debug',
        showInternalErrors: true
    },
    testing: {
        includeStackTrace: false,
        enableDetailedLogging: false,
        logLevel: 'error',
        showInternalErrors: false
    },
    staging: {
        includeStackTrace: false,
        enableDetailedLogging: true,
        logLevel: 'warn',
        showInternalErrors: false
    },
    production: {
        includeStackTrace: false,
        enableDetailedLogging: false,
        logLevel: 'error',
        showInternalErrors: false
    }
};

/**
 * 로깅 설정
 * 로그 형식, 민감한 정보 처리, 크기 제한 등을 설정합니다.
 */
export const loggingConfig = {
    enableMetrics: true,
    enableRequestId: true,
    excludeFields: [
        'password',
        'token',
        'authorization',
        'cookie',
        'x-auth-token',
        'x-api-key',
        'access_token',
        'refresh_token'
    ],
    maxBodySize: 2048, // bytes
    customFields: {
        service: 'skku-gallery',
        version: appConfig.version
    }
};

/**
 * 응답 형식 커스터마이징
 * API 응답과 HTML 응답의 형식을 정의합니다.
 */
export const responseConfig = {
    // 커스텀 API 응답 템플릿
    apiResponseTemplate: (errorInfo, showInternalErrors) => ({
        success: false,
        error: {
            message: errorInfo.message,
            code: errorInfo.code,
            statusCode: errorInfo.statusCode,
            timestamp: new Date().toISOString(),
            requestId: errorInfo.requestId,
            // 프로덕션에서는 내부 에러 정보 숨김
            ...(showInternalErrors && {
                name: errorInfo.name,
                details: errorInfo.details,
                stack: errorInfo.stack,
                category: errorInfo.category,
                severity: errorInfo.severity
            })
        },
        meta: {
            service: 'skku-gallery',
            version: appConfig.version
        }
    }),

    htmlErrorTemplate: 'common/error',
    enableCors: true,
    customHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    }
};

/**
 * 에러 필터링 규칙
 * 특정 에러들을 무시하거나 다르게 처리할 수 있습니다.
 */
export const filterRules = {
    // 무시할 상태 코드
    ignoreStatusCodes: [
        // 404는 일반적으로 로깅하지 않음 (봇의 무작위 요청 등)
        // 404
    ],

    // 무시할 URL 패턴 (정규식)
    ignorePatterns: [
        '/favicon\\.ico',
        '/robots\\.txt',
        '/sitemap\\.xml',
        '\\.map$', // source map 파일
        '/health', // 헬스체크 엔드포인트
        '/metrics' // 메트릭 엔드포인트
    ],

    // 무시할 User-Agent (봇, 크롤러 등)
    ignoreUserAgents: [
        'Googlebot',
        'bingbot',
        'Slurp', // Yahoo
        'DuckDuckBot',
        'Baiduspider',
        'YandexBot',
        'facebookexternalhit',
        'Twitterbot',
        'LinkedInBot',
        'WhatsApp',
        'Telegram'
    ]
};

/**
 * 에러 변환 규칙
 * 내부 에러를 사용자 친화적인 메시지로 변환합니다.
 */
export const transformRules = {
    // 메시지 변환 (정규식 패턴 -> 대체값)
    messageTransforms: {
        // 데이터베이스 관련 에러
        SequelizeConnectionError: '데이터베이스 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        SequelizeValidationError: '입력하신 정보에 오류가 있습니다. 다시 확인해주세요.',
        SequelizeUniqueConstraintError: '이미 존재하는 정보입니다.',

        // Cloudinary 관련 에러
        CloudinaryError: '이미지 처리 중 문제가 발생했습니다.',

        // 일반적인 에러 패턴
        ECONNREFUSED: '외부 서비스 연결에 실패했습니다.',
        ENOTFOUND: '요청하신 리소스를 찾을 수 없습니다.',
        TIMEOUT: '요청 처리 시간이 초과되었습니다.',

        // 함수형 변환 예시
        'Invalid.*token': _message => '인증이 만료되었습니다. 다시 로그인해주세요.'
    },

    // 에러 코드 변환
    codeTransforms: {
        INTERNAL_ERROR: 'SERVICE_TEMPORARILY_UNAVAILABLE',
        DB_CONNECTION_ERROR: 'SERVICE_TEMPORARILY_UNAVAILABLE'
    }
};

/**
 * 커스텀 에러 핸들러
 * 특정 에러 타입에 대한 맞춤형 처리 로직을 정의합니다.
 */
export const customHandlers = {
    // 에러 타입별 핸들러
    byType: {
        // 인증 에러 특별 처리
        UnauthorizedError: (err, req, res, _next) => {
            logger.warn('인증 실패 시도', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
                method: req.method
            });

            // API 요청인경우 JSON 응답
            if (req.originalUrl.startsWith('/api')) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: '인증이 필요합니다.',
                        code: 'AUTHENTICATION_REQUIRED',
                        statusCode: 401
                    }
                });
            }

            // 웹 요청인 경우 로그인 페이지로 리다이렉트
            req.session.returnUrl = req.originalUrl;
            return res.redirect('/auth/login');
        },

        // 이미지 업로드 에러
        ImageUploadError: (err, req, res, _next) => {
            logger.error('이미지 업로드 실패', {
                error: err.message,
                fileSize: req.file?.size,
                mimeType: req.file?.mimetype,
                userId: req.session?.user?.id
            });

            return res.status(400).json({
                success: false,
                error: {
                    message: '이미지 업로드에 실패했습니다. 파일 형식과 크기를 확인해주세요.',
                    code: 'IMAGE_UPLOAD_FAILED',
                    statusCode: 400
                }
            });
        }
    },

    // 상태 코드별 핸들러
    byStatusCode: {
        // 429 Rate Limit 에러
        429: (err, req, res, _next) => {
            const retryAfter = 60; // 60초 후 재시도

            res.set('Retry-After', retryAfter);

            if (req.originalUrl.startsWith('/api')) {
                return res.status(429).json({
                    success: false,
                    error: {
                        message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
                        code: 'RATE_LIMIT_EXCEEDED',
                        statusCode: 429,
                        retryAfter: retryAfter
                    }
                });
            }

            return res.status(429).render('common/error', {
                title: '요청 제한',
                message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
                error: { code: 429 }
            });
        }
    },

    // 에러 코드별 핸들러
    byCode: {
        FILE_TOO_LARGE: (err, req, res, _next) => {
            return res.status(413).json({
                success: false,
                error: {
                    message: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.',
                    code: 'FILE_TOO_LARGE',
                    statusCode: 413,
                    maxSize: '10MB'
                }
            });
        }
    }
};

/**
 * 전체 ErrorHandler 설정
 * 위의 모든 설정을 통합한 최종 설정입니다.
 */
export const errorHandlerConfig = {
    isDevelopment: environment === 'development',
    environmentConfig,
    loggingConfig,
    responseConfig,
    filterRules,
    transformRules,
    customHandlers
};

export default errorHandlerConfig;
