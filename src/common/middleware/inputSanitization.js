import pkg from 'jsdom';
const { JSDOM } = pkg;
import createDOMPurify from 'dompurify';
import validatorPkg from 'express-validator';
const { escape } = validatorPkg;
import logger from '../utils/Logger.js';
import Config from '../../config/Config.js';

// JSDOM 환경에서 DOMPurify 초기화
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * HTML Sanitization 설정
 */
const HTML_SANITIZE_CONFIG = {
    // 허용할 태그들 (기본적으로 안전한 태그만)
    ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'i',
        'b',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code'
    ],

    // 허용할 속성들
    ALLOWED_ATTR: ['class'],

    // 위험한 요소들 제거
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'style']
};

/**
 * 문자열 HTML sanitization
 * @param {string} input - sanitize할 문자열
 * @param {boolean} allowHtml - HTML 태그 허용 여부
 * @returns {string} sanitized 문자열
 */
export function sanitizeHtml(input, allowHtml = false) {
    if (typeof input !== 'string') {
        return input;
    }

    if (!allowHtml) {
        // HTML 태그를 완전히 제거하고 HTML 엔티티로 변환
        return DOMPurify.sanitize(input, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true
        });
    }

    // 안전한 HTML 태그만 허용
    return DOMPurify.sanitize(input, HTML_SANITIZE_CONFIG);
}

/**
 * XSS 방어를 위한 문자열 escape
 * @param {string} input - escape할 문자열
 * @returns {string} escaped 문자열
 */
export function escapeXss(input) {
    if (typeof input !== 'string') {
        return input;
    }

    return escape(input);
}

/**
 * SQL Injection 방어를 위한 기본 sanitization
 * @param {string} input - sanitize할 문자열
 * @returns {string} sanitized 문자열
 */
export function sanitizeSql(input) {
    if (typeof input !== 'string') {
        return input;
    }

    // 기본적인 SQL injection 패턴 제거
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(--|\/\*|\*\/|;|'|"|`)/g,
        /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
        /(\bOR\b|\bAND\b)\s+['"].*['"].*=/gi
    ];

    let sanitized = input;
    sqlPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
}

/**
 * NoSQL Injection 방어
 * @param {any} input - sanitize할 입력
 * @returns {any} sanitized 입력
 */
export function sanitizeNoSql(input) {
    if (typeof input === 'string') {
        // MongoDB operator 패턴 제거
        const noSqlPatterns = [/\$where/gi, /\$regex/gi, /\$ne/gi, /\$gt/gi, /\$lt/gi, /\$in/gi, /\$nin/gi];

        let sanitized = input;
        noSqlPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });

        return sanitized;
    }

    if (typeof input === 'object' && input !== null) {
        // 객체의 키에서 MongoDB operator 제거
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            const cleanKey = key.replace(/^\$/, '');
            sanitized[cleanKey] = sanitizeNoSql(value);
        }
        return sanitized;
    }

    return input;
}

/**
 * 재귀적으로 객체의 모든 문자열 값을 sanitize
 * @param {any} obj - sanitize할 객체
 * @param {Object} options - sanitization 옵션
 * @returns {any} sanitized 객체
 */
function sanitizeObject(obj, options = {}) {
    const { html = true, xss = true, sql = true, nosql = true, allowHtml = false } = options;

    if (typeof obj === 'string') {
        let sanitized = obj;

        if (html) {
            sanitized = sanitizeHtml(sanitized, allowHtml);
        }
        if (xss && !allowHtml) {
            sanitized = escapeXss(sanitized);
        }
        if (sql) {
            sanitized = sanitizeSql(sanitized);
        }
        if (nosql) {
            sanitized = sanitizeNoSql(sanitized);
        }

        return sanitized;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, options));
    }

    if (typeof obj === 'object' && obj !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // 키도 sanitize
            const cleanKey = sanitizeObject(key, { ...options, allowHtml: false });
            sanitized[cleanKey] = sanitizeObject(value, options);
        }
        return sanitized;
    }

    return obj;
}

/**
 * 입력 sanitization 미들웨어 생성
 * @param {Object} options - sanitization 옵션
 * @returns {Function} Express 미들웨어
 */
export function createSanitizationMiddleware(options = {}) {
    const config = Config.getInstance();

    const defaultOptions = {
        html: true,
        xss: true,
        sql: true,
        nosql: true,
        allowHtml: false,
        sources: ['body', 'query', 'params'],
        skipPaths: config.get('security.sanitization.skipPaths', ['/api-docs', '/health', '/favicon.ico'])
    };

    const sanitizeOptions = { ...defaultOptions, ...options };

    return (req, res, next) => {
        try {
            // 제외할 경로 확인
            if (sanitizeOptions.skipPaths.some(path => req.path.startsWith(path))) {
                return next();
            }

            // 각 소스에 대해 sanitization 수행
            sanitizeOptions.sources.forEach(source => {
                if (req[source] && typeof req[source] === 'object') {
                    req[source] = sanitizeObject(req[source], sanitizeOptions);
                }
            });

            // sanitization 로깅 (디버그 레벨)
            logger.debug('입력 sanitization 완료', {
                method: req.method,
                url: req.url,
                sources: sanitizeOptions.sources,
                ip: req.ip
            });

            next();
        } catch (error) {
            logger.error('입력 sanitization 실패', {
                error: error.message || error.toString() || 'Unknown error',
                errorName: error.name,
                errorStack: error.stack,
                method: req.method,
                url: req.url,
                ip: req.ip
            });

            // sanitization 실패 시에도 요청을 계속 처리
            // 보안상 중요하지만 서비스 중단을 피하기 위함
            next();
        }
    };
}

/**
 * 특정 필드만 sanitize하는 미들웨어
 * @param {Array} fields - sanitize할 필드 목록
 * @param {Object} options - sanitization 옵션
 * @returns {Function} Express 미들웨어
 */
export function sanitizeFields(fields, options = {}) {
    return (req, res, next) => {
        try {
            fields.forEach(field => {
                const keys = field.split('.');
                let current = req.body;

                // 중첩된 객체 탐색
                for (let i = 0; i < keys.length - 1; i++) {
                    if (current && typeof current === 'object' && keys[i] in current) {
                        current = current[keys[i]];
                    } else {
                        return; // 필드가 존재하지 않음
                    }
                }

                // 마지막 키에 대해 sanitization 수행
                const lastKey = keys[keys.length - 1];
                if (current && typeof current === 'object' && lastKey in current) {
                    current[lastKey] = sanitizeObject(current[lastKey], options);
                }
            });

            next();
        } catch (error) {
            logger.error('필드별 sanitization 실패', {
                error: error.message || error.toString() || 'Unknown error',
                errorName: error.name,
                errorStack: error.stack,
                fields,
                method: req.method,
                url: req.url
            });
            next();
        }
    };
}

/**
 * 사용자 생성 콘텐츠용 HTML sanitization 미들웨어
 */
export const sanitizeUserContent = createSanitizationMiddleware({
    html: true,
    xss: true,
    sql: true,
    nosql: true,
    allowHtml: true, // 안전한 HTML 태그 허용
    sources: ['body']
});

/**
 * 일반 폼 입력용 strict sanitization 미들웨어
 */
export const sanitizeFormInput = createSanitizationMiddleware({
    html: true,
    xss: true,
    sql: true,
    nosql: true,
    allowHtml: false, // HTML 태그 완전 제거
    sources: ['body', 'query']
});

/**
 * API 입력용 sanitization 미들웨어
 */
export const sanitizeApiInput = createSanitizationMiddleware({
    html: true,
    xss: true,
    sql: true,
    nosql: true,
    allowHtml: false,
    sources: ['body', 'query', 'params']
});

/**
 * 검색 쿼리용 sanitization 미들웨어
 */
export const sanitizeSearchInput = createSanitizationMiddleware({
    html: true,
    xss: true,
    sql: true,
    nosql: true,
    allowHtml: false,
    sources: ['query']
});
