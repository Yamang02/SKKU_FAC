/**
 * API 응답 캐싱 미들웨어
 * Express 응답을 Redis에 캐싱하여 성능 향상
 */

import getCacheManager from '../cache/getCacheManager.js';
import logger from '../utils/Logger.js';
import Config from '../../config/Config.js';

class CacheMiddleware {
    constructor() {
        this.cache = getCacheManager();
        this.config = Config.getInstance();
        this.defaultTTL = 300; // 5분
    }

    /**
     * API 응답 캐싱 미들웨어 생성
     * @param {object} options - 캐싱 옵션
     * @param {number} options.ttl - TTL (초)
     * @param {string} options.keyPrefix - 캐시 키 접두사
     * @param {function} options.condition - 캐싱 조건 함수
     * @param {Array} options.excludeMethods - 제외할 HTTP 메서드
     * @param {Array} options.includePaths - 포함할 경로 패턴
     * @param {Array} options.excludePaths - 제외할 경로 패턴
     * @param {boolean} options.varyOnUser - 사용자별 캐시 분리
     * @returns {function} Express 미들웨어 함수
     */
    create(options = {}) {
        const {
            ttl = this.defaultTTL,
            keyPrefix = 'api',
            condition = null,
            excludeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'],
            includePaths = [],
            excludePaths = ['/admin', '/auth', '/health', '/metrics'],
            varyOnUser = false
        } = options;

        return async (req, res, next) => {
            try {
                // HTTP 메서드 확인
                if (excludeMethods.includes(req.method)) {
                    return next();
                }

                // 경로 필터링
                if (!this.shouldCachePath(req.path, includePaths, excludePaths)) {
                    return next();
                }

                // 사용자 정의 조건 확인
                if (condition && !condition(req, res)) {
                    return next();
                }

                // 캐시 키 생성
                const cacheKey = this.generateCacheKey(req, keyPrefix, varyOnUser);

                // 캐시에서 조회
                const cachedResponse = await this.cache.get(cacheKey);
                if (cachedResponse) {
                    logger.debug('API 응답 캐시 히트', {
                        method: req.method,
                        path: req.path,
                        cacheKey,
                        userAgent: req.get('User-Agent')?.substring(0, 50)
                    });

                    // 캐시된 응답 반환
                    res.set(cachedResponse.headers);
                    res.set('X-Cache', 'HIT');
                    res.set('X-Cache-Key', cacheKey);
                    return res.status(cachedResponse.statusCode).json(cachedResponse.data);
                }

                // 응답 캐싱을 위한 래퍼 설정
                this.wrapResponse(req, res, next, cacheKey, ttl);
            } catch (error) {
                logger.warn('캐시 미들웨어 오류', {
                    error: error.message,
                    path: req.path,
                    method: req.method
                });
                next();
            }
        };
    }

    /**
     * 정적 캐싱 미들웨어 (긴 TTL)
     * 거의 변경되지 않는 데이터용
     */
    static(options = {}) {
        return this.create({
            ttl: 3600, // 1시간
            keyPrefix: 'static',
            ...options
        });
    }

    /**
     * 동적 캐싱 미들웨어 (짧은 TTL)
     * 자주 변경되는 데이터용
     */
    dynamic(options = {}) {
        return this.create({
            ttl: 60, // 1분
            keyPrefix: 'dynamic',
            ...options
        });
    }

    /**
     * 사용자별 캐싱 미들웨어
     * 인증된 사용자별로 다른 캐시
     */
    userSpecific(options = {}) {
        return this.create({
            ttl: 300, // 5분
            keyPrefix: 'user',
            varyOnUser: true,
            condition: req => req.user?.id, // 인증된 사용자만
            ...options
        });
    }

    /**
     * 목록 전용 캐싱 미들웨어
     * 페이지네이션된 목록용
     */
    list(options = {}) {
        return this.create({
            ttl: 120, // 2분
            keyPrefix: 'list',
            condition: req => {
                // 첫 페이지만 캐시 (성능상 이유)
                const page = parseInt(req.query.page) || 1;
                return page === 1;
            },
            ...options
        });
    }

    /**
     * 캐시 키 생성
     * @param {object} req - Express 요청 객체
     * @param {string} keyPrefix - 키 접두사
     * @param {boolean} varyOnUser - 사용자별 캐시 분리
     * @returns {string} 캐시 키
     */
    generateCacheKey(req, keyPrefix, varyOnUser) {
        const parts = [keyPrefix];

        // 경로 추가
        parts.push(req.path.replace(/\//g, '_'));

        // 쿼리 파라미터 추가 (정렬된 순서로)
        const queryKeys = Object.keys(req.query).sort();
        if (queryKeys.length > 0) {
            const queryString = queryKeys.map(key => `${key}=${req.query[key]}`).join('&');
            parts.push(`query_${queryString}`);
        }

        // 사용자 ID 추가 (사용자별 캐시인 경우)
        if (varyOnUser && req.user?.id) {
            parts.push(`user_${req.user.id}`);
        }

        // Accept 헤더 고려 (JSON vs HTML)
        const acceptHeader = req.get('Accept') || '';
        if (acceptHeader.includes('application/json')) {
            parts.push('json');
        } else if (acceptHeader.includes('text/html')) {
            parts.push('html');
        }

        return this.cache.createKey(...parts);
    }

    /**
     * 경로 캐싱 여부 확인
     * @param {string} path - 요청 경로
     * @param {Array} includePaths - 포함할 경로 패턴
     * @param {Array} excludePaths - 제외할 경로 패턴
     * @returns {boolean} 캐싱 여부
     */
    shouldCachePath(path, includePaths, excludePaths) {
        // 제외 경로 확인
        for (const excludePath of excludePaths) {
            if (path.startsWith(excludePath)) {
                return false;
            }
        }

        // 포함 경로가 명시된 경우 해당 경로만 캐시
        if (includePaths.length > 0) {
            return includePaths.some(includePath => path.startsWith(includePath));
        }

        return true;
    }

    /**
     * 응답 래핑 및 캐싱
     * @param {object} req - Express 요청 객체
     * @param {object} res - Express 응답 객체
     * @param {function} next - 다음 미들웨어 함수
     * @param {string} cacheKey - 캐시 키
     * @param {number} ttl - TTL (초)
     */
    wrapResponse(req, res, next, cacheKey, ttl) {
        const originalJson = res.json;
        const originalSend = res.send;
        const self = this;

        // JSON 응답 래핑
        res.json = function (data) {
            res.cacheResponse(data, this.statusCode, this.getHeaders(), cacheKey, ttl);
            return originalJson.call(this, data);
        };

        // 일반 응답 래핑
        res.send = function (data) {
            if (this.get('Content-Type')?.includes('application/json')) {
                try {
                    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
                    res.cacheResponse(jsonData, this.statusCode, this.getHeaders(), cacheKey, ttl);
                } catch (e) {
                    // JSON 파싱 실패 시 캐싱하지 않음
                }
            }
            return originalSend.call(this, data);
        };

        // 캐싱 함수 추가
        res.cacheResponse = async (data, statusCode, headers, cacheKey, ttl) => {
            try {
                // 성공 응답만 캐시
                if (statusCode >= 200 && statusCode < 300) {
                    const cacheData = {
                        data,
                        statusCode,
                        headers: self.getSerializableHeaders(headers),
                        timestamp: new Date().toISOString()
                    };

                    await self.cache.set(cacheKey, cacheData, ttl * 1000); // 밀리초로 변환

                    logger.debug('API 응답 캐시 저장', {
                        method: req.method,
                        path: req.path,
                        cacheKey,
                        ttl,
                        statusCode
                    });

                    // 헤더가 이미 전송되지 않은 경우에만 캐시 헤더 추가
                    if (!res.headersSent) {
                        res.set('X-Cache', 'MISS');
                        res.set('X-Cache-Key', cacheKey);
                    }
                }
            } catch (error) {
                logger.warn('응답 캐싱 실패', {
                    error: error.message,
                    cacheKey
                });
            }
        };

        next();
    }

    /**
     * 직렬화 가능한 헤더 추출
     * @param {object} headers - 응답 헤더
     * @returns {object} 직렬화 가능한 헤더
     */
    getSerializableHeaders(headers) {
        const serializable = {};

        // 함수가 아닌 헤더만 추출
        for (const [key, value] of Object.entries(headers)) {
            if (typeof value !== 'function') {
                serializable[key] = value;
            }
        }

        // 중요한 헤더 제외
        delete serializable['set-cookie'];
        delete serializable['authorization'];
        delete serializable['x-cache'];
        delete serializable['x-cache-key'];

        return serializable;
    }

    /**
     * 패턴으로 캐시 무효화
     * @param {string} pattern - 캐시 키 패턴 (glob 스타일)
     * @returns {Promise<number>} 삭제된 키 개수
     */
    async invalidatePattern(pattern) {
        try {
            const deletedCount = await this.cache.delByPattern(pattern);
            logger.info('패턴 기반 캐시 무효화', {
                pattern,
                deletedCount
            });
            return deletedCount;
        } catch (error) {
            logger.error('캐시 무효화 실패', {
                pattern,
                error: error.message
            });
            return 0;
        }
    }

    /**
     * 모든 캐시 무효화
     * @returns {Promise<boolean>} 성공 여부
     */
    async invalidateAll() {
        try {
            await this.cache.reset();
            logger.info('전체 캐시 무효화 완료');
            return true;
        } catch (error) {
            logger.error('전체 캐시 무효화 실패', {
                error: error.message
            });
            return false;
        }
    }
}

// 클래스와 기본 인스턴스를 모두 export
export { CacheMiddleware };
export default CacheMiddleware;
