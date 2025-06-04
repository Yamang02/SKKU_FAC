import CacheService from '../../infrastructure/cache/CacheService.js';
import logger from '../utils/Logger.js';

/**
 * Express 캐시 미들웨어
 * HTTP 응답을 Redis에 캐싱하여 성능을 향상시킵니다.
 */
export default class CacheMiddleware {
    constructor() {
        this.cacheService = new CacheService();
    }

    /**
     * 캐시 미들웨어 생성
     * @param {Object} options - 캐시 옵션
     * @param {string} options.namespace - 캐시 네임스페이스
     * @param {number} options.ttl - TTL (초 단위)
     * @param {Function} options.keyGenerator - 캐시 키 생성 함수
     * @param {Function} options.condition - 캐시 조건 함수
     * @returns {Function} Express 미들웨어 함수
     */
    create(options = {}) {
        const {
            namespace = 'api',
            ttl = 300, // 기본 5분
            keyGenerator = this.defaultKeyGenerator,
            condition = this.defaultCondition
        } = options;

        return async (req, res, next) => {
            try {
                // 캐시 조건 확인
                if (!condition(req)) {
                    return next();
                }

                // 캐시 키 생성
                const cacheKey = keyGenerator(req);

                // 캐시에서 데이터 조회
                const cachedData = await this.cacheService.get(namespace, cacheKey);

                if (cachedData) {
                    logger.debug(`캐시 응답: ${namespace}:${cacheKey}`);
                    return res.json(cachedData);
                }

                // 원본 res.json 메서드 저장
                const originalJson = res.json.bind(res);

                // res.json 메서드 오버라이드
                res.json = (data) => {
                    // 성공적인 응답만 캐싱 (2xx 상태 코드)
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        // 비동기로 캐시 저장 (응답 속도에 영향 없음)
                        this.cacheService.set(namespace, cacheKey, data, ttl)
                            .catch(error => {
                                logger.error('캐시 저장 실패:', error);
                            });
                    }

                    return originalJson(data);
                };

                next();
            } catch (error) {
                logger.error('캐시 미들웨어 오류:', error);
                next(); // 캐시 오류가 있어도 요청은 계속 처리
            }
        };
    }

    /**
     * 기본 캐시 키 생성 함수
     * @param {Object} req - Express 요청 객체
     * @returns {string} 캐시 키
     */
    defaultKeyGenerator(req) {
        const { method, originalUrl, query, user } = req;
        const userId = user?.id || 'anonymous';
        const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : '';

        return `${method}:${originalUrl}:${userId}:${queryString}`;
    }

    /**
     * 기본 캐시 조건 함수
     * @param {Object} req - Express 요청 객체
     * @returns {boolean} 캐시 여부
     */
    defaultCondition(req) {
        // GET 요청만 캐싱
        return req.method === 'GET';
    }

    /**
     * 전시회 목록 캐시 미들웨어
     * @param {number} ttl - TTL (초 단위)
     * @returns {Function} Express 미들웨어
     */
    exhibitionList(ttl = 600) { // 10분
        return this.create({
            namespace: 'exhibition_list',
            ttl,
            keyGenerator: (req) => {
                const { page, limit, type, year, status, search, sort } = req.query;
                return `page:${page || 1}_limit:${limit || 10}_type:${type || 'all'}_year:${year || 'all'}_status:${status || 'all'}_search:${search || ''}_sort:${sort || 'latest'}`;
            }
        });
    }

    /**
     * 주요 전시회 캐시 미들웨어
     * @param {number} ttl - TTL (초 단위)
     * @returns {Function} Express 미들웨어
     */
    featuredExhibitions(ttl = 1800) { // 30분
        return this.create({
            namespace: 'featured_exhibitions',
            ttl,
            keyGenerator: (req) => {
                const { limit } = req.query;
                return `limit:${limit || 5}`;
            }
        });
    }

    /**
     * 작품 목록 캐시 미들웨어
     * @param {number} ttl - TTL (초 단위)
     * @returns {Function} Express 미들웨어
     */
    artworkList(ttl = 600) { // 10분
        return this.create({
            namespace: 'artwork_list',
            ttl,
            keyGenerator: (req) => {
                const { page, limit, exhibition, year, search, sort } = req.query;
                return `page:${page || 1}_limit:${limit || 12}_exhibition:${exhibition || 'all'}_year:${year || 'all'}_search:${search || ''}_sort:${sort || 'latest'}`;
            }
        });
    }

    /**
     * 주요 작품 캐시 미들웨어
     * @param {number} ttl - TTL (초 단위)
     * @returns {Function} Express 미들웨어
     */
    featuredArtworks(ttl = 1800) { // 30분
        return this.create({
            namespace: 'featured_artworks',
            ttl,
            keyGenerator: (req) => {
                const { limit } = req.query;
                return `limit:${limit || 6}`;
            }
        });
    }

    /**
     * 전시회 상세 캐시 미들웨어
     * @param {number} ttl - TTL (초 단위)
     * @returns {Function} Express 미들웨어
     */
    exhibitionDetail(ttl = 900) { // 15분
        return this.create({
            namespace: 'exhibition_detail',
            ttl,
            keyGenerator: (req) => {
                const { id } = req.params;
                return `id:${id}`;
            }
        });
    }

    /**
     * 작품 상세 캐시 미들웨어
     * @param {number} ttl - TTL (초 단위)
     * @returns {Function} Express 미들웨어
     */
    artworkDetail(ttl = 900) { // 15분
        return this.create({
            namespace: 'artwork_detail',
            ttl,
            keyGenerator: (req) => {
                const { id, slug } = req.params;
                return `id:${id || slug}`;
            }
        });
    }

    /**
     * 공지사항 목록 캐시 미들웨어
     * @param {number} ttl - TTL (초 단위)
     * @returns {Function} Express 미들웨어
     */
    noticeList(ttl = 1200) { // 20분
        return this.create({
            namespace: 'notice_list',
            ttl,
            keyGenerator: (req) => {
                const { page, limit, important } = req.query;
                return `page:${page || 1}_limit:${limit || 10}_important:${important || 'all'}`;
            }
        });
    }

    /**
     * 캐시 무효화 미들웨어
     * 데이터 변경 시 관련 캐시를 무효화합니다.
     * @param {string} type - 무효화할 캐시 타입
     * @returns {Function} Express 미들웨어
     */
    invalidate(type) {
        return async (req, res, next) => {
            // 원본 응답 메서드들 저장
            const originalJson = res.json.bind(res);
            const originalSend = res.send.bind(res);

            // 응답 후 캐시 무효화 처리
            const invalidateCache = async () => {
                try {
                    switch (type) {
                        case 'exhibition': {
                            const exhibitionId = req.params.id;
                            await this.cacheService.invalidateExhibitionCache(exhibitionId);
                            break;
                        }
                        case 'artwork': {
                            const artworkId = req.params.id;
                            await this.cacheService.invalidateArtworkCache(artworkId);
                            break;
                        }
                        case 'user': {
                            const userId = req.params.id || req.user?.id;
                            await this.cacheService.invalidateUserCache(userId);
                            break;
                        }
                        case 'notice':
                            await this.cacheService.invalidateNoticeCache();
                            break;
                        default:
                            logger.warn(`알 수 없는 캐시 무효화 타입: ${type}`);
                    }
                } catch (error) {
                    logger.error('캐시 무효화 오류:', error);
                }
            };

            // 응답 메서드 오버라이드
            res.json = (data) => {
                const result = originalJson(data);
                // 성공적인 응답 후 캐시 무효화
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    setImmediate(invalidateCache);
                }
                return result;
            };

            res.send = (data) => {
                const result = originalSend(data);
                // 성공적인 응답 후 캐시 무효화
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    setImmediate(invalidateCache);
                }
                return result;
            };

            next();
        };
    }
}

// 싱글톤 인스턴스 생성
const cacheMiddleware = new CacheMiddleware();
export { cacheMiddleware };
