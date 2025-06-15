/**
 * Redis 기반 캐시 매니저
 * 표준화된 캐시 작업을 위한 중앙 집중식 관리
 */

import { createCache } from 'cache-manager';
import redisStore from 'cache-manager-redis-store';
import config from '../../config/Config.js';
import logger from '../utils/Logger.js';
import redisClient from '../../infrastructure/redis/RedisClient.js';

// 모듈 로드 시점 디버깅
console.log('🔄 [CACHE] getCacheManager.js 모듈이 로드되었습니다');
logger.info('🔄 [CACHE] getCacheManager.js 모듈이 로드되었습니다');

class CacheManager {
    constructor() {
        this.config = config;
        this.environmentManager = config.getEnvironmentManager();
        this.cache = null;
        this.isInitialized = false;
        this.defaultTTL = 300; // 5분 기본 TTL

        this.init();
    }

    async init() {
        try {
            // 로컬 개발 환경이나 테스트 환경에서는 메모리 캐시 사용
            const shouldUseMemoryCache = !this.environmentManager.is('useRedisCache');

            if (shouldUseMemoryCache) {
                let reason = 'Redis 설정이 없어';
                if (this.environmentManager.is('isTest')) reason = '테스트 환경이므로';
                else if (this.environmentManager.is('isLocalDevelopment')) reason = '로컬 개발 환경이므로';

                logger.info(`${reason} 메모리 캐시 사용`, {
                    environment: this.environmentManager.getEnvironment(),
                    isRailwayDeployment: this.environmentManager.is('isRailwayDeployment'),
                    useRedisCache: this.environmentManager.is('useRedisCache')
                });
                this.cache = createCache({
                    store: 'memory',
                    max: 500,
                    ttl: this.defaultTTL * 1000 // 밀리초 단위로 변환
                });
            } else {
                // 기존 Redis 클라이언트 연결 확인 및 연결
                if (!redisClient.isClientConnected()) {
                    await redisClient.connect();
                }

                // Redis 설정을 EnvironmentManager에서 가져오기
                const redisSettings = this.environmentManager.getRedisConfig();
                const redisConfig = {
                    store: redisStore,
                    host: redisSettings.host,
                    port: redisSettings.port,
                    password: redisSettings.password,
                    db: redisSettings.db + 1, // 캐시용 별도 DB 사용 (기본 DB + 1)
                    ttl: this.defaultTTL,
                    max: 1000, // 최대 캐시 아이템 수
                    prefix: 'cache:', // 캐시 키 접두사
                    // 기존 연결된 Redis 클라이언트 재사용
                    redisInstance: redisClient.getClient()
                };

                this.cache = createCache(redisConfig);
            }

            this.isInitialized = true;
            logger.info('✅ CacheManager 초기화 완료', {
                backend: this.environmentManager.is('useRedisCache') ? 'Redis' : 'Memory',
                environment: this.environmentManager.getEnvironment(),
                defaultTTL: this.defaultTTL,
                prefix: 'cache:'
            });
        } catch (error) {
            logger.error('❌ CacheManager 초기화 실패', {
                error: error.message,
                stack: error.stack
            });

            // 폴백으로 메모리 캐시 사용
            try {
                this.cache = createCache({
                    store: 'memory',
                    max: 100,
                    ttl: this.defaultTTL * 1000 // 밀리초 단위로 변환
                });
                this.isInitialized = true;
                logger.warn('메모리 캐시로 폴백 완료');
            } catch (fallbackError) {
                logger.error('메모리 캐시 폴백도 실패', { error: fallbackError.message });
            }
        }
    }

    /**
     * 캐시에서 값 조회
     * @param {string} key - 캐시 키
     * @returns {Promise<any>} 캐시된 값 또는 null
     */
    async get(key) {
        if (!this.isInitialized) {
            logger.warn('CacheManager가 초기화되지 않음');
            return null;
        }

        try {
            const startTime = Date.now();
            const value = await this.cache.get(key);
            const duration = Date.now() - startTime;

            logger.debug('캐시 조회', {
                key,
                hit: value !== null && value !== undefined,
                duration: `${duration}ms`
            });

            return value;
        } catch (error) {
            logger.error('캐시 조회 실패', {
                key,
                error: error.message
            });
            return null;
        }
    }

    /**
     * 캐시에 값 저장
     * @param {string} key - 캐시 키
     * @param {any} value - 저장할 값
     * @param {number} ttl - TTL (초 단위, 선택사항)
     * @returns {Promise<boolean>} 성공 여부
     */
    async set(key, value, ttl = null) {
        if (!this.isInitialized) {
            logger.warn('CacheManager가 초기화되지 않음');
            return false;
        }

        try {
            const startTime = Date.now();
            // TTL을 밀리초로 변환
            const ttlMs = ttl ? ttl * 1000 : this.defaultTTL * 1000;
            await this.cache.set(key, value, ttlMs);
            const duration = Date.now() - startTime;

            logger.debug('캐시 저장', {
                key,
                ttl: ttl || this.defaultTTL,
                duration: `${duration}ms`,
                valueType: typeof value
            });

            return true;
        } catch (error) {
            logger.error('캐시 저장 실패', {
                key,
                error: error.message
            });
            return false;
        }
    }

    /**
     * 캐시에서 키 삭제
     * @param {string} key - 삭제할 키
     * @returns {Promise<boolean>} 성공 여부
     */
    async del(key) {
        if (!this.isInitialized) {
            logger.warn('CacheManager가 초기화되지 않음');
            return false;
        }

        try {
            const startTime = Date.now();
            await this.cache.del(key);
            const duration = Date.now() - startTime;

            logger.debug('캐시 삭제', {
                key,
                duration: `${duration}ms`
            });

            return true;
        } catch (error) {
            logger.error('캐시 삭제 실패', {
                key,
                error: error.message
            });
            return false;
        }
    }

    /**
     * 패턴에 맞는 키들을 삭제 (Redis만 지원)
     * @param {string} pattern - 삭제할 키 패턴 (예: "user:*")
     * @returns {Promise<number>} 삭제된 키 개수
     */
    async delByPattern(pattern) {
        if (!this.isInitialized) {
            logger.warn('CacheManager가 초기화되지 않음');
            return 0;
        }

        try {
            const startTime = Date.now();
            let deletedCount = 0;

            // Redis 스토어인 경우에만 패턴 삭제 지원
            if (this.cache.store && this.cache.store.getClient) {
                const client = this.cache.store.getClient();
                const keys = await client.keys(`cache:${pattern}`);

                if (keys.length > 0) {
                    deletedCount = await client.del(keys);
                }
            } else {
                logger.warn('패턴 삭제는 Redis 스토어에서만 지원됩니다');
            }

            const duration = Date.now() - startTime;
            logger.debug('패턴별 캐시 삭제', {
                pattern,
                deletedCount,
                duration: `${duration}ms`
            });

            return deletedCount;
        } catch (error) {
            logger.error('패턴별 캐시 삭제 실패', {
                pattern,
                error: error.message
            });
            return 0;
        }
    }

    /**
     * 캐시 존재 여부 확인
     * @param {string} key - 확인할 키
     * @returns {Promise<boolean>} 존재 여부
     */
    async has(key) {
        const value = await this.get(key);
        return value !== null && value !== undefined;
    }

    /**
     * 캐시 키 생성 헬퍼
     * @param {string} namespace - 네임스페이스
     * @param {string|number} id - 식별자
     * @param {string} suffix - 접미사 (선택사항)
     * @returns {string} 생성된 캐시 키
     */
    createKey(namespace, id, suffix = '') {
        const key = suffix ? `${namespace}:${id}:${suffix}` : `${namespace}:${id}`;
        return key;
    }

    /**
     * 래핑된 함수 실행 (캐시 미스 시 함수 실행 후 결과 캐싱)
     * @param {string} key - 캐시 키
     * @param {Function} fn - 실행할 함수
     * @param {number} ttl - TTL (초 단위)
     * @returns {Promise<any>} 함수 실행 결과
     */
    async wrap(key, fn, ttl = null) {
        if (!this.isInitialized) {
            logger.warn('CacheManager가 초기화되지 않음, 함수 직접 실행');
            return await fn();
        }

        try {
            return await this.cache.wrap(key, fn, ttl ? { ttl } : {});
        } catch (error) {
            logger.error('캐시 래핑 실패, 함수 직접 실행', {
                key,
                error: error.message
            });
            return await fn();
        }
    }

    /**
     * 캐시 통계 조회 (가능한 경우)
     * @returns {Promise<Object>} 캐시 통계
     */
    async getStats() {
        if (!this.isInitialized) {
            return { status: 'not_initialized' };
        }

        try {
            const stats = {
                status: 'active',
                backend: this.config.get('redis.host') ? 'Redis' : 'Memory',
                defaultTTL: this.defaultTTL,
                initialized: this.isInitialized
            };

            // Redis 스토어인 경우 추가 정보
            if (this.cache.store && this.cache.store.getClient) {
                const client = this.cache.store.getClient();
                const info = await client.info('memory');
                stats.redisMemory = info;
            }

            return stats;
        } catch (error) {
            logger.error('캐시 통계 조회 실패', { error: error.message });
            return { status: 'error', error: error.message };
        }
    }

    /**
     * 캐시 초기화 상태 확인
     * @returns {boolean} 초기화 여부
     */
    isReady() {
        return this.isInitialized;
    }
}

// 싱글톤 인스턴스
let cacheManagerInstance = null;

/**
 * CacheManager 싱글톤 인스턴스 반환
 * @returns {CacheManager} CacheManager 인스턴스
 */
function getCacheManager() {
    if (!cacheManagerInstance) {
        cacheManagerInstance = new CacheManager();
    }
    return cacheManagerInstance;
}

export default getCacheManager;
export { CacheManager };
