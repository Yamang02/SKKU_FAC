import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { body, query } from 'express-validator';
import logger from '../utils/Logger.js';

// 서버사이드 DOM 환경 설정
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * HTML Sanitization 설정
 */
const HTML_SANITIZE_CONFIG = {
    // 기본 설정: 모든 HTML 태그 제거, 텍스트만 유지
    strict: {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
    },
    // 제한적 HTML 허용 (제목, 설명 등에 사용)
    limited: {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
    },
    // 안전한 HTML 허용 (댓글, 게시글 등에 사용)
    safe: {
        ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'u', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
    }
};

/**
 * 민감한 필드 패턴 정의
 */
const SENSITIVE_FIELD_PATTERNS = {
    // 사용자 입력 콘텐츠 (엄격한 sanitization)
    userContent: /^(title|name|description|content|comment|message|bio|affiliation|department)$/i,
    // 검색 및 필터 (제한적 sanitization)
    searchFilter: /^(search|filter|query|keyword|q)$/i,
    // 안전한 필드 (기본 sanitization만)
    safe: /^(username|email|phone|url|address)$/i
};

/**
 * HTML 콘텐츠 sanitization
 * @param {string} input - 입력 문자열
 * @param {string} level - sanitization 레벨 ('strict', 'limited', 'safe')
 * @returns {string} sanitized 문자열
 */
function sanitizeHTML(input, level = 'strict') {
    if (typeof input !== 'string') return input;

    const config = HTML_SANITIZE_CONFIG[level] || HTML_SANITIZE_CONFIG.strict;
    return purify.sanitize(input, config);
}

/**
 * SQL 인젝션 방지를 위한 추가 검증
 * @param {string} input - 입력 문자열
 * @returns {string} 검증된 문자열
 */
function preventSQLInjection(input) {
    if (typeof input !== 'string') return input;

    // 위험한 SQL 키워드 패턴
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(--|\/\*|\*\/)/g,
        /(\bOR\b.*=.*=|\bAND\b.*=.*=)/gi,
        /('|(\\x27)|(\\x2D\\x2D))/g
    ];

    let sanitized = input;

    sqlPatterns.forEach(pattern => {
        if (pattern.test(sanitized)) {
            logger.warn('Potential SQL injection attempt detected', {
                input: input.substring(0, 100),
                pattern: pattern.toString()
            });
            // 위험한 패턴을 안전한 문자로 대체
            sanitized = sanitized.replace(pattern, '');
        }
    });

    return sanitized;
}

/**
 * 필드명에 따른 sanitization 레벨 결정
 * @param {string} fieldName - 필드명
 * @returns {string} sanitization 레벨
 */
function getSanitizationLevel(fieldName) {
    if (SENSITIVE_FIELD_PATTERNS.userContent.test(fieldName)) {
        return 'limited';
    }
    if (SENSITIVE_FIELD_PATTERNS.searchFilter.test(fieldName)) {
        return 'strict';
    }
    return 'strict';
}

/**
 * 객체의 모든 문자열 값을 재귀적으로 sanitize
 * @param {any} obj - sanitize할 객체
 * @param {Object} options - sanitization 옵션
 * @returns {any} sanitized 객체
 */
function sanitizeObject(obj, options = {}) {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        const level = options.level || 'strict';
        let sanitized = sanitizeHTML(obj, level);
        sanitized = preventSQLInjection(sanitized);
        return sanitized;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, options));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            const level = getSanitizationLevel(key);
            sanitized[key] = sanitizeObject(value, { ...options, level });
        }
        return sanitized;
    }

    return obj;
}

/**
 * 요청 데이터 sanitization 미들웨어 생성기
 * @param {Object} options - sanitization 옵션
 * @param {string[]} options.sources - sanitize할 소스 ('body', 'query', 'params')
 * @param {string} options.level - 기본 sanitization 레벨
 * @returns {Function} Express 미들웨어 함수
 */
export function createSanitizationMiddleware(options = {}) {
    const { sources = ['body', 'query'], level = 'strict' } = options;

    return (req, res, next) => {
        try {
            const startTime = Date.now();
            let sanitizedCount = 0;

            sources.forEach(source => {
                if (req[source] && typeof req[source] === 'object') {
                    const original = JSON.stringify(req[source]);
                    req[source] = sanitizeObject(req[source], { level });
                    const sanitized = JSON.stringify(req[source]);

                    if (original !== sanitized) {
                        sanitizedCount++;
                        logger.debug('Input sanitization applied', {
                            source,
                            endpoint: req.originalUrl,
                            method: req.method,
                            fieldsCount: Object.keys(req[source]).length
                        });
                    }
                }
            });

            const processingTime = Date.now() - startTime;

            if (sanitizedCount > 0) {
                logger.info('Input sanitization completed', {
                    endpoint: req.originalUrl,
                    method: req.method,
                    sanitizedSources: sanitizedCount,
                    processingTime: `${processingTime}ms`,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
            }

            next();
        } catch (error) {
            logger.error('Input sanitization failed', {
                endpoint: req.originalUrl,
                method: req.method,
                error: error.message,
                stack: error.stack
            });

            // sanitization 실패 시에도 요청 진행 (보안보다 가용성 우선)
            next();
        }
    };
}

/**
 * 기본 sanitization 미들웨어 (body, query 대상)
 */
export const sanitizeInput = createSanitizationMiddleware({
    sources: ['body', 'query'],
    level: 'strict'
});

/**
 * 사용자 콘텐츠용 sanitization 미들웨어 (제한적 HTML 허용)
 */
export const sanitizeUserContent = createSanitizationMiddleware({
    sources: ['body'],
    level: 'limited'
});

/**
 * 검색/필터용 sanitization 미들웨어 (엄격한 정책)
 */
export const sanitizeSearchInput = createSanitizationMiddleware({
    sources: ['query', 'params'],
    level: 'strict'
});

/**
 * 도메인별 sanitization 미들웨어들
 */
export const DomainSanitization = {
    // 사용자 도메인
    user: {
        register: createSanitizationMiddleware({
            sources: ['body'],
            level: 'strict'
        }),
        updateProfile: createSanitizationMiddleware({
            sources: ['body'],
            level: 'limited'
        })
    },

    // 작품 도메인
    artwork: {
        create: createSanitizationMiddleware({
            sources: ['body'],
            level: 'limited'
        }),
        update: createSanitizationMiddleware({
            sources: ['body'],
            level: 'limited'
        }),
        search: createSanitizationMiddleware({
            sources: ['query'],
            level: 'strict'
        })
    },

    // 전시회 도메인
    exhibition: {
        create: createSanitizationMiddleware({
            sources: ['body'],
            level: 'limited'
        }),
        update: createSanitizationMiddleware({
            sources: ['body'],
            level: 'limited'
        }),
        search: createSanitizationMiddleware({
            sources: ['query'],
            level: 'strict'
        })
    },

    // 관리자 도메인
    admin: {
        userManagement: createSanitizationMiddleware({
            sources: ['body', 'query'],
            level: 'strict'
        }),
        systemSettings: createSanitizationMiddleware({
            sources: ['body'],
            level: 'limited'
        })
    }
};

/**
 * Express-validator와 통합된 sanitization 체인
 */
export const ValidationChains = {
    // 사용자명 검증 및 sanitization
    username: body('username')
        .trim()
        .escape()
        .isLength({ min: 3, max: 30 })
        .withMessage('사용자명은 3-30자 사이여야 합니다'),

    // 이메일 검증 및 sanitization
    email: body('email').trim().normalizeEmail().isEmail().withMessage('올바른 이메일 형식을 입력해주세요'),

    // 제목 검증 및 sanitization
    title: body('title')
        .trim()
        .customSanitizer(value => sanitizeHTML(value, 'limited'))
        .isLength({ min: 1, max: 100 })
        .withMessage('제목은 1-100자 사이여야 합니다'),

    // 설명 검증 및 sanitization
    description: body('description')
        .trim()
        .customSanitizer(value => sanitizeHTML(value, 'safe'))
        .isLength({ max: 1000 })
        .withMessage('설명은 1000자 이하여야 합니다'),

    // 검색어 검증 및 sanitization
    searchQuery: query('q')
        .optional()
        .trim()
        .customSanitizer(value => sanitizeHTML(value, 'strict'))
        .isLength({ max: 100 })
        .withMessage('검색어는 100자 이하여야 합니다')
};

/**
 * Sanitization 통계 및 모니터링
 */
export class SanitizationMonitor {
    static stats = {
        totalRequests: 0,
        sanitizedRequests: 0,
        potentialAttacks: 0,
        startTime: Date.now()
    };

    static recordSanitization(details) {
        this.stats.totalRequests++;
        if (details.sanitized) {
            this.stats.sanitizedRequests++;
        }
        if (details.potentialAttack) {
            this.stats.potentialAttacks++;
        }
    }

    static getStats() {
        const uptime = Date.now() - this.stats.startTime;
        return {
            ...this.stats,
            uptime: Math.floor(uptime / 1000),
            sanitizationRate: ((this.stats.sanitizedRequests / this.stats.totalRequests) * 100).toFixed(2) + '%',
            attackRate: ((this.stats.potentialAttacks / this.stats.totalRequests) * 100).toFixed(2) + '%'
        };
    }

    static reset() {
        this.stats = {
            totalRequests: 0,
            sanitizedRequests: 0,
            potentialAttacks: 0,
            startTime: Date.now()
        };
    }
}

export default {
    createSanitizationMiddleware,
    sanitizeInput,
    sanitizeUserContent,
    sanitizeSearchInput,
    DomainSanitization,
    ValidationChains,
    SanitizationMonitor,
    sanitizeHTML,
    preventSQLInjection,
    sanitizeObject
};
