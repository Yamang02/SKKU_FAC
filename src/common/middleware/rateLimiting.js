import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import logger from '../utils/Logger.js';
import Config from '../../config/Config.js';

// 모듈 로드 시점 디버깅
console.log('🔄 [RATE_LIMIT] rateLimiting.js 모듈이 로드되었습니다');
logger.info('🔄 [RATE_LIMIT] rateLimiting.js 모듈이 로드되었습니다');

const config = Config.getInstance();

/**
 * Redis 클라이언트 설정 (사용 가능한 경우)
 */
let redisClient = null;
if (config.get('redis.host')) {
    try {
        logger.info('=== RateLimit Redis 클라이언트 설정 ===');
        logger.info(`호스트: ${config.get('redis.host')}`);
        logger.info(`포트: ${config.get('redis.port')}`);
        logger.info(`패스워드: ${config.get('redis.password') ? '설정됨' : '설정되지 않음'}`);
        logger.info(`데이터베이스: ${config.get('redis.db', 0)}`);

        redisClient = createClient({
            host: config.get('redis.host'),
            port: config.get('redis.port'),
            password: config.get('redis.password'),
            db: config.get('redis.db', 0)
        });
        redisClient.on('error', err => {
            logger.error('[RATE_LIMIT] Redis 클라이언트 오류', {
                error: err.message || 'Unknown error',
                code: err.code,
                errno: err.errno,
                name: err.name,
                host: config.get('redis.host'),
                port: config.get('redis.port')
            });
            redisClient = null;
        });
        logger.info('RateLimit Redis 클라이언트 초기화 완료');
    } catch (error) {
        logger.error('RateLimit Redis 클라이언트 생성 실패, 메모리 스토어 사용', {
            error: error.message,
            stack: error.stack?.substring(0, 200) + '...'
        });
        redisClient = null;
    }
}

/**
 * Rate Limiting 통계 및 모니터링
 */
export class RateLimitMonitor {
    static stats = {
        totalRequests: 0,
        blockedRequests: 0,
        suspiciousIPs: new Set(),
        startTime: Date.now(),
        attackPatterns: {
            bruteForce: 0,
            ddos: 0,
            slowAttack: 0
        }
    };

    static recordRequest(ip, blocked = false, attackType = null) {
        this.stats.totalRequests++;
        if (blocked) {
            this.stats.blockedRequests++;
            this.stats.suspiciousIPs.add(ip);

            if (attackType) {
                this.stats.attackPatterns[attackType]++;
            }
        }
    }

    static getStats() {
        const uptime = Date.now() - this.stats.startTime;
        return {
            ...this.stats,
            suspiciousIPCount: this.stats.suspiciousIPs.size,
            uptime: Math.floor(uptime / 1000),
            blockRate: ((this.stats.blockedRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
        };
    }

    static reset() {
        this.stats = {
            totalRequests: 0,
            blockedRequests: 0,
            suspiciousIPs: new Set(),
            startTime: Date.now(),
            attackPatterns: {
                bruteForce: 0,
                ddos: 0,
                slowAttack: 0
            }
        };
    }
}

/**
 * 스토어 설정 (Redis > Memory 순서)
 */
function createStore(windowMs) {
    // 개발 환경에서는 메모리 스토어 사용 (안정성 우선)
    if (!config.isProduction()) {
        logger.info('개발 환경: 메모리 스토어 사용');
        return undefined; // express-rate-limit의 기본 메모리 스토어 사용
    }

    if (redisClient) {
        try {
            // Redis 연결 상태 확인
            if (!redisClient.isReady) {
                logger.warn('Redis 클라이언트가 준비되지 않음, 메모리 스토어로 폴백');
                return undefined;
            }

            return new RedisStore({
                client: redisClient,
                prefix: 'rl:',
                expiry: Math.ceil(windowMs / 1000)
            });
        } catch (error) {
            logger.warn('Redis 스토어 생성 실패, 메모리 스토어로 폴백', {
                error: error.message,
                stack: error.stack?.substring(0, 200) + '...'
            });
            return undefined;
        }
    }

    // 메모리 스토어 (기본값)
    logger.info('Redis 클라이언트 없음: 메모리 스토어 사용');
    return undefined; // express-rate-limit의 기본 메모리 스토어 사용
}

/**
 * 공통 Rate Limiter 옵션 생성기
 */
function createRateLimitOptions(options = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15분
        max = 100,
        message = 'Too many requests from this IP, please try again later.',
        skipPaths = [],
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
        attackType = null
    } = options;

    return {
        windowMs,
        max: config.isProduction() ? max : max * 3, // 개발환경에서는 3배 여유
        message: {
            error: message,
            retryAfter: Math.ceil(windowMs / 1000),
            type: 'rate_limit_exceeded'
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore(windowMs),
        skipSuccessfulRequests,
        skipFailedRequests,
        skip: req => {
            // 건강 체크 및 지정된 경로 제외
            const shouldSkip = skipPaths.some(path => req.path.startsWith(path));
            if (shouldSkip) return true;

            // 관리자 IP 허용 (설정된 경우)
            const adminIPs = config.get('security.adminIPs', []);
            if (adminIPs.includes(req.ip)) return true;

            return false;
        },
        keyGenerator: req => {
            // 프록시 환경에서 실제 IP 추출
            const ip =
                req.ip ||
                req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                (req.connection.socket ? req.connection.socket.remoteAddress : null);
            return ip;
        },
        handler: (req, res) => {
            const ip = req.ip;
            RateLimitMonitor.recordRequest(ip, true, attackType);

            logger.warn('Rate limit 초과', {
                ip,
                path: req.path,
                method: req.method,
                userAgent: req.get('User-Agent'),
                attackType
            });

            res.status(429).json({
                error: message,
                retryAfter: Math.ceil(windowMs / 1000),
                type: 'rate_limit_exceeded',
                timestamp: new Date().toISOString()
            });
        },
        onLimitReached: (req, res, options) => {
            logger.error('Rate limit 한계 도달', {
                ip: req.ip,
                path: req.path,
                limit: options.max,
                window: options.windowMs,
                attackType
            });
        }
    };
}

/**
 * 기본 Rate Limiter (모든 요청)
 */
export const generalRateLimit = rateLimit(
    createRateLimitOptions({
        windowMs: 15 * 60 * 1000, // 15분
        max: 300, // IP당 300 요청
        message: 'Too many requests from this IP, please try again later.',
        skipPaths: [
            '/health',
            '/favicon.ico',
            '/robots.txt',
            '/sitemap.xml',
            '/css', // CSS 파일들
            '/js', // JavaScript 파일들
            '/images', // 이미지 파일들
            '/assets', // 기타 정적 자산들
            '/uploads' // 업로드된 파일들
        ]
    })
);

/**
 * Static 자원 전용 Rate Limiter (매우 관대한 제한)
 */
export const staticAssetsRateLimit = rateLimit(
    createRateLimitOptions({
        windowMs: 5 * 60 * 1000, // 5분
        max: 1000, // 5분당 1000회 요청 (매우 관대)
        message: 'Too many requests for static assets, please try again later.',
        skipPaths: ['/health', '/favicon.ico']
    })
);

/**
 * API Rate Limiter (API 엔드포인트)
 */
export const apiRateLimit = rateLimit(
    createRateLimitOptions({
        windowMs: 15 * 60 * 1000, // 15분
        max: 100, // API는 더 엄격
        message: 'Too many API requests from this IP, please try again later.',
        attackType: 'ddos'
    })
);

/**
 * 인증 Rate Limiter (로그인, 회원가입 등)
 */
export const authRateLimit = rateLimit(
    createRateLimitOptions({
        windowMs: 15 * 60 * 1000, // 15분
        max: 10, // 매우 엄격
        message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
        skipSuccessfulRequests: true, // 성공한 로그인은 카운트 제외
        attackType: 'bruteForce'
    })
);

/**
 * 비밀번호 재설정 Rate Limiter
 */
export const passwordResetRateLimit = rateLimit(
    createRateLimitOptions({
        windowMs: 60 * 60 * 1000, // 1시간
        max: 3, // 시간당 3회만
        message: 'Too many password reset attempts from this IP, please try again in 1 hour.',
        attackType: 'bruteForce'
    })
);

/**
 * 업로드 Rate Limiter
 */
export const uploadRateLimit = rateLimit(
    createRateLimitOptions({
        windowMs: 60 * 60 * 1000, // 1시간
        max: 20, // 시간당 20개 파일
        message: 'Too many upload attempts from this IP, please try again later.'
    })
);

/**
 * 검색 Rate Limiter
 */
export const searchRateLimit = rateLimit(
    createRateLimitOptions({
        windowMs: 5 * 60 * 1000, // 5분
        max: 50, // 5분당 50회 검색
        message: 'Too many search requests from this IP, please try again later.'
    })
);

/**
 * 슬로우 다운 미들웨어 (점진적 지연)
 */
export const slowDownMiddleware = slowDown({
    windowMs: 15 * 60 * 1000, // 15분
    delayAfter: 50, // 50번째 요청부터 지연 시작
    delayMs: 100, // 100ms씩 점진적 증가
    maxDelayMs: 5000, // 최대 5초 지연
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    // store: createStore(15 * 60 * 1000), // Redis 호환성 문제로 메모리 스토어 사용
    keyGenerator: req => req.ip,
    onLimitReached: (req, res, options) => {
        const ip = req.ip;
        RateLimitMonitor.recordRequest(ip, true, 'slowAttack');

        logger.warn('슬로우 다운 활성화', {
            ip,
            path: req.path,
            delay: options.delay
        });
    }
});

/**
 * 고급 DDoS 보호 미들웨어
 */
export function createAdvancedDDoSProtection() {
    const requestCounts = new Map();
    const suspiciousIPs = new Set();

    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - 60 * 1000; // 1분 윈도우

        // IP별 요청 기록 정리 (1분 이전 기록 삭제)
        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, []);
        }

        const ipRequests = requestCounts.get(ip);
        // 1분 이전 요청들 제거
        const recentRequests = ipRequests.filter(timestamp => timestamp > windowStart);
        requestCounts.set(ip, recentRequests);

        // 현재 요청 추가
        recentRequests.push(now);

        // DDoS 패턴 감지 (1분에 100회 이상 요청)
        if (recentRequests.length > 100) {
            suspiciousIPs.add(ip);
            RateLimitMonitor.recordRequest(ip, true, 'ddos');

            logger.error('DDoS 공격 패턴 감지', {
                ip,
                requestsPerMinute: recentRequests.length,
                path: req.path,
                userAgent: req.get('User-Agent')
            });

            return res.status(429).json({
                error: 'Suspicious activity detected. Access temporarily blocked.',
                type: 'ddos_protection',
                timestamp: new Date().toISOString()
            });
        }

        // 의심스러운 IP 추가 모니터링
        if (recentRequests.length > 50) {
            suspiciousIPs.add(ip);
            logger.warn('높은 요청 빈도 감지', {
                ip,
                requestsPerMinute: recentRequests.length,
                path: req.path
            });
        }

        RateLimitMonitor.recordRequest(ip, false);
        next();
    };
}

/**
 * 적응형 Rate Limiting (사용자 행동 기반)
 */
export function createAdaptiveRateLimit() {
    const userProfiles = new Map();

    return (req, res, next) => {
        const ip = req.ip;
        const userId = req.user?.id || ip;
        const now = Date.now();

        if (!userProfiles.has(userId)) {
            userProfiles.set(userId, {
                firstSeen: now,
                requestCount: 0,
                lastActivity: now,
                trustScore: 50, // 기본 신뢰 점수 (0-100)
                violations: 0
            });
        }

        const profile = userProfiles.get(userId);
        profile.requestCount++;
        profile.lastActivity = now;

        // 신뢰 점수 기반 적응형 제한
        const baseLimit = 100;
        const trustMultiplier = profile.trustScore / 50; // 0.2 ~ 2.0
        const adaptiveLimit = Math.floor(baseLimit * trustMultiplier);

        // 15분 윈도우에서 적응형 제한 체크
        const windowStart = now - 15 * 60 * 1000;
        if (profile.lastActivity > windowStart && profile.requestCount > adaptiveLimit) {
            profile.violations++;
            profile.trustScore = Math.max(0, profile.trustScore - 10);

            logger.warn('적응형 Rate Limit 위반', {
                userId,
                ip,
                trustScore: profile.trustScore,
                limit: adaptiveLimit,
                violations: profile.violations
            });

            return res.status(429).json({
                error: 'Rate limit exceeded based on usage pattern.',
                type: 'adaptive_rate_limit',
                retryAfter: 900,
                timestamp: new Date().toISOString()
            });
        }

        // 정상적인 사용 패턴이면 신뢰 점수 증가
        if (profile.requestCount % 50 === 0 && profile.violations === 0) {
            profile.trustScore = Math.min(100, profile.trustScore + 1);
        }

        next();
    };
}

/**
 * 도메인별 특화 Rate Limiting
 */
export const DomainRateLimits = {
    // Static 자원 관리
    static: {
        // CSS/JS 파일들 (매우 관대한 제한)
        assets: staticAssetsRateLimit,

        // 이미지 파일들 (관대한 제한)
        images: rateLimit(
            createRateLimitOptions({
                windowMs: 5 * 60 * 1000, // 5분
                max: 500, // 5분당 500회 이미지 요청
                message: 'Too many image requests, please try again later.'
            })
        ),

        // 업로드된 파일들 (중간 수준 제한)
        uploads: rateLimit(
            createRateLimitOptions({
                windowMs: 5 * 60 * 1000, // 5분
                max: 300, // 5분당 300회 업로드 파일 요청
                message: 'Too many file download requests, please try again later.'
            })
        )
    },

    // 사용자 도메인
    user: {
        login: rateLimit(
            createRateLimitOptions({
                windowMs: 15 * 60 * 1000,
                max: 5,
                message: 'Too many login attempts. Please try again in 15 minutes.',
                skipSuccessfulRequests: true,
                attackType: 'bruteForce'
            })
        ),

        registration: rateLimit(
            createRateLimitOptions({
                windowMs: 60 * 60 * 1000, // 1시간
                max: 3,
                message: 'Too many registration attempts. Please try again in 1 hour.',
                attackType: 'bruteForce'
            })
        ),

        passwordReset: passwordResetRateLimit,

        profile: rateLimit(
            createRateLimitOptions({
                windowMs: 15 * 60 * 1000,
                max: 30,
                message: 'Too many profile requests. Please try again later.'
            })
        )
    },

    // 작품 도메인
    artwork: {
        upload: uploadRateLimit,

        list: rateLimit(
            createRateLimitOptions({
                windowMs: 5 * 60 * 1000,
                max: 100,
                message: 'Too many artwork list requests. Please try again later.'
            })
        ),

        search: searchRateLimit,

        modify: rateLimit(
            createRateLimitOptions({
                windowMs: 15 * 60 * 1000,
                max: 20,
                message: 'Too many artwork modification requests. Please try again later.'
            })
        )
    },

    // 전시회 도메인
    exhibition: {
        list: rateLimit(
            createRateLimitOptions({
                windowMs: 5 * 60 * 1000,
                max: 50,
                message: 'Too many exhibition list requests. Please try again later.'
            })
        ),

        search: searchRateLimit,

        admin: rateLimit(
            createRateLimitOptions({
                windowMs: 15 * 60 * 1000,
                max: 100,
                message: 'Too many admin requests. Please try again later.'
            })
        )
    },

    // 관리자 도메인
    admin: {
        management: rateLimit(
            createRateLimitOptions({
                windowMs: 15 * 60 * 1000,
                max: 200,
                message: 'Too many admin management requests. Please try again later.'
            })
        ),

        reports: rateLimit(
            createRateLimitOptions({
                windowMs: 5 * 60 * 1000,
                max: 20,
                message: 'Too many report requests. Please try again later.'
            })
        )
    }
};

/**
 * 통합 Rate Limiting 설정 함수
 */
export function setupAdvancedRateLimiting(app) {
    // 1. 기본 보호 계층
    app.use(generalRateLimit);

    // 2. 슬로우 다운 미들웨어
    app.use(slowDownMiddleware);

    // 3. 고급 DDoS 보호
    app.use(createAdvancedDDoSProtection());

    // 4. 적응형 Rate Limiting
    app.use(createAdaptiveRateLimit());

    // 5. Static 자원별 세분화된 제한 (일반 API보다 우선 적용)
    app.use(['/css', '/js', '/assets'], DomainRateLimits.static.assets);
    app.use('/images', DomainRateLimits.static.images);
    app.use('/uploads', DomainRateLimits.static.uploads);

    // 6. API별 세분화된 제한
    app.use('/api/', apiRateLimit);

    // 7. 도메인별 특화 제한 적용
    // 사용자 인증 관련
    app.use(['/user/login', '/auth/login'], DomainRateLimits.user.login);
    app.use(['/user/', '/auth/register'], DomainRateLimits.user.registration);
    app.use(['/user/password/reset', '/auth/forgot-password'], DomainRateLimits.user.passwordReset);

    // 작품 관련
    app.use('/artwork/api/new', DomainRateLimits.artwork.upload);
    app.use('/artwork/api/list', DomainRateLimits.artwork.list);
    app.use(['/artwork/api/:id', '/artwork/api/exhibiting'], DomainRateLimits.artwork.modify);

    // 전시회 관련
    app.use('/exhibition/api/list', DomainRateLimits.exhibition.list);
    app.use('/exhibition/api/admin/', DomainRateLimits.exhibition.admin);

    // 관리자 관련
    app.use('/admin/', DomainRateLimits.admin.management);

    logger.success('고급 Rate Limiting 시스템 설정 완료 (Static 자원 포함)');
}

/**
 * Rate Limiting 상태 모니터링 엔드포인트용 미들웨어
 */
export function getRateLimitStats(req, res) {
    const stats = RateLimitMonitor.getStats();
    res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
    });
}

export default {
    generalRateLimit,
    apiRateLimit,
    authRateLimit,
    uploadRateLimit,
    searchRateLimit,
    slowDownMiddleware,
    DomainRateLimits,
    RateLimitMonitor,
    setupAdvancedRateLimiting,
    getRateLimitStats,
    createAdvancedDDoSProtection,
    createAdaptiveRateLimit,
    staticAssetsRateLimit
};
